import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function findHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await findHtmlFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
    console.warn(`Could not read directory ${dir}: ${error}`);
  }

  return files;
}

async function replaceQiankunPath(filePath: string): Promise<void> {
  try {
    const content = await readFile(filePath, 'utf-8');

    // This pattern is designed to match both of these cases:
    // 1. (__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || "").replace(/.\/$/, "")
    // 2. (__QIANKUN_WINDOW__["app-name"].__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || "").replace(/.\/$/, "")
    // It captures the part before .replace() and uses it as the replacement.
    const pattern =
      /(\((?:__QIANKUN_WINDOW__\["[^"]+"\]\.)?__INJECTED_PUBLIC_PATH_BY_QIANKUN__\s*\|\|\s*""\))\s*\.replace\(.*?\)/g;
    const updated = content.replace(pattern, '$1');

    if (content !== updated) {
      await writeFile(filePath, updated, 'utf-8');
      console.log(`✅ Updated qiankun path in: ${filePath}`);
      console.log(`   Pattern matches found and replaced`);
    } else {
      // Check if the pattern exists at all
      if (content.includes('__INJECTED_PUBLIC_PATH_BY_QIANKUN__')) {
        console.log(
          `⚠️  Found qiankun injection in ${filePath} but pattern didn't match for replacement`,
        );
        console.log(
          `   Content preview: ${content.substring(content.indexOf('__INJECTED_PUBLIC_PATH_BY_QIANKUN__') - 30, content.indexOf('__INJECTED_PUBLIC_PATH_BY_QIANKUN__') + 120)}`,
        );
      } else {
        console.log(`No qiankun injection found in: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error}`);
  }
}

export async function qiankun_regex_replace() {
  console.log('🔄 Post-build: Fixing qiankun public path...');

  const distPath = 'dist';
  const htmlFiles = await findHtmlFiles(distPath);

  if (htmlFiles.length === 0) {
    console.log('⚠️  No HTML files found in dist directory');
    return;
  }

  console.log(`📁 Found ${htmlFiles.length} HTML file(s) to process`);

  for (const file of htmlFiles) {
    await replaceQiankunPath(file);
  }

  console.log('✨ Post-build processing complete!');
}
