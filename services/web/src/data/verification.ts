export interface VerificationDetail {
  command: string;
  note?: string;
}

export const verificationDetails: Record<string, VerificationDetail[]> = {};
