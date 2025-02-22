import { organizeFiles } from './organizer';

const directoryPath = '/Users/sujeet/Downloads';

organizeFiles(directoryPath)
  .then(() => console.log('Files organized successfully'))
  .catch((error) => console.error('Error organizing files:', error));
