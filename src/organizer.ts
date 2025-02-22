import { readdir, rename, mkdir } from 'fs/promises';
import { join } from 'path';

import { llm } from './llm-model';
import { fileOrganizerPrompt } from './llm-model/prompt';

export async function organizeFiles(directoryPath: string): Promise<void> {
  const dirents = await readdir(directoryPath, { withFileTypes: true });
  const files = dirents.filter(dirent => dirent.isFile()).map(dirent => dirent.name);
  const fileMap: { [key: string]: string } = {};

  for (const file of files) {
    const filePath = join(directoryPath, file);
    fileMap[file] = filePath;
  }

  const chain = fileOrganizerPrompt.pipe(llm);
  const chainResponse = await chain.invoke({
    input: Object.keys(fileMap).join(' '),
  });
const organized = typeof chainResponse === 'string' ? JSON.parse(chainResponse) : chainResponse;
  // for each group in the organized output create a directory and move the files

  const createDirPromises = Object.keys(organized).map((group: string) => {
    const groupPath = join(directoryPath, group);
    return mkdir(groupPath).catch((error) => {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    });
  });

  await Promise.all(createDirPromises);

  const organizeFilePromises = Object.keys(organized).map(async (group: string) => {
    const groupPath = join(directoryPath, group);
    organized[group].forEach(async (file: string) => {
      console.log(`Moving ${file} to ${groupPath}`);
      const filePath = fileMap[file];
      if (filePath) {
        await rename(filePath, join(groupPath, file));
      }
    });
  });
  await Promise.all(organizeFilePromises);
}
