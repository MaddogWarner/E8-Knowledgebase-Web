import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, '..');
const swiftRootArg = process.argv.find((arg) => arg.startsWith('--swift-root='))?.slice('--swift-root='.length);
const swiftRootInput = swiftRootArg ?? process.env.E8KB_SWIFT_SOURCE;
if (!swiftRootInput) {
  console.error(
    'Point the generator at the iOS Swift source:\n' +
      '  node scripts/generate-data.mjs --swift-root="/path/to/Essential 8 Knowledge Base"\n' +
      'or set the E8KB_SWIFT_SOURCE environment variable.'
  );
  process.exit(1);
}
const swiftRoot = path.resolve(swiftRootInput);
const out = (targetPath) => path.join(root, 'services/web/src', targetPath);
const swiftFileRoot = await fs.access(path.join(swiftRoot, 'EssentialControlsData.swift')).then(
  () => swiftRoot,
  () => path.join(swiftRoot, 'Essential 8 Knowledge Base')
);

const controlsSwift = await fs.readFile(`${swiftFileRoot}/EssentialControlsData.swift`, 'utf8');
const m365Swift = await fs.readFile(`${swiftFileRoot}/Microsoft365AdditionalControlsData.swift`, 'utf8');
const appSwift = await fs.readFile(`${swiftFileRoot}/AppInformation.swift`, 'utf8');
const auditPolicySwift = await fs.readFile(`${swiftFileRoot}/WindowsAuditPolicyData.swift`, 'utf8');

function skipWs(source, index) {
  while (/\s/.test(source[index] ?? '')) index += 1;
  return index;
}

function parseString(source, index) {
  if (source.startsWith('"""', index)) {
    let cursor = index + 3;
    let value = '';
    while (cursor < source.length) {
      if (source.startsWith('"""', cursor)) {
        const lines = value.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
        const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)?.[0].length ?? 0);
        const indent = indents.length > 0 ? Math.min(...indents) : 0;
        return [lines.map((line) => line.slice(Math.min(indent, line.length))).join('\n'), cursor + 3];
      }
      value += source[cursor];
      cursor += 1;
    }
    throw new Error('Unterminated Swift multiline string');
  }

  let cursor = index + 1;
  let value = '';

  while (cursor < source.length) {
    const character = source[cursor];
    if (character === '\\') {
      const next = source[cursor + 1];
      if (next === '\\') value += '\\';
      else if (next === '"') value += '"';
      else if (next === 'n') value += '\n';
      else value += `\\${next}`;
      cursor += 2;
      continue;
    }
    if (character === '"') {
      return [value, cursor + 1];
    }
    value += character;
    cursor += 1;
  }

  throw new Error('Unterminated Swift string');
}

function parseIdent(source, index) {
  let cursor = index;
  while (/[A-Za-z0-9_.]/.test(source[cursor] ?? '')) cursor += 1;
  return [source.slice(index, cursor), cursor];
}

function parseArray(source, index) {
  const items = [];
  let cursor = index + 1;

  while (true) {
    cursor = skipWs(source, cursor);
    if (source[cursor] === ']') return [items, cursor + 1];
    const [value, next] = parseValue(source, cursor);
    items.push(value);
    cursor = skipWs(source, next);
    if (source[cursor] === ',') {
      cursor += 1;
      continue;
    }
    if (source[cursor] === ']') return [items, cursor + 1];
    throw new Error(`Expected array separator at ${cursor}: ${source.slice(cursor, cursor + 40)}`);
  }
}

function parseCall(source, index) {
  const [name, afterName] = parseIdent(source, index);
  let cursor = skipWs(source, afterName);

  if (source[cursor] !== '(') return [{ kind: 'ident', name }, cursor];
  cursor += 1;

  const args = {};
  const positional = [];

  while (true) {
    cursor = skipWs(source, cursor);
    if (source[cursor] === ')') return [{ kind: 'call', name, args, positional }, cursor + 1];

    const before = cursor;
    const [label, afterLabel] = parseIdent(source, cursor);
    const possibleColon = skipWs(source, afterLabel);

    if (label && source[possibleColon] === ':') {
      const [value, next] = parseValue(source, skipWs(source, possibleColon + 1));
      args[label] = value;
      cursor = skipWs(source, next);
    } else {
      const [value, next] = parseValue(source, before);
      positional.push(value);
      cursor = skipWs(source, next);
    }

    if (source[cursor] === ',') {
      cursor += 1;
      continue;
    }
    if (source[cursor] === ')') return [{ kind: 'call', name, args, positional }, cursor + 1];
    throw new Error(`Expected call separator at ${cursor}: ${source.slice(cursor, cursor + 40)}`);
  }
}

function parseValue(source, index) {
  const cursor = skipWs(source, index);
  if (source[cursor] === '"') return parseString(source, cursor);
  if (source[cursor] === '[') return parseArray(source, cursor);
  if (/\d/.test(source[cursor] ?? '')) {
    let next = cursor;
    while (/\d/.test(source[next] ?? '')) next += 1;
    return [Number(source.slice(cursor, next)), next];
  }
  if (source.startsWith('nil', cursor)) return [null, cursor + 3];
  if (source.startsWith('true', cursor)) return [true, cursor + 4];
  if (source.startsWith('false', cursor)) return [false, cursor + 5];
  return parseCall(source, cursor);
}

function findCall(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${marker}`);

  const paren = source.indexOf('(', start);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let cursor = paren; cursor < source.length; cursor += 1) {
    const character = source[cursor];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === '(') depth += 1;
    if (character === ')') {
      depth -= 1;
      if (depth === 0) return source.slice(start, cursor + 1);
    }
  }

  throw new Error(`Unclosed call for ${marker}`);
}

function stepFromCall(call, controlId, level, index) {
  return {
    id: `${controlId}-${level}-${index + 1}`,
    title: call.args.title,
    description: call.args.description,
    osScope: (call.args.osScope?.name ?? '.both').replace(/^\./, ''),
    ismControls: call.args.ismControls ?? [],
    technicalDetails: call.args.technicalDetails
  };
}

function contentFromCall(call, controlId, level) {
  return {
    summary: call.args.summary,
    steps: call.args.steps.map((step, index) => stepFromCall(step, controlId, level, index)),
    gapNote: call.args.gapNote
  };
}

const controlNames = [
  'applicationControl',
  'patchApplications',
  'configureOfficeMacros',
  'userApplicationHardening',
  'restrictAdministrativePrivileges',
  'patchOperatingSystems',
  'multiFactorAuthentication',
  'regularBackups'
];

const iconMap = {
  'checkmark.shield': 'ShieldCheck',
  'arrow.down.app': 'DownloadCloud',
  'doc.text.magnifyingglass': 'FileSearch',
  'lock.shield': 'Lock',
  'person.badge.key': 'UserCog',
  'gearshape.2': 'Settings2',
  'key.horizontal': 'KeyRound',
  'externaldrive.badge.checkmark': 'DatabaseBackup'
};

const controls = controlNames.map((name) => {
  const text = findCall(controlsSwift, `static let ${name} = EssentialControl`);
  const [call] = parseCall(text, text.indexOf('EssentialControl'));
  const id = call.args.id;
  return {
    id,
    name: call.args.name,
    icon: iconMap[call.args.iconSystemName],
    overview: call.args.overview,
    ml0Description: call.args.ml0Description,
    ml1: contentFromCall(call.args.ml1, id, 'ml1'),
    ml2: contentFromCall(call.args.ml2, id, 'ml2'),
    ml3: contentFromCall(call.args.ml3, id, 'ml3')
  };
});

const ml0GenericDescription = controlsSwift.match(/static let ml0GenericDescription: String =\s*\n\s*"([^"]+)"/)?.[1];

await fs.writeFile(
  out('data/controls.ts'),
  `import type { EssentialControl, MaturityLevel } from '../types';\n\nexport const ml0GenericDescription = ${JSON.stringify(ml0GenericDescription)};\n\nexport const maturityLevels: Array<{ id: MaturityLevel; shortName: string; displayName: string }> = [\n  { id: 'ml1', shortName: 'ML1', displayName: 'Maturity Level 1' },\n  { id: 'ml2', shortName: 'ML2', displayName: 'Maturity Level 2' },\n  { id: 'ml3', shortName: 'ML3', displayName: 'Maturity Level 3' }\n];\n\nexport const controls: EssentialControl[] = ${JSON.stringify(controls, null, 2)};\n\nexport function getControl(controlId: number): EssentialControl | undefined {\n  return controls.find((control) => control.id === controlId);\n}\n\nexport function getLevelContent(control: EssentialControl, level: MaturityLevel) {\n  return control[level];\n}\n`
);

function parseSwiftArrayConst(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Missing ${marker}`);
  const equals = source.indexOf('=', start);
  const arrayStart = source.indexOf('[', equals);
  const [items] = parseArray(source, arrayStart);
  return items;
}

const recommendationMap = {
  '.success': 'Success',
  '.failure': 'Failure',
  '.both': 'Success & Failure',
  '.notRecommended': 'Not Recommended'
};

const auditPolicyOverview = auditPolicySwift.match(/static let overview = ([\s\S]*?)\n\n    static let entries/)?.[1];
if (!auditPolicyOverview) throw new Error('Missing audit policy overview');
const [auditPolicyOverviewValue] = parseValue(auditPolicySwift, auditPolicySwift.indexOf(auditPolicyOverview));
const auditPolicyEntries = parseSwiftArrayConst(auditPolicySwift, 'static let entries').map((entry) => ({
  id: entry.args.id,
  category: entry.args.category,
  name: entry.args.name,
  description: entry.args.description,
  recommendation: recommendationMap[entry.args.recommendation.name],
  considerations: entry.args.considerations,
  domainControllerOnly: entry.args.domainControllerOnly
}));

await fs.writeFile(
  out('data/auditPolicy.ts'),
  `export type AuditRecommendation = 'Success' | 'Failure' | 'Success & Failure' | 'Not Recommended';\n\nexport interface AuditPolicyEntry {\n  id: string;\n  category: string;\n  name: string;\n  description: string;\n  recommendation: AuditRecommendation;\n  considerations: string;\n  domainControllerOnly: boolean;\n}\n\nexport const auditPolicyOverview = ${JSON.stringify(auditPolicyOverviewValue)};\n\nexport const auditPolicyEntries: AuditPolicyEntry[] = ${JSON.stringify(auditPolicyEntries, null, 2)};\n`
);

function parseProtectionArrays(swift, functionName) {
  const start = swift.indexOf(`private static func ${functionName}`);
  const nextFunction = swift.indexOf('private static func', start + 20);
  const body = swift.slice(start, nextFunction > -1 ? nextFunction : swift.length);
  const cases = {};
  const caseRegex = /case (\d+):\s*return \[/g;
  let match;

  while ((match = caseRegex.exec(body))) {
    const id = Number(match[1]);
    const arrayStart = body.indexOf('[', match.index);
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let cursor = arrayStart; cursor < body.length; cursor += 1) {
      const character = body[cursor];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') {
        inString = true;
        continue;
      }
      if (character === '[') depth += 1;
      if (character === ']') {
        depth -= 1;
        if (depth === 0) {
          const [items] = parseArray(body, arrayStart);
          cases[id] = items.map((item) => ({
            title: item.args.title,
            coverage: item.args.coverage.replace(/\\\(level\.shortName\)/g, '${levelShortName}'),
            basicSettings: item.args.basicSettings
          }));
          caseRegex.lastIndex = cursor;
          break;
        }
      }
    }
  }

  return cases;
}

const e3P1Protections = parseProtectionArrays(m365Swift, 'e3P1Protections');
const p2IdentityProtections = parseProtectionArrays(m365Swift, 'p2IdentityProtections');
const e5Protections = parseProtectionArrays(m365Swift, 'e5Protections');

await fs.writeFile(
  out('data/m365.ts'),
  `import type { MaturityLevel, Microsoft365AdditionalProtection, Microsoft365LicenseMode } from '../types';\n\ntype ProtectionTemplate = Omit<Microsoft365AdditionalProtection, 'coverage'> & { coverage: string };\ntype ProtectionMap = Record<number, ProtectionTemplate[]>;\n\nexport const licenseModes: Record<Microsoft365LicenseMode, { displayName: string; shortName: string; description: string; baseSelection: 'none' | 'e3' | 'e5' }> = {\n  none: {\n    displayName: 'None',\n    shortName: 'None',\n    description: 'No Microsoft 365 or Defender additions are shown in the control pages.',\n    baseSelection: 'none'\n  },\n  e3P1: {\n    displayName: 'Microsoft 365 E3 + Entra ID P1',\n    shortName: 'E3 + P1',\n    description: 'Shows additional and partial protections commonly available with Microsoft 365 E3, including Entra ID P1, Intune Plan 1 and Defender for Endpoint Plan 1.',\n    baseSelection: 'e3'\n  },\n  e3P2: {\n    displayName: 'Microsoft 365 E3 + Entra ID P2',\n    shortName: 'E3 + P2',\n    description: 'Shows Microsoft 365 E3 protections plus Entra ID P2 identity protections such as risk-based Conditional Access and Privileged Identity Management.',\n    baseSelection: 'e3'\n  },\n  e5: {\n    displayName: 'Microsoft 365 E5',\n    shortName: 'E5',\n    description: 'Shows the Microsoft 365 E5 security stack, including Entra ID P2, Defender for Endpoint Plan 2, Defender for Office 365 Plan 2, Defender for Identity and Defender for Cloud Apps.',\n    baseSelection: 'e5'\n  }\n};\n\nconst e3P1Protections: ProtectionMap = ${JSON.stringify(e3P1Protections, null, 2)};\n\nconst p2IdentityProtections: ProtectionMap = ${JSON.stringify(p2IdentityProtections, null, 2)};\n\nconst e5Protections: ProtectionMap = ${JSON.stringify(e5Protections, null, 2)};\n\nconst levelShortNames: Record<MaturityLevel, string> = { ml1: 'ML1', ml2: 'ML2', ml3: 'ML3' };\n\nfunction materialise(items: ProtectionTemplate[] | undefined, level: MaturityLevel): Microsoft365AdditionalProtection[] {\n  const levelShortName = levelShortNames[level];\n  return (items ?? []).map((item) => ({\n    ...item,\n    coverage: item.coverage.replaceAll('$' + '{levelShortName}', levelShortName)\n  }));\n}\n\nexport function protections(controlId: number, level: MaturityLevel, licenseMode: Microsoft365LicenseMode): Microsoft365AdditionalProtection[] {\n  if (licenseMode === 'none') {\n    return [];\n  }\n\n  const additions = materialise(e3P1Protections[controlId], level);\n\n  if (licenseMode === 'e3P2' || licenseMode === 'e5') {\n    additions.push(...materialise(p2IdentityProtections[controlId], level));\n  }\n\n  if (licenseMode === 'e5') {\n    additions.push(...materialise(e5Protections[controlId], level));\n  }\n\n  return additions;\n}\n`
);

function swiftConst(name) {
  const match = appSwift.match(new RegExp(`static let ${name}(?:: [^=]+)? = "([\\s\\S]*?)"`));
  if (!match) throw new Error(`Missing ${name}`);
  return match[1];
}

function parseLinks(arrayName) {
  const start = appSwift.indexOf(`static let ${arrayName}`);
  const equals = appSwift.indexOf('=', start);
  const arrayStart = appSwift.indexOf('[', equals);
  let depth = 0;

  for (let cursor = arrayStart; cursor < appSwift.length; cursor += 1) {
    if (appSwift[cursor] === '[') depth += 1;
    if (appSwift[cursor] === ']') {
      depth -= 1;
      if (depth === 0) {
        const text = appSwift.slice(arrayStart, cursor + 1);
        return [...text.matchAll(/title:\s*"([^"]+)",[\s\S]*?url:\s*referenceURL\("([^"]+)"\)/g)].map((link) => ({
          title: link[1],
          url: link[2]
        }));
      }
    }
  }

  return [];
}

const privacyLink = appSwift.match(/static let privacyPolicyLink = ReferenceLink\(\s*\n\s*title: "([^"]+)",\s*\n\s*url: referenceURL\("([^"]+)"\)/);
const referenceLinks = [
  ...parseLinks('referenceLinks'),
  {
    title: 'E8 hardening audit & policy compliance checker (GitHub)',
    url: 'https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker'
  }
];

await fs.writeFile(
  out('data/appInfo.ts'),
  `import type { ReferenceLink } from '../types';\n\nexport const appInfo = {\n  aboutTitle: ${JSON.stringify(swiftConst('aboutTitle'))},\n  aboutDescription: ${JSON.stringify(swiftConst('aboutDescription'))},\n  contentScope: ${JSON.stringify(swiftConst('contentScope'))},\n  aboutMeTitle: ${JSON.stringify(swiftConst('aboutMeTitle'))},\n  aboutMeDescription: ${JSON.stringify(swiftConst('aboutMeDescription'))},\n  authorLinks: ${JSON.stringify(parseLinks('authorLinks'), null, 2)} satisfies ReferenceLink[],\n  privacyTitle: ${JSON.stringify(swiftConst('privacyTitle'))},\n  privacyPolicy: ${JSON.stringify(swiftConst('privacyPolicy'))},\n  privacyPolicyLink: ${JSON.stringify({ title: privacyLink[1], url: privacyLink[2] }, null, 2)} satisfies ReferenceLink,\n  referenceLinks: ${JSON.stringify(referenceLinks, null, 2)} satisfies ReferenceLink[]\n};\n`
);

console.log(`Generated ${controls.length} controls`);
