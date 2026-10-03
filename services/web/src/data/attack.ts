// Generated from ATTACKCatalogue.swift, ATTACKMappingData.swift and ATTACKTechnique.swift.
export type AttackTactic = "Initial Access" | "Execution" | "Persistence" | "Privilege Escalation" | "Stealth" | "Defense Impairment" | "Credential Access" | "Lateral Movement" | "Collection" | "Impact";
export const attackTactics: AttackTactic[] = ["Initial Access","Execution","Persistence","Privilege Escalation","Stealth","Defense Impairment","Credential Access","Lateral Movement","Collection","Impact"];
export type AttackRelationship = "Prevent" | "Detect" | "Recover" | "Support";
export const attackRelationships: AttackRelationship[] = ["Prevent","Detect","Recover","Support"];
export interface AttackTechnique { id: string; name: string; tactics: AttackTactic[]; url: string }
export interface AttackMapping { stepId: string; techniqueId: string; relationships: AttackRelationship[]; note?: string }
export const attackVersion = "v19.1";
export const attackVersionReleased = "28 April 2026";
export const attackTechniques: AttackTechnique[] = [
  {
    "id": "T1003.001",
    "name": "LSASS Memory",
    "tactics": [
      "Credential Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1003/001/"
  },
  {
    "id": "T1021",
    "name": "Remote Services",
    "tactics": [
      "Lateral Movement"
    ],
    "url": "https://attack.mitre.org/techniques/T1021/"
  },
  {
    "id": "T1055",
    "name": "Process Injection",
    "tactics": [
      "Stealth",
      "Privilege Escalation"
    ],
    "url": "https://attack.mitre.org/techniques/T1055/"
  },
  {
    "id": "T1059",
    "name": "Command and Scripting Interpreter",
    "tactics": [
      "Execution"
    ],
    "url": "https://attack.mitre.org/techniques/T1059/"
  },
  {
    "id": "T1059.001",
    "name": "PowerShell",
    "tactics": [
      "Execution"
    ],
    "url": "https://attack.mitre.org/techniques/T1059/001/"
  },
  {
    "id": "T1059.005",
    "name": "Visual Basic",
    "tactics": [
      "Execution"
    ],
    "url": "https://attack.mitre.org/techniques/T1059/005/"
  },
  {
    "id": "T1068",
    "name": "Exploitation for Privilege Escalation",
    "tactics": [
      "Privilege Escalation"
    ],
    "url": "https://attack.mitre.org/techniques/T1068/"
  },
  {
    "id": "T1078",
    "name": "Valid Accounts",
    "tactics": [
      "Stealth",
      "Persistence",
      "Privilege Escalation",
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1078/"
  },
  {
    "id": "T1078.003",
    "name": "Local Accounts",
    "tactics": [
      "Stealth",
      "Persistence",
      "Privilege Escalation",
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1078/003/"
  },
  {
    "id": "T1110",
    "name": "Brute Force",
    "tactics": [
      "Credential Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1110/"
  },
  {
    "id": "T1110.001",
    "name": "Password Guessing",
    "tactics": [
      "Credential Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1110/001/"
  },
  {
    "id": "T1111",
    "name": "Multi-Factor Authentication Interception",
    "tactics": [
      "Credential Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1111/"
  },
  {
    "id": "T1127",
    "name": "Trusted Developer Utilities Proxy Execution",
    "tactics": [
      "Stealth",
      "Execution"
    ],
    "url": "https://attack.mitre.org/techniques/T1127/"
  },
  {
    "id": "T1137.001",
    "name": "Office Template Macros",
    "tactics": [
      "Persistence"
    ],
    "url": "https://attack.mitre.org/techniques/T1137/001/"
  },
  {
    "id": "T1189",
    "name": "Drive-by Compromise",
    "tactics": [
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1189/"
  },
  {
    "id": "T1190",
    "name": "Exploit Public-Facing Application",
    "tactics": [
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1190/"
  },
  {
    "id": "T1203",
    "name": "Exploitation for Client Execution",
    "tactics": [
      "Execution"
    ],
    "url": "https://attack.mitre.org/techniques/T1203/"
  },
  {
    "id": "T1204.002",
    "name": "Malicious File",
    "tactics": [
      "Execution"
    ],
    "url": "https://attack.mitre.org/techniques/T1204/002/"
  },
  {
    "id": "T1216",
    "name": "System Script Proxy Execution",
    "tactics": [
      "Stealth"
    ],
    "url": "https://attack.mitre.org/techniques/T1216/"
  },
  {
    "id": "T1218",
    "name": "System Binary Proxy Execution",
    "tactics": [
      "Stealth"
    ],
    "url": "https://attack.mitre.org/techniques/T1218/"
  },
  {
    "id": "T1485",
    "name": "Data Destruction",
    "tactics": [
      "Impact"
    ],
    "url": "https://attack.mitre.org/techniques/T1485/"
  },
  {
    "id": "T1486",
    "name": "Data Encrypted for Impact",
    "tactics": [
      "Impact"
    ],
    "url": "https://attack.mitre.org/techniques/T1486/"
  },
  {
    "id": "T1490",
    "name": "Inhibit System Recovery",
    "tactics": [
      "Impact"
    ],
    "url": "https://attack.mitre.org/techniques/T1490/"
  },
  {
    "id": "T1543.003",
    "name": "Windows Service",
    "tactics": [
      "Persistence",
      "Privilege Escalation"
    ],
    "url": "https://attack.mitre.org/techniques/T1543/003/"
  },
  {
    "id": "T1548.002",
    "name": "Bypass User Account Control",
    "tactics": [
      "Privilege Escalation"
    ],
    "url": "https://attack.mitre.org/techniques/T1548/002/"
  },
  {
    "id": "T1550.002",
    "name": "Pass the Hash",
    "tactics": [
      "Lateral Movement"
    ],
    "url": "https://attack.mitre.org/techniques/T1550/002/"
  },
  {
    "id": "T1550.003",
    "name": "Pass the Ticket",
    "tactics": [
      "Lateral Movement"
    ],
    "url": "https://attack.mitre.org/techniques/T1550/003/"
  },
  {
    "id": "T1553.002",
    "name": "Code Signing",
    "tactics": [
      "Defense Impairment"
    ],
    "url": "https://attack.mitre.org/techniques/T1553/002/"
  },
  {
    "id": "T1556",
    "name": "Modify Authentication Process",
    "tactics": [
      "Defense Impairment",
      "Persistence",
      "Credential Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1556/"
  },
  {
    "id": "T1557",
    "name": "Adversary-in-the-Middle",
    "tactics": [
      "Credential Access",
      "Collection"
    ],
    "url": "https://attack.mitre.org/techniques/T1557/"
  },
  {
    "id": "T1566",
    "name": "Phishing",
    "tactics": [
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1566/"
  },
  {
    "id": "T1566.001",
    "name": "Spearphishing Attachment",
    "tactics": [
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1566/001/"
  },
  {
    "id": "T1566.002",
    "name": "Spearphishing Link",
    "tactics": [
      "Initial Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1566/002/"
  },
  {
    "id": "T1621",
    "name": "Multi-Factor Authentication Request Generation",
    "tactics": [
      "Credential Access"
    ],
    "url": "https://attack.mitre.org/techniques/T1621/"
  },
  {
    "id": "T1685",
    "name": "Disable or Modify Tools",
    "tactics": [
      "Defense Impairment"
    ],
    "url": "https://attack.mitre.org/techniques/T1685/"
  }
];
export const attackMappings: AttackMapping[] = [
  {
    "stepId": "1-ml1-1",
    "techniqueId": "T1204.002",
    "relationships": [
      "Support"
    ],
    "note": "AppLocker enforcement depends on this service. Alone it blocks nothing."
  },
  {
    "stepId": "1-ml1-1",
    "techniqueId": "T1059",
    "relationships": [
      "Support"
    ],
    "note": "AppLocker enforcement depends on this service. Alone it blocks nothing."
  },
  {
    "stepId": "1-ml1-2",
    "techniqueId": "T1204.002",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "1-ml1-2",
    "techniqueId": "T1218",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "1-ml1-3",
    "techniqueId": "T1204.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Removes the drop-and-run paths most commodity loaders rely on."
  },
  {
    "stepId": "1-ml1-3",
    "techniqueId": "T1059.001",
    "relationships": [
      "Prevent"
    ],
    "note": "Removes the drop-and-run paths most commodity loaders rely on."
  },
  {
    "stepId": "1-ml1-4",
    "techniqueId": "T1204.002",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "1-ml1-4",
    "techniqueId": "T1059",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "1-ml1-4",
    "techniqueId": "T1218",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "1-ml2-1",
    "techniqueId": "T1059",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "1-ml2-1",
    "techniqueId": "T1021",
    "relationships": [
      "Support"
    ],
    "note": "Constrains what an adversary can run after arriving over a remote service; does not block the remote service itself."
  },
  {
    "stepId": "1-ml2-2",
    "techniqueId": "T1218",
    "relationships": [
      "Prevent"
    ],
    "note": "Code integrity blocks the unsigned tooling commonly used to disable security products."
  },
  {
    "stepId": "1-ml2-2",
    "techniqueId": "T1685",
    "relationships": [
      "Prevent"
    ],
    "note": "Code integrity blocks the unsigned tooling commonly used to disable security products."
  },
  {
    "stepId": "1-ml2-3",
    "techniqueId": "T1204.002",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "1-ml2-3",
    "techniqueId": "T1059",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "1-ml2-3",
    "techniqueId": "T1218",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "1-ml3-1",
    "techniqueId": "T1218",
    "relationships": [
      "Prevent"
    ],
    "note": "The block list exists specifically to close signed-binary, developer-utility and script-host proxy execution."
  },
  {
    "stepId": "1-ml3-1",
    "techniqueId": "T1127",
    "relationships": [
      "Prevent"
    ],
    "note": "The block list exists specifically to close signed-binary, developer-utility and script-host proxy execution."
  },
  {
    "stepId": "1-ml3-1",
    "techniqueId": "T1216",
    "relationships": [
      "Prevent"
    ],
    "note": "The block list exists specifically to close signed-binary, developer-utility and script-host proxy execution."
  },
  {
    "stepId": "1-ml3-2",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ],
    "note": "Closes the bring-your-own-vulnerable-driver path."
  },
  {
    "stepId": "1-ml3-2",
    "techniqueId": "T1543.003",
    "relationships": [
      "Prevent"
    ],
    "note": "A vulnerable driver is loaded as a kernel service; blocking the driver blocks that service creation."
  },
  {
    "stepId": "1-ml3-3",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ],
    "note": "HVCI blocks unsigned kernel code, the usual route to tampering with security tooling from the kernel."
  },
  {
    "stepId": "1-ml3-3",
    "techniqueId": "T1685",
    "relationships": [
      "Prevent"
    ],
    "note": "HVCI blocks unsigned kernel code, the usual route to tampering with security tooling from the kernel."
  },
  {
    "stepId": "2-ml1-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml1-2",
    "techniqueId": "T1189",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml1-2",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml1-4",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml1-4",
    "techniqueId": "T1190",
    "relationships": [
      "Prevent"
    ],
    "note": "Applies where the removed application was internet-facing."
  },
  {
    "stepId": "2-ml2-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml2-1",
    "techniqueId": "T1189",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml2-2",
    "techniqueId": "T1203",
    "relationships": [
      "Support"
    ],
    "note": "Patches only take effect after restart. The deadline closes the exposure window rather than blocking the technique."
  },
  {
    "stepId": "2-ml3-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "2-ml3-1",
    "techniqueId": "T1190",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "3-ml1-1",
    "techniqueId": "T1566.001",
    "relationships": [
      "Prevent"
    ],
    "note": "Depends on Mark-of-the-Web. Adversaries defeat it with container formats that do not propagate the mark — ISO, IMG, VHD, 7z — which ATT&CK tracks as T1553.005 Mark-of-the-Web Bypass."
  },
  {
    "stepId": "3-ml1-1",
    "techniqueId": "T1204.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Depends on Mark-of-the-Web. Adversaries defeat it with container formats that do not propagate the mark — ISO, IMG, VHD, 7z — which ATT&CK tracks as T1553.005 Mark-of-the-Web Bypass."
  },
  {
    "stepId": "3-ml1-2",
    "techniqueId": "T1059.005",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "3-ml1-3",
    "techniqueId": "T1566.001",
    "relationships": [
      "Prevent"
    ],
    "note": "Stops the user being able to click past the block."
  },
  {
    "stepId": "3-ml1-3",
    "techniqueId": "T1059.005",
    "relationships": [
      "Prevent"
    ],
    "note": "Stops the user being able to click past the block."
  },
  {
    "stepId": "3-ml2-1",
    "techniqueId": "T1059.005",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "3-ml2-1",
    "techniqueId": "T1553.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Only as strong as publisher scoping — a stolen or abused signing certificate defeats it."
  },
  {
    "stepId": "3-ml2-2",
    "techniqueId": "T1059.005",
    "relationships": [
      "Prevent",
      "Detect"
    ],
    "note": "Inspects macro content at runtime, so obfuscated payloads are caught after de-obfuscation."
  },
  {
    "stepId": "3-ml2-3",
    "techniqueId": "T1059.005",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "3-ml3-1",
    "techniqueId": "T1059.005",
    "relationships": [
      "Prevent"
    ],
    "note": "Stronger signature validation closes downgrade and tampering paths in legacy signature formats."
  },
  {
    "stepId": "3-ml3-1",
    "techniqueId": "T1553.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Stronger signature validation closes downgrade and tampering paths in legacy signature formats."
  },
  {
    "stepId": "3-ml3-2",
    "techniqueId": "T1059.005",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "3-ml3-2",
    "techniqueId": "T1137.001",
    "relationships": [
      "Prevent"
    ],
    "note": "A writable Trusted Location or template path is an Office persistence route, not just an execution one."
  },
  {
    "stepId": "4-ml1-1",
    "techniqueId": "T1189",
    "relationships": [
      "Prevent"
    ],
    "note": "Removes a legacy engine that no longer receives fixes."
  },
  {
    "stepId": "4-ml1-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ],
    "note": "Removes a legacy engine that no longer receives fixes."
  },
  {
    "stepId": "4-ml1-2",
    "techniqueId": "T1189",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "4-ml1-3",
    "techniqueId": "T1189",
    "relationships": [
      "Prevent"
    ],
    "note": "Targets malvertising. Edge Tracking Prevention alone is partial coverage — see the ML1 gap note in the app."
  },
  {
    "stepId": "4-ml2-1",
    "techniqueId": "T1059.001",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "4-ml2-2",
    "techniqueId": "T1059",
    "relationships": [
      "Prevent"
    ],
    "note": "Coverage depends on which ASR rules are enabled and whether they are in Block or Audit mode."
  },
  {
    "stepId": "4-ml2-2",
    "techniqueId": "T1204.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Coverage depends on which ASR rules are enabled and whether they are in Block or Audit mode."
  },
  {
    "stepId": "4-ml2-2",
    "techniqueId": "T1218",
    "relationships": [
      "Prevent"
    ],
    "note": "Coverage depends on which ASR rules are enabled and whether they are in Block or Audit mode."
  },
  {
    "stepId": "4-ml2-2",
    "techniqueId": "T1055",
    "relationships": [
      "Prevent"
    ],
    "note": "Coverage depends on which ASR rules are enabled and whether they are in Block or Audit mode."
  },
  {
    "stepId": "4-ml2-3",
    "techniqueId": "T1059",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "4-ml2-3",
    "techniqueId": "T1059.001",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "4-ml3-1",
    "techniqueId": "T1059.001",
    "relationships": [
      "Prevent"
    ],
    "note": "PowerShell v2 predates ScriptBlock logging and AMSI; removing it closes the downgrade path used to evade both."
  },
  {
    "stepId": "4-ml3-2",
    "techniqueId": "T1059.001",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "4-ml3-3",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "4-ml3-3",
    "techniqueId": "T1127",
    "relationships": [
      "Prevent"
    ],
    "note": "Legacy .NET ships the signed developer utilities (MSBuild, InstallUtil) used for proxy execution."
  },
  {
    "stepId": "5-ml1-1",
    "techniqueId": "T1078.003",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "5-ml1-1",
    "techniqueId": "T1548.002",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "5-ml1-2",
    "techniqueId": "T1078.003",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "5-ml1-2",
    "techniqueId": "T1550.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Unique per-machine passwords stop a recovered local admin credential or hash working across the fleet. LAPS does not prevent the credential being dumped in the first place."
  },
  {
    "stepId": "5-ml1-3",
    "techniqueId": "T1566",
    "relationships": [
      "Prevent"
    ],
    "note": "Breaks the direct path from a phishing click to a privileged session."
  },
  {
    "stepId": "5-ml1-3",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ],
    "note": "Breaks the direct path from a phishing click to a privileged session."
  },
  {
    "stepId": "5-ml2-1",
    "techniqueId": "T1003.001",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "5-ml2-1",
    "techniqueId": "T1550.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Protects the derived material an attacker would otherwise replay."
  },
  {
    "stepId": "5-ml2-2",
    "techniqueId": "T1003.001",
    "relationships": [
      "Prevent"
    ],
    "note": "Weaker than Credential Guard; bypassable with a signed vulnerable driver, which is why 1-3-1 matters alongside it."
  },
  {
    "stepId": "5-ml2-3",
    "techniqueId": "T1059.001",
    "relationships": [
      "Prevent"
    ],
    "note": "Constrains what a compromised privileged session can actually do."
  },
  {
    "stepId": "5-ml2-3",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ],
    "note": "Constrains what a compromised privileged session can actually do."
  },
  {
    "stepId": "5-ml3-1",
    "techniqueId": "T1550.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Blocks NTLM, DES and RC4 for members and disallows delegation. Verify application compatibility first."
  },
  {
    "stepId": "5-ml3-1",
    "techniqueId": "T1550.003",
    "relationships": [
      "Prevent"
    ],
    "note": "Blocks NTLM, DES and RC4 for members and disallows delegation. Verify application compatibility first."
  },
  {
    "stepId": "5-ml3-2",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ],
    "note": "Separates the administration plane from the browsing and email plane."
  },
  {
    "stepId": "5-ml3-2",
    "techniqueId": "T1021",
    "relationships": [
      "Prevent"
    ],
    "note": "Separates the administration plane from the browsing and email plane."
  },
  {
    "stepId": "5-ml3-3",
    "techniqueId": "T1078",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "5-ml3-3",
    "techniqueId": "T1078.003",
    "relationships": [
      "Detect"
    ]
  },
  {
    "stepId": "6-ml1-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "6-ml1-1",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "6-ml1-2",
    "techniqueId": "T1203",
    "relationships": [
      "Support"
    ],
    "note": "Bounds the exposure window; the patch itself does the preventing."
  },
  {
    "stepId": "6-ml1-2",
    "techniqueId": "T1068",
    "relationships": [
      "Support"
    ],
    "note": "Bounds the exposure window; the patch itself does the preventing."
  },
  {
    "stepId": "6-ml2-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "6-ml2-1",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "6-ml2-2",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ],
    "note": "Driver flaws are a primary kernel privilege-escalation route."
  },
  {
    "stepId": "6-ml3-1",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "6-ml3-1",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "6-ml3-1",
    "techniqueId": "T1190",
    "relationships": [
      "Prevent"
    ],
    "note": "Applies to internet-facing systems."
  },
  {
    "stepId": "6-ml3-2",
    "techniqueId": "T1068",
    "relationships": [
      "Prevent"
    ],
    "note": "Out-of-support builds stop receiving fixes entirely, so every other patching step degrades to nothing."
  },
  {
    "stepId": "6-ml3-2",
    "techniqueId": "T1203",
    "relationships": [
      "Prevent"
    ],
    "note": "Out-of-support builds stop receiving fixes entirely, so every other patching step degrades to nothing."
  },
  {
    "stepId": "7-ml1-1",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml1-1",
    "techniqueId": "T1110",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml1-1",
    "techniqueId": "T1111",
    "relationships": [
      "Prevent"
    ],
    "note": "Phishing-resistant: the credential is bound to the device and cannot be replayed elsewhere."
  },
  {
    "stepId": "7-ml1-2",
    "techniqueId": "T1110.001",
    "relationships": [
      "Prevent"
    ],
    "note": "The PIN is device-local and TPM-protected, so this resists local guessing rather than remote spraying."
  },
  {
    "stepId": "7-ml1-3",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml1-3",
    "techniqueId": "T1110",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml2-1",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ],
    "note": "MFA that relies on push approval introduces its own attack surface — T1621 MFA Request Generation, or push fatigue. Prefer number matching or a phishing-resistant method."
  },
  {
    "stepId": "7-ml2-1",
    "techniqueId": "T1110",
    "relationships": [
      "Prevent"
    ],
    "note": "MFA that relies on push approval introduces its own attack surface — T1621 MFA Request Generation, or push fatigue. Prefer number matching or a phishing-resistant method."
  },
  {
    "stepId": "7-ml2-2",
    "techniqueId": "T1550.002",
    "relationships": [
      "Prevent"
    ],
    "note": "Randomises the account's NT hash when set, but does not rotate it afterwards. A hash captured later stays valid until rotated, so rotate on a schedule."
  },
  {
    "stepId": "7-ml2-2",
    "techniqueId": "T1550.003",
    "relationships": [
      "Support"
    ]
  },
  {
    "stepId": "7-ml3-1",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml3-1",
    "techniqueId": "T1111",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml3-1",
    "techniqueId": "T1556",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "7-ml3-2",
    "techniqueId": "T1111",
    "relationships": [
      "Prevent"
    ],
    "note": "Origin-bound credentials mean an adversary-in-the-middle proxy cannot relay the authentication."
  },
  {
    "stepId": "7-ml3-2",
    "techniqueId": "T1557",
    "relationships": [
      "Prevent"
    ],
    "note": "Origin-bound credentials mean an adversary-in-the-middle proxy cannot relay the authentication."
  },
  {
    "stepId": "7-ml3-2",
    "techniqueId": "T1566.002",
    "relationships": [
      "Support"
    ],
    "note": "Neutralises credential theft via a phishing link. It does not stop the link being sent or clicked."
  },
  {
    "stepId": "7-ml3-3",
    "techniqueId": "T1078",
    "relationships": [
      "Detect"
    ],
    "note": "Repeated denied MFA prompts are the signature of a push-fatigue attempt."
  },
  {
    "stepId": "7-ml3-3",
    "techniqueId": "T1110",
    "relationships": [
      "Detect"
    ],
    "note": "Repeated denied MFA prompts are the signature of a push-fatigue attempt."
  },
  {
    "stepId": "7-ml3-3",
    "techniqueId": "T1621",
    "relationships": [
      "Detect"
    ],
    "note": "Repeated denied MFA prompts are the signature of a push-fatigue attempt."
  },
  {
    "stepId": "8-ml1-1",
    "techniqueId": "T1490",
    "relationships": [
      "Support"
    ],
    "note": "Prerequisite only. The capability helps once backups are scheduled (8-1-1) and protected (8-1-2)."
  },
  {
    "stepId": "8-ml1-1",
    "techniqueId": "T1486",
    "relationships": [
      "Support"
    ],
    "note": "Prerequisite only. The capability helps once backups are scheduled (8-1-1) and protected (8-1-2)."
  },
  {
    "stepId": "8-ml1-2",
    "techniqueId": "T1486",
    "relationships": [
      "Recover"
    ]
  },
  {
    "stepId": "8-ml1-2",
    "techniqueId": "T1490",
    "relationships": [
      "Recover"
    ]
  },
  {
    "stepId": "8-ml1-2",
    "techniqueId": "T1485",
    "relationships": [
      "Recover"
    ]
  },
  {
    "stepId": "8-ml1-3",
    "techniqueId": "T1485",
    "relationships": [
      "Prevent"
    ],
    "note": "A backup an adversary can reach with the credentials they already hold is not a backup."
  },
  {
    "stepId": "8-ml1-3",
    "techniqueId": "T1490",
    "relationships": [
      "Prevent"
    ],
    "note": "A backup an adversary can reach with the credentials they already hold is not a backup."
  },
  {
    "stepId": "8-ml1-4",
    "techniqueId": "T1490",
    "relationships": [
      "Support"
    ],
    "note": "VSS is the first thing ransomware deletes — vssadmin delete shadows is squarely T1490. Treat shadow copies as user convenience, never as the backup."
  },
  {
    "stepId": "8-ml2-1",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml2-1",
    "techniqueId": "T1490",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml2-2",
    "techniqueId": "T1485",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml2-2",
    "techniqueId": "T1486",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml3-1",
    "techniqueId": "T1486",
    "relationships": [
      "Detect"
    ],
    "note": "Detects silent corruption or encryption of backup data. It does not reverse it."
  },
  {
    "stepId": "8-ml3-1",
    "techniqueId": "T1485",
    "relationships": [
      "Detect"
    ],
    "note": "Detects silent corruption or encryption of backup data. It does not reverse it."
  },
  {
    "stepId": "8-ml3-2",
    "techniqueId": "T1485",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml3-2",
    "techniqueId": "T1490",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml3-2",
    "techniqueId": "T1078",
    "relationships": [
      "Prevent"
    ]
  },
  {
    "stepId": "8-ml3-3",
    "techniqueId": "T1486",
    "relationships": [
      "Recover"
    ],
    "note": "The only copy that reliably survives an adversary holding domain administrator."
  },
  {
    "stepId": "8-ml3-3",
    "techniqueId": "T1490",
    "relationships": [
      "Recover"
    ],
    "note": "The only copy that reliably survives an adversary holding domain administrator."
  },
  {
    "stepId": "8-ml3-3",
    "techniqueId": "T1485",
    "relationships": [
      "Recover"
    ],
    "note": "The only copy that reliably survives an adversary holding domain administrator."
  }
];
