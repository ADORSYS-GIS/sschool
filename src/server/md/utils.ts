import matter from 'gray-matter';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { markdownToHtml } from './converter';

export async function loadDocMd(
  res: 'res' = 'res',
  slug: string,
): Promise<Record<string, string>> {
  const fullPath = path.join(process.cwd(), 'docs', res, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  const html = await markdownToHtml(matterResult.content);

  return {
    slug,
    contentHtml: html,
    ...matterResult.data,
  };
}

export async function loadRes(slug: string): Promise<Record<string, string>> {
  return loadDocMd('res', slug);
}
