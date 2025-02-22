import { Ollama } from '@langchain/ollama';

const llm = new Ollama({ model: 'llama3.2' });

export { llm };