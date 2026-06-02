import type { MaturityLevel, Microsoft365AdditionalProtection, Microsoft365LicenseMode } from '../types';

type ProtectionTemplate = Omit<Microsoft365AdditionalProtection, 'coverage'> & { coverage: string };
type ProtectionMap = Record<number, ProtectionTemplate[]>;

export const licenseModes: Record<Microsoft365LicenseMode, { displayName: string; shortName: string; description: string; baseSelection: 'none' | 'e3' | 'e5' }> = {
  none: {
    displayName: 'None',
    shortName: 'None',
    description: 'No Microsoft 365 or Defender additions are shown in the control pages.',
    baseSelection: 'none'
  },
  e3P1: {
    displayName: 'Microsoft 365 E3 + Entra ID P1',
    shortName: 'E3 + P1',
    description: 'Shows additional and partial protections commonly available with Microsoft 365 E3, including Entra ID P1, Intune Plan 1 and Defender for Endpoint Plan 1.',
    baseSelection: 'e3'
  },
  e3P2: {
    displayName: 'Microsoft 365 E3 + Entra ID P2',
    shortName: 'E3 + P2',
    description: 'Shows Microsoft 365 E3 protections plus Entra ID P2 identity protections such as risk-based Conditional Access and Privileged Identity Management.',
    baseSelection: 'e3'
  },
  e5: {
    displayName: 'Microsoft 365 E5',
    shortName: 'E5',
    description: 'Shows the Microsoft 365 E5 security stack, including Entra ID P2, Defender for Endpoint Plan 2, Defender for Office 365 Plan 2, Defender for Identity and Defender for Cloud Apps.',
    baseSelection: 'e5'
  }
};

const e3P1Protections: ProtectionMap = {
  "1": [
    {
      "title": "Defender for Endpoint P1 attack surface reduction",
      "coverage": "Partially supports Application Control ${levelShortName} by reducing common execution paths, but it does not replace AppLocker or WDAC allow-listing.",
      "basicSettings": [
        "Microsoft Defender portal: Endpoints > Configuration management > Attack surface reduction rules",
        "Enable ASR rules that block executable content from email, webmail and Office child processes",
        "Use Intune endpoint security policies to deploy Defender Antivirus, firewall and attack surface reduction baselines"
      ]
    }
  ],
  "2": [
    {
      "title": "Intune app inventory and update deployment",
      "coverage": "Partially supports Patch Applications ${levelShortName} by improving visibility and deployment control for managed apps.",
      "basicSettings": [
        "Intune admin center: Apps > Monitor > Discovered apps",
        "Deploy supported Microsoft Store, Win32 and Microsoft 365 Apps updates through Intune",
        "Use device compliance reports to identify stale or unmanaged endpoints"
      ]
    }
  ],
  "3": [
    {
      "title": "Cloud-managed Office macro controls",
      "coverage": "Supports Configure Microsoft Office Macros ${levelShortName} by applying Office policy settings through Intune instead of only Group Policy.",
      "basicSettings": [
        "Intune admin center: Devices > Configuration > Settings catalog > Microsoft Office security settings",
        "Block macros from running in Office files from the internet",
        "Disable unsigned VBA macros and require trusted locations to be explicitly controlled"
      ]
    }
  ],
  "4": [
    {
      "title": "Defender for Endpoint P1 web and network protection",
      "coverage": "Supports User Application Hardening ${levelShortName} by adding managed browser, network and endpoint hardening controls.",
      "basicSettings": [
        "Microsoft Defender portal: Settings > Endpoints > Advanced features > Network protection = On",
        "Deploy ASR rules for Office, script and executable abuse paths",
        "Use Intune security baselines for Microsoft Edge and Defender Antivirus"
      ]
    }
  ],
  "5": [
    {
      "title": "Entra ID P1 Conditional Access for administrator access",
      "coverage": "Partially supports Restrict Administrative Privileges ${levelShortName} by enforcing access conditions for cloud admin roles; it does not remove local admin rights by itself.",
      "basicSettings": [
        "Entra admin center: Protection > Conditional Access > New policy",
        "Require MFA for all administrator roles",
        "Block legacy authentication and require compliant or hybrid joined devices for admin portals"
      ]
    }
  ],
  "6": [
    {
      "title": "Intune update rings and compliance reporting",
      "coverage": "Supports Patch Operating Systems ${levelShortName} for enrolled Windows endpoints by managing update cadence and restart behaviour.",
      "basicSettings": [
        "Intune admin center: Devices > Windows > Update rings for Windows 10 and later",
        "Set quality update deferrals, deadlines and grace periods",
        "Use compliance policies to mark devices non-compliant when minimum OS versions are not met"
      ]
    }
  ],
  "7": [
    {
      "title": "Entra ID P1 Conditional Access MFA",
      "coverage": "Supports Multi-factor Authentication ${levelShortName} for Microsoft 365 and Entra-integrated apps.",
      "basicSettings": [
        "Entra admin center: Protection > Conditional Access > New policy",
        "Require MFA for administrators and users accessing Microsoft 365 cloud apps",
        "Exclude emergency access accounts and monitor sign-in logs during rollout"
      ]
    }
  ],
  "8": [
    {
      "title": "OneDrive known folder move and cloud retention",
      "coverage": "Partially supports Regular Backups ${levelShortName} for user files stored in Microsoft 365, but it is not a full endpoint or server backup replacement.",
      "basicSettings": [
        "Intune admin center: Settings catalog > OneDrive > Silently move Windows known folders to OneDrive",
        "Microsoft Purview portal: Data lifecycle management > Retention policies for SharePoint and OneDrive",
        "Keep separate backup coverage for servers, line-of-business data and non-synced endpoint paths"
      ]
    }
  ]
};

const p2IdentityProtections: ProtectionMap = {
  "5": [
    {
      "title": "Entra ID P2 Privileged Identity Management",
      "coverage": "Supports Restrict Administrative Privileges ${levelShortName} for cloud roles by making privileged access just-in-time, time-bound and approval-aware.",
      "basicSettings": [
        "Entra admin center: Identity governance > Privileged Identity Management",
        "Make admin role assignments eligible instead of permanent",
        "Require MFA, justification and approval for high-impact role activation"
      ]
    }
  ],
  "7": [
    {
      "title": "Entra ID P2 risk-based access controls",
      "coverage": "Supports Multi-factor Authentication ${levelShortName} by adapting MFA and access decisions to user and sign-in risk.",
      "basicSettings": [
        "Entra admin center: Protection > Conditional Access > User risk and sign-in risk policies",
        "Require phishing-resistant MFA or password reset for high-risk users",
        "Monitor Identity Protection risk detections before enforcing tenant-wide policies"
      ]
    }
  ]
};

const e5Protections: ProtectionMap = {
  "1": [
    {
      "title": "Defender for Endpoint P2 investigation and hunting",
      "coverage": "Adds detection, investigation and response around Application Control ${levelShortName}, but WDAC or AppLocker remain the enforcement controls.",
      "basicSettings": [
        "Microsoft Defender portal: Endpoints > Advanced features > Enable EDR in block mode where appropriate",
        "Use advanced hunting to find script, LOLBin and unsigned executable activity",
        "Review device timeline and incidents for blocked or suspicious execution attempts"
      ]
    }
  ],
  "2": [
    {
      "title": "Defender Vulnerability Management core capabilities",
      "coverage": "Supports Patch Applications ${levelShortName} with continuous software inventory, exposure visibility and security recommendations.",
      "basicSettings": [
        "Microsoft Defender portal: Endpoints > Vulnerability management > Recommendations",
        "Prioritise exposed applications with known exploited vulnerabilities",
        "Track remediation status after app updates are deployed"
      ]
    }
  ],
  "3": [
    {
      "title": "Defender for Office 365 Plan 2 attachment and link protection",
      "coverage": "Adds email and collaboration protection around macro-borne threats for Configure Microsoft Office Macros ${levelShortName}.",
      "basicSettings": [
        "Microsoft Defender portal: Email & collaboration > Policies & rules > Threat policies",
        "Enable Safe Attachments and Safe Links using Standard or Strict preset security policies",
        "Use Threat Explorer and AIR to investigate malicious Office documents"
      ]
    }
  ],
  "4": [
    {
      "title": "Defender for Cloud Apps session and app governance",
      "coverage": "Partially supports User Application Hardening ${levelShortName} by controlling risky cloud app sessions and unsanctioned SaaS usage.",
      "basicSettings": [
        "Microsoft Defender portal: Cloud Apps > Policies > App discovery policies",
        "Sanction approved cloud apps and mark risky apps as unsanctioned",
        "Use Conditional Access App Control for monitored or blocked browser sessions"
      ]
    }
  ],
  "5": [
    {
      "title": "Defender for Identity privileged account monitoring",
      "coverage": "Adds detection around Restrict Administrative Privileges ${levelShortName} by monitoring identity abuse and lateral movement signals.",
      "basicSettings": [
        "Microsoft Defender portal: Settings > Identities > Sensors",
        "Deploy Defender for Identity sensors to domain controllers",
        "Review identity security posture recommendations for privileged accounts"
      ]
    }
  ],
  "6": [
    {
      "title": "Defender for Endpoint P2 OS exposure management",
      "coverage": "Supports Patch Operating Systems ${levelShortName} by highlighting missing OS updates and exposed devices.",
      "basicSettings": [
        "Microsoft Defender portal: Endpoints > Vulnerability management > Weaknesses",
        "Filter recommendations by operating system and exposed devices",
        "Use remediation tasks to coordinate patching with endpoint administrators"
      ]
    }
  ],
  "7": [
    {
      "title": "E5 identity and cloud-app signal integration",
      "coverage": "Enhances Multi-factor Authentication ${levelShortName} with Entra ID P2 risk, Defender for Cloud Apps session controls and Defender XDR incident context.",
      "basicSettings": [
        "Use Conditional Access policies with sign-in risk, user risk and session controls",
        "Require phishing-resistant MFA for administrators and high-risk access paths",
        "Review Defender XDR incidents that combine identity, endpoint and cloud app signals"
      ]
    }
  ],
  "8": [
    {
      "title": "Purview and audit support for Microsoft 365 data recovery",
      "coverage": "Partially supports Regular Backups ${levelShortName} for Microsoft 365 data governance and investigation, but does not replace immutable backup storage.",
      "basicSettings": [
        "Microsoft Purview portal: Data lifecycle management > Retention labels and policies",
        "Enable audit search and review high-impact deletion or exfiltration events",
        "Use separate backup products or storage controls for immutable recovery requirements"
      ]
    }
  ]
};

const levelShortNames: Record<MaturityLevel, string> = { ml1: 'ML1', ml2: 'ML2', ml3: 'ML3' };

function materialise(items: ProtectionTemplate[] | undefined, level: MaturityLevel): Microsoft365AdditionalProtection[] {
  const levelShortName = levelShortNames[level];
  return (items ?? []).map((item) => ({
    ...item,
    coverage: item.coverage.replaceAll('$' + '{levelShortName}', levelShortName)
  }));
}

export function protections(controlId: number, level: MaturityLevel, licenseMode: Microsoft365LicenseMode): Microsoft365AdditionalProtection[] {
  if (licenseMode === 'none') {
    return [];
  }

  const additions = materialise(e3P1Protections[controlId], level);

  if (licenseMode === 'e3P2' || licenseMode === 'e5') {
    additions.push(...materialise(p2IdentityProtections[controlId], level));
  }

  if (licenseMode === 'e5') {
    additions.push(...materialise(e5Protections[controlId], level));
  }

  return additions;
}
