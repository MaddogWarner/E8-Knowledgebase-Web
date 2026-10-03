import type { ReferenceLink } from '../types';

export const appInfo = {
  aboutTitle: "About Essential 8",
  aboutDescription: "Essential 8 Knowledge Base is designed to give administrators just the technical details they need for each Essential Eight control as a quick reference.",
  contentScope: "The guidance is scoped to practical Windows administration details and should be checked against the current ASD Essential Eight Maturity Model before implementation.",
  aboutMeTitle: "About Me",
  aboutMeDescription: "MadDogWarner is not affiliated with ASD, Microsoft or The MITRE Corporation in any way. This project is a passion project built to provide a clear, easy to understand security tool that helps technical teams uplift Essential Eight practices to the masses.",
  authorLinks: [
  {
    "title": "MadDogWarner website",
    "url": "https://maddogwarner.com"
  },
  {
    "title": "MadDogWarner GitHub",
    "url": "https://github.com/MadDogWarner"
  }
] satisfies ReferenceLink[],
  privacyTitle: "Privacy Policy",
  privacyPolicy: "Essential 8 Knowledge Base has no accounts, no analytics, and makes no network requests of its own — nothing you enter is ever sent to the developer or any third party. Your assessment progress, notes and audit history are stored only in this browser's local storage. That data leaves the browser only if you export a backup or report yourself. Uploaded audit CSV files are processed in memory and are never stored. External reference links open in a new tab. The app does not request access to the microphone, camera, location, or other device sensors.",
  privacyPolicyLink: {
  "title": "App privacy policy",
  "url": "https://maddogwarner.com/privacy/essential-8-knowledge-base/"
} satisfies ReferenceLink,
  attackDisclaimerShort: "Derived mapping — not an ASD or MITRE product.",
  attackDisclaimer: "ASD does not publish an Essential Eight to MITRE ATT&CK mapping. These technique links are derived and curated by the author from the ASD Essential Eight to ISM mapping and MITRE ATT&CK technique descriptions, and are provided as an aid to understanding — not as an authoritative or certified mapping. Verify against your own threat model before relying on them.",
  attackAttribution: "© 2026 The MITRE Corporation. This work is reproduced and distributed with the permission of The MITRE Corporation. MITRE ATT&CK® and ATT&CK® are registered trademarks of The MITRE Corporation.",
  attackCoverageCaveat: "MITRE does not claim ATT&CK enumerates every possible adversary behaviour, and using ATT&CK does not guarantee full defensive coverage. A technique shown as covered means the mapped implementation steps are complete — not that your environment is defended against it.",
  attackVersionNote: "Mapped against MITRE ATT&CK® Enterprise v19.1, released 28 April 2026.",
  referenceLinks: [
  {
    "title": "ASD Essential Eight maturity model",
    "url": "https://www.cyber.gov.au/business-government/asds-cyber-security-frameworks/essential-eight/essential-eight-maturity-model"
  },
  {
    "title": "ASD Information Security Manual",
    "url": "https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/ism"
  },
  {
    "title": "Microsoft Defender for Endpoint plans",
    "url": "https://learn.microsoft.com/en-us/microsoft-365/security/defender-endpoint/defender-endpoint-plan-1-2"
  },
  {
    "title": "Microsoft Defender service description",
    "url": "https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-defender-service-description"
  },
  {
    "title": "Microsoft Entra Conditional Access",
    "url": "https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview"
  },
  {
    "title": "Microsoft Entra MFA licensing",
    "url": "https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-licensing"
  },
  {
    "title": "MITRE ATT&CK Enterprise matrix",
    "url": "https://attack.mitre.org/"
  },
  {
    "title": "MITRE ATT&CK terms of use",
    "url": "https://attack.mitre.org/resources/legal-and-branding/terms-of-use/"
  },
  {
    "title": "E8 hardening audit & policy compliance checker (GitHub)",
    "url": "https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker"
  }
] satisfies ReferenceLink[]
};
