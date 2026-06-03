import type { ReferenceLink } from '../types';

export const appInfo = {
  aboutTitle: "About Essential 8",
  aboutDescription: "Essential 8 Knowledge Base is designed to give administrators just the technical details they need for each Essential Eight control as a quick reference.",
  contentScope: "The guidance is scoped to practical Windows administration details and should be checked against the current ASD Essential Eight Maturity Model before implementation.",
  aboutMeTitle: "About Me",
  aboutMeDescription: "MadDogWarner is not affiliated with ASD or Microsoft in any way. This project is a passion project built to provide a clear, easy to understand security tool that helps technical teams uplift Essential Eight practices to the masses.",
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
  privacyPolicy: "Essential 8 Knowledge Base does not collect, record, store, transmit, or share any user data. The app does not require account access and does not request access to the microphone, camera, location services, contacts, photos, or other device sensors.",
  privacyPolicyLink: {
  "title": "App privacy policy",
  "url": "https://maddogwarner.com/privacy/essential-8-knowledge-base/"
} satisfies ReferenceLink,
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
    "title": "E8 hardening audit & policy compliance checker (GitHub)",
    "url": "https://github.com/MaddogWarner/e8-hardening-audit-policy-compliance-checker"
  }
] satisfies ReferenceLink[]
};
