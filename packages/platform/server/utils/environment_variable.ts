export const reservedNames = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT',
  'DB_HOST',
  'VITE_PGREST_URL',
];

export function checkReservedEnvironmentVariableNames(name: string) {
  return reservedNames.includes(name);
}
