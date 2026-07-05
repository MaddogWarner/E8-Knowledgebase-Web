import { auditPolicyEntries } from '../data/auditPolicy';
import { controls, getLevelContent, maturityLevels } from '../data/controls';
import type { MaturityLevel } from '../types';

export interface SearchResult {
  id: string;
  title: string;
  context: string;
  path: string;
}

interface SearchDocument extends SearchResult {
  haystack: string;
}

const documents: SearchDocument[] = controls.flatMap((control) => {
  const base: SearchDocument[] = [
    {
      id: `control-${control.id}`,
      title: control.name,
      context: control.overview,
      path: `/control/${control.id}/ml1`,
      haystack: `${control.name} ${control.overview} ${control.ml0Description}`.toLowerCase()
    }
  ];

  const levelDocs = maturityLevels.flatMap(({ id: level }) => {
    const content = getLevelContent(control, level);
    const summaryDoc: SearchDocument = {
      id: `${control.id}-${level}-summary`,
      title: `${control.name} ${level.toUpperCase()}`,
      context: content.summary,
      path: `/control/${control.id}/${level}`,
      haystack: `${control.name} ${level} ${content.summary}`.toLowerCase()
    };

    const stepDocs = content.steps.map((step) => ({
      id: step.id,
      title: step.title,
      context: `${control.name} · ${level.toUpperCase()}${step.ismControls.length > 0 ? ` · ${step.ismControls.join(' ')}` : ''}`,
      path: `/control/${control.id}/${level}#${step.id}`,
      haystack: `${control.name} ${level} ${step.title} ${step.description} ${step.ismControls.join(' ')} ${step.technicalDetails.join(' ')}`.toLowerCase()
    }));

    return [summaryDoc, ...stepDocs];
  });

  return [...base, ...levelDocs];
}).concat(auditPolicyEntries.map((entry) => ({
  id: `audit-policy-${entry.id}`,
  title: entry.name,
  context: `Windows Audit Policy · ${entry.category} · ${entry.recommendation}`,
  path: `/audit-policy#${entry.id}`,
  haystack: `${entry.name} ${entry.category} ${entry.description} ${entry.considerations} ${entry.recommendation}`.toLowerCase()
})));

export function isMaturityLevel(value: string | undefined): value is MaturityLevel {
  return value === 'ml1' || value === 'ml2' || value === 'ml3';
}

export function search(query: string): SearchResult[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return documents
    .map((document) => {
      const score = terms.reduce((total, term) => {
        if (!document.haystack.includes(term)) return total;
        return total + (document.title.toLowerCase().includes(term) ? 3 : 1);
      }, 0);
      return { document, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ document }) => ({
      id: document.id,
      title: document.title,
      context: document.context,
      path: document.path
    }));
}
