import { Ollama } from 'ollama';
import fs from 'fs';
import path from 'path';

const ollamaLocal = new Ollama({ host: process.env.OLLAMA_API_URL_LOCAL });
const ollamaHomelab = new Ollama({ host: process.env.OLLAMA_API_URL });

// aux function to load system instructions from md
function getPrompt(fileName: string) {
  try {
    const filePath = path.join(process.cwd(), 'lib/ai/prompts', `${fileName}.md`);
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return ""; // empty if not found
  }
}

export async function POST(req: Request) {
  // Extraímos o texto (prompt) e a escolha do servidor (server)
  const { prompt, server } = await req.json();

  let basePrompt = getPrompt('translation'); // Translate instructions provided by the model documentation

  // add two blank lines to separate the instructions from the user prompt, as in the model's documentation
  basePrompt += '\n\n';

  // select the server
  const ollama = server === 'homelab' ? ollamaHomelab : ollamaLocal;

  // no need for memory in translation
  const result = await ollama.chat({
    model: 'translategemma:12b',
    messages: [
      { role: 'system', content: basePrompt },
      { role: 'user', content: prompt }
    ],
    stream: false,
  });

  console.log("Model response:", result.message.content); // Log da resposta completa do modelo

  return new Response(result.message.content);
}