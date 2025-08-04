export const isJWTExpired = (jwt: string): boolean => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
};
