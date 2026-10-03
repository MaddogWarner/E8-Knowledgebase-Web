// Shared by the Swift data generator and the backup codec. Preserve web IDs.
export function iosToWebStepId(id) {
  const match = /^([1-8])-([1-3])-(0|[1-9]\d*)$/.exec(id);
  return match ? `${match[1]}-ml${match[2]}-${Number(match[3]) + 1}` : null;
}

export function webToIosStepId(id) {
  const match = /^([1-8])-ml([1-3])-([1-9]\d*)$/.exec(id);
  return match ? `${match[1]}-${match[2]}-${Number(match[3]) - 1}` : null;
}
