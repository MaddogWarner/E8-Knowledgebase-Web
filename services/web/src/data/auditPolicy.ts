export type AuditRecommendation = 'Success' | 'Failure' | 'Success & Failure' | 'Not Recommended';

export interface AuditPolicyEntry {
  id: string;
  category: string;
  name: string;
  description: string;
  recommendation: AuditRecommendation;
  considerations: string;
  domainControllerOnly: boolean;
}

export const auditPolicyOverview = "Windows Security Auditing generates event logs when specific actions occur, including authentication, process execution, account changes, policy changes and object access. Without a deliberate audit policy, important security events may not be generated or retained.\n\nASD recommends configuring Windows event logging and forwarding to improve detection, investigation and incident response. The entries below reconcile the app's reference content against ASD's Windows event logging and forwarding guidance, last updated 6 October 2021.\n\nConfigure these settings through Group Policy at Computer Configuration > Policies > Windows Settings > Security Settings > Advanced Audit Policy Configuration, or validate them with auditpol.exe. Test logging volume and forwarding impact before broad deployment.";

export const auditPolicyEntries: AuditPolicyEntry[] = [
  {
    "id": "account-lockout",
    "category": "Logon/Logoff",
    "name": "Audit Account Lockout",
    "description": "Records account lockout activity that may indicate password brute force or credential spray activity.",
    "recommendation": "Failure",
    "considerations": "High-value and normally low-volume. Alert on lockout spikes and correlate with source hosts.",
    "domainControllerOnly": false
  },
  {
    "id": "computer-account-management",
    "category": "Account Management",
    "name": "Audit Computer Account Management",
    "description": "Records creation, deletion and modification of computer accounts.",
    "recommendation": "Success & Failure",
    "considerations": "Useful for detecting unauthorised domain joins or machine account manipulation.",
    "domainControllerOnly": false
  },
  {
    "id": "other-account-management",
    "category": "Account Management",
    "name": "Audit Other Account Management Events",
    "description": "Captures account management events not covered by the more specific account management subcategories.",
    "recommendation": "Success & Failure",
    "considerations": "Low to moderate volume. Enable for completeness across managed Windows hosts.",
    "domainControllerOnly": false
  },
  {
    "id": "security-group-management",
    "category": "Account Management",
    "name": "Audit Security Group Management",
    "description": "Records security group creation, deletion and membership changes.",
    "recommendation": "Success & Failure",
    "considerations": "Critical for detecting privilege escalation through group membership changes. Monitor privileged groups closely.",
    "domainControllerOnly": false
  },
  {
    "id": "user-account-management",
    "category": "Account Management",
    "name": "Audit User Account Management",
    "description": "Records user account creation, deletion, password resets, lockouts and account state changes.",
    "recommendation": "Success & Failure",
    "considerations": "Essential for detecting unauthorised account creation or manipulation.",
    "domainControllerOnly": false
  },
  {
    "id": "audit-policy-change",
    "category": "Policy Change",
    "name": "Audit Policy Change",
    "description": "Records changes to audit policy that may indicate attempts to suppress logging evidence.",
    "recommendation": "Success & Failure",
    "considerations": "Very low volume and high value. Treat unexpected changes as security-relevant.",
    "domainControllerOnly": false
  },
  {
    "id": "other-policy-change",
    "category": "Policy Change",
    "name": "Audit Other Policy Change Events",
    "description": "Records other policy changes that support event collection and auditing visibility.",
    "recommendation": "Success & Failure",
    "considerations": "Low volume. Supports detection of changes to auditing and forwarding posture.",
    "domainControllerOnly": false
  },
  {
    "id": "system-integrity-event-collection",
    "category": "System",
    "name": "Audit System Integrity",
    "description": "Records integrity violations and event logging failures that can indicate tampering with security mechanisms.",
    "recommendation": "Success & Failure",
    "considerations": "ASD recommends this for event collection and code integrity visibility. Failures should be prioritised.",
    "domainControllerOnly": false
  },
  {
    "id": "group-membership",
    "category": "Logon/Logoff",
    "name": "Audit Group Membership",
    "description": "Records group membership information at logon to support investigation of privileged access during a session.",
    "recommendation": "Success",
    "considerations": "Available on modern Windows clients and servers. Useful when reconstructing user session privileges.",
    "domainControllerOnly": false
  },
  {
    "id": "logoff",
    "category": "Logon/Logoff",
    "name": "Audit Logoff",
    "description": "Records session end events for correlation with successful logons.",
    "recommendation": "Success",
    "considerations": "Moderate volume. Helps close investigation timelines and identify unusual session duration.",
    "domainControllerOnly": false
  },
  {
    "id": "logon",
    "category": "Logon/Logoff",
    "name": "Audit Logon",
    "description": "Records interactive, network and remote logon attempts, including success and failure outcomes.",
    "recommendation": "Success & Failure",
    "considerations": "High value for lateral movement and brute-force detection. Can be high volume on RDP, jump and terminal servers.",
    "domainControllerOnly": false
  },
  {
    "id": "other-logon-logoff",
    "category": "Logon/Logoff",
    "name": "Audit Other Logon/Logoff Events",
    "description": "Records miscellaneous logon and session events not covered by the core logon, logoff or lockout settings.",
    "recommendation": "Success & Failure",
    "considerations": "Moderate volume. Useful for reconstructing account activity across hosts.",
    "domainControllerOnly": false
  },
  {
    "id": "special-logon",
    "category": "Logon/Logoff",
    "name": "Audit Special Logon",
    "description": "Records logons where sensitive privileges are assigned to the session.",
    "recommendation": "Success & Failure",
    "considerations": "Low volume and high signal. Unexpected privileged logons should be reviewed.",
    "domainControllerOnly": false
  },
  {
    "id": "process-creation",
    "category": "Detailed Tracking",
    "name": "Audit Process Creation",
    "description": "Records process start events. ASD recommends collecting this native logging if Sysmon cannot be deployed.",
    "recommendation": "Success",
    "considerations": "High volume. Enable command-line process auditing to improve event value.",
    "domainControllerOnly": false
  },
  {
    "id": "process-termination",
    "category": "Detailed Tracking",
    "name": "Audit Process Termination",
    "description": "Records process termination events for process tracking correlation.",
    "recommendation": "Success",
    "considerations": "High volume. ASD positions native process tracking as a fallback when Sysmon is unavailable.",
    "domainControllerOnly": false
  },
  {
    "id": "detailed-file-share",
    "category": "Object Access",
    "name": "Audit Detailed File Share",
    "description": "Records detailed file share access events.",
    "recommendation": "Not Recommended",
    "considerations": "ASD identifies this setting as too noisy and recommends leaving it not configured.",
    "domainControllerOnly": false
  },
  {
    "id": "file-share",
    "category": "Object Access",
    "name": "Audit File Share",
    "description": "Records file share creation, modification and access events.",
    "recommendation": "Success & Failure",
    "considerations": "Medium value and medium noise. Forward selectively where volume is material.",
    "domainControllerOnly": false
  },
  {
    "id": "other-object-access",
    "category": "Object Access",
    "name": "Audit Other Object Access Events",
    "description": "Records object access events used by ASD's scheduled task and WMI auditing guidance.",
    "recommendation": "Success & Failure",
    "considerations": "Required for scheduled task and WMI visibility. Test volume before broad forwarding.",
    "domainControllerOnly": false
  },
  {
    "id": "file-system",
    "category": "Object Access",
    "name": "Audit File System",
    "description": "Records file system access where matching SACLs are present.",
    "recommendation": "Success & Failure",
    "considerations": "ASD lists this as optional. Use targeted SACLs only, as broad auditing can be noisy and hard to maintain.",
    "domainControllerOnly": false
  },
  {
    "id": "kernel-object",
    "category": "Object Access",
    "name": "Audit Kernel Object",
    "description": "Records access to kernel objects, including activity useful for detecting LSASS memory access on supported Windows versions.",
    "recommendation": "Success & Failure",
    "considerations": "Valuable for credential theft detection where default or targeted SACLs are present.",
    "domainControllerOnly": false
  },
  {
    "id": "registry",
    "category": "Object Access",
    "name": "Audit Registry",
    "description": "Records registry access where matching SACLs are present.",
    "recommendation": "Success & Failure",
    "considerations": "ASD lists this as optional. Prefer targeted registry SACLs or Sysmon registry telemetry where possible.",
    "domainControllerOnly": false
  }
];
