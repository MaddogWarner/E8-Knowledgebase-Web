export type MaturityLevel = 'ml1' | 'ml2' | 'ml3';
export type MaturityLevelId = MaturityLevel;

export interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  ismControls: string[];
  technicalDetails: string[];
}

export type StepStateValue = 'implemented' | 'notApplicable' | 'notImplemented';

export interface StepStatus {
  state: StepStateValue;
  reason?: string;
}

export interface MaturityLevelContent {
  summary: string;
  steps: ImplementationStep[];
  gapNote: string | null;
}

export interface EssentialControl {
  id: number;
  name: string;
  icon: string;
  overview: string;
  ml0Description: string;
  ml1: MaturityLevelContent;
  ml2: MaturityLevelContent;
  ml3: MaturityLevelContent;
}

export type Microsoft365LicenseMode = 'none' | 'e3P1' | 'e3P2' | 'e5';

export interface Microsoft365AdditionalProtection {
  title: string;
  coverage: string;
  basicSettings: string[];
}

export interface ReferenceLink {
  title: string;
  url: string;
}
