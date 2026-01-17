// Debug logs storage
const debugLogs: string[] = [];

export function addDebugLog(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  debugLogs.push(logEntry);
  console.log(logEntry);
  
  // Manter apenas últimos 100 logs
  if (debugLogs.length > 100) {
    debugLogs.shift();
  }
}

export function getDebugLogs() {
  return [...debugLogs];
}

export function clearDebugLogs() {
  debugLogs.length = 0;
}
