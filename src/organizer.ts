import { readdir, rename, mkdir } from 'fs/promises';
import { join } from 'path';
import { llm } from './llm-model';
import { fileOrganizerPrompt } from './llm-model/prompt';

/**
 * Organizes files in a directory into logical groups based on their semantics.
 * @param directoryPath - The path to the directory containing the files.
 */
export async function organizeFiles(directoryPath: string): Promise<void> {
  try {
    // Read directory and get file names directly
    const files = (await readdir(directoryPath, { withFileTypes: true }))
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name);

    if (files.length === 0) {
      console.log('No files to organize.');
      return;
    }

    // Map file names to full paths
    const fileMap = new Map(
      files.map((file) => [file, join(directoryPath, file)])
    );

    // Invoke LLM for categorization
    const chain = fileOrganizerPrompt.pipe(llm);
    const chainResponse = await chain.invoke({
      input: [...fileMap.keys()].join(' '),
    });

    // Parse response (ensure it's a valid object)
    const organized: Record<string, string[]> =
      typeof chainResponse === 'string'
        ? JSON.parse(chainResponse)
        : chainResponse;

    // Create necessary directories
    await createDirectories(directoryPath, Object.keys(organized));

    // Move files accordingly
    await moveFiles(directoryPath, organized, fileMap);
  } catch (error) {
    console.error('Error organizing files:', error);
    throw error; // Ensure errors propagate
  }
}

/**
 * Creates directories for each group if they don't already exist.
 * @param directoryPath - The base directory path.
 * @param groups - An array of group names.
 */
async function createDirectories(
  directoryPath: string,
  groups: string[]
): Promise<void> {
  await Promise.all(
    groups.map((group) =>
      mkdir(join(directoryPath, group), { recursive: true })
    )
  );
  console.log('Directories checked/created:', groups);
}

/**
 * Moves files into their respective group directories.
 * @param directoryPath - The base directory path.
 * @param organized - The organized groups of files.
 * @param fileMap - A map of file names to their full paths.
 */
async function moveFiles(
  directoryPath: string,
  organized: Record<string, string[]>,
  fileMap: Map<string, string>
): Promise<void> {
  await Promise.all(
    Object.entries(organized).flatMap(([group, files]) => {
      const groupPath = join(directoryPath, group);
      return files
        .filter((file) => fileMap.has(file))
        .map((file) =>
          rename(fileMap.get(file)!, join(groupPath, file)).catch((error) =>
            console.error(`Error moving file ${file}:`, error)
          )
        );
    })
  );
  console.log('Files moved successfully.');
}
