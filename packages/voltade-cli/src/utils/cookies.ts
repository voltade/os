import fs from 'node:fs/promises';
import path from 'node:path';

const CookiesFileName = 'cookies';

export async function saveCookies(dataDir: string, cookies: string[]) {
  const filePath = path.join(dataDir, CookiesFileName);
  try {
    await fs.writeFile(filePath, cookies.join('\n'), 'utf-8');
  } catch (error) {
    console.error('Failed to save cookies:', error);
    throw error;
  }
}

export async function loadCookies(dataDir: string) {
  const filePath = path.join(dataDir, CookiesFileName);
  try {
    const cookies = await fs.readFile(filePath, 'utf-8');
    return cookies.split('\n').filter(Boolean);
  } catch (error) {
    return undefined;
  }
}

export async function deleteCookies(dataDir: string) {
  const filePath = path.join(dataDir, CookiesFileName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete cookies:', error);
    throw error;
  }
}
