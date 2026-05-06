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
  try {
    const { messages, model, feature } = await req.json();
    let basePrompt = getPrompt('base-test'); // basic general instructions
    const featurePrompt = getPrompt(feature || 'default'); // specific instructions for the feature, if exists
    
    const [server, modelName] = (model || 'local|qwen3.6:35b').split('|');
    const activeOllama = server === 'homelab' ? ollamaHomelab : ollamaLocal;

    // if model is 'translategemma:12b', we want the translation instructions in the base prompt
    if( modelName.startsWith('translategemma') ) {
      basePrompt = getPrompt('translation');
    }
    
    const fullSystemInstructions = `${basePrompt}\n\n${featurePrompt}`.trim();
    // const fullSystemInstructions = "";

    const response = await activeOllama.chat({
      model: modelName,
      messages: [
        { role: 'system', content: fullSystemInstructions },
        ...messages
      ],
      stream: true,
    });

    // create a stream to send the response in real-time
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          // Envia pedaço por pedaço (letra por letra) para o Front-end
          controller.enqueue(new TextEncoder().encode(chunk.message.content));
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Model-Name': modelName 
      },
    });

  } catch (error) {
    console.error("Ollama API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}