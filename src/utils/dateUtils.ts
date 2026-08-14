export function getLocalISOString(): string {
  // Fixed GMT-5 for Ecuador
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const localD = new Date(utc + (3600000 * -5));
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${localD.getFullYear()}-${pad(localD.getMonth() + 1)}-${pad(localD.getDate())}T${pad(localD.getHours())}:${pad(localD.getMinutes())}:${pad(localD.getSeconds())}`;
}

export function getTodayStr(): string {
  return getLocalISOString().split('T')[0];
}
