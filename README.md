# AI File Organizer

## Installation Instructions

1. **Download and Install Ollama:**

   Follow the instructions on the [Ollama GitHub page](https://github.com/langchain/ollama) to download and install Ollama.

2. **Pull a Model:**

   Use the following command to pull the `llama3.2` model:
   ```sh
   ollama pull llama3.2
   ```

3. **Update the Model in `src/llm-model/index.ts`:**

   Ensure that the `src/llm-model/index.ts` file is updated to use the pulled model:
   ```typescript
   // filepath: /Users/sujeet/github/ai-file-organizer/src/llm-model/index.ts
   import { Ollama } from '@langchain/ollama';

   const llm = new Ollama({ model: 'llama3.2' });

   export { llm };
   ```

4. **Run Ollama:**

   Start the Ollama server using the following command:
   ```sh
   ollama serve
   ```

   This will start the Ollama server and make the model available for use.

5. **Run the App in Watch Mode:**

   Use the following command to run the app in watch mode:
   ```sh
   pnpm watch
   ```

   This will start the app and automatically reload it when changes are made.