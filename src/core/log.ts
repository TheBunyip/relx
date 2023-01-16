export let log = defaultLog;

export function setLog(newLog: (str: string, prefix?: string) => void) {
  log = newLog;
}

export function resetLogToDefault() {
  log = defaultLog;
}

function defaultLog(str: string, prefix?: string): void {
  console.log(prefix || "#", sentenceCase(str) + ".");
}

function sentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
