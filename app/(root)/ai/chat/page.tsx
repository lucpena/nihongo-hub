"use client";

import React, { useState, useRef, useEffect } from "react";

import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  SelectGroup, SelectLabel, SelectSeparator 
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, User, Send, Server } from "lucide-react";
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import { FuriganaText } from '@/components/furigana';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function OllamaChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("homelab|llama3.1:latest");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "auto"  });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.01);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // creates the empty assistant message that will be filled in real-time
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          model: selectedModel,
          feature: "default"
        }),
      });

      if (!res.body) throw new Error("No response body");

      // logic for reading the stream in real-time
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // streaming response loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });

        if (textChunk.length % 10 > 8) playBeep();

        // Atualiza apenas a última mensagem (a do assistente) com a nova letra/palavra
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + textChunk,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // custom parsing options to replace <furigana> tags with our FuriganaText component
  // const parseOptions: HTMLReactParserOptions = {
  //   replace: (domNode: any) => {
  //     // O parser sempre lê o nome das tags em minúsculo, por isso 'furigana'
  //     if (domNode.type === 'tag' && domNode.name === 'furigana') {
  //       let innerText = '';
  //       if (domNode.children && domNode.children.length > 0) {
  //         domNode.children.forEach((child: any) => {
  //           if (child.type === 'text') {
  //             innerText += child.data;
  //           }
  //         });
  //       }
  //       return <FuriganaText text={innerText} />;
  //     }
  //   }
  // };

  // const withFurigana = (children: React.ReactNode) => {
  //   return React.Children.map(children, (child) => {
  //     if (typeof child === 'string') {
  //       // O seu componente já tem o Regex perfeito, então basta entregar a string pra ele!
  //       return <FuriganaText text={child} />;
  //     }
  //     // Se for um elemento React (ex: o react-markdown já transformou em <strong>), 
  //     // devolvemos intacto para que ele continue o fluxo.
  //     return child;
  //   });
  // };

  return (
    <div className="container w-4xl mx-auto py-8 h-[calc(100vh-4rem)] flex flex-col ml-20">
      <Card className="flex-1 flex flex-col overflow-hidden border-2 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4 bg-muted/30">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Chat
          </CardTitle>

          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-100 bg-background">
              <Server className="w-4 h-4 mr-2 text-primary shrink-0" />
              <SelectValue placeholder="Escolha um modelo" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              
              {/* GRUPO: HOMELAB */}
              <SelectGroup>
                <SelectLabel className="text-primary font-bold">🖥️ Homelab</SelectLabel>
                <SelectItem value="homelab|qwen3.5:latest">⭐ Qwen 3.5</SelectItem>
                <SelectItem value="homelab|translategemma:12b">⭐ TranslateGemma 12B</SelectItem>
                <SelectItem value="homelab|deepseek-r1:14b">⭐ DeepSeek R1 14B</SelectItem>
                <SelectItem value="homelab|gemma4:latest">Gemma 4 e4b</SelectItem>
                <SelectItem value="homelab|gpt-oss:latest">GPT-OSS</SelectItem>
                <SelectItem value="homelab|llama3.1:latest">Llama 3.1 8b</SelectItem>
                <SelectItem value="homelab|phi4-mini-reasoning:latest">Phi-4 Mini Reasoning</SelectItem>
                <SelectItem value="homelab|ministral-3:14b">Ministral 3 14B</SelectItem>
                <SelectItem value="homelab|mistral-small3.2:24b">Mistral Small 3.2 24B</SelectItem>
                <SelectItem value="homelab|hermes3:latest">Hermes 3</SelectItem>
              </SelectGroup>

              <SelectSeparator />

              {/* GRUPO: MÁQUINA LOCAL */}
              <SelectGroup>
                <SelectLabel className="text-primary font-bold">💻 Local Machine</SelectLabel>
                <SelectItem value="local|qwen3.5:latest">⭐ Qwen 3.5</SelectItem>
                <SelectItem value="local|deepseek-r1:32b">⭐ DeepSeek R1 32B</SelectItem>
                <SelectItem value="local|deepseek-r1:14b">⭐ DeepSeek R1 14B</SelectItem>
                <SelectItem value="local|gemma4:latest">Gemma 4 e4b</SelectItem>
                <SelectItem value="local|gemma4:26b">Gemma 4 26b</SelectItem>
                <SelectItem value="local|gpt-oss:latest">GPT-OSS</SelectItem>
                <SelectItem value="local|granite4.1:30b">Granite 4.1 30B</SelectItem>
                <SelectItem value="local|granite4.1:8b">Granite 4.1 8B</SelectItem>
                <SelectItem value="local|llama3.2:latest">Llama 3.2 3b</SelectItem>
                <SelectItem value="local|llama3.1:latest">Llama 3.1 8b</SelectItem>
                <SelectItem value="local|hermes3:latest">Hermes 3</SelectItem>
                <SelectItem value="local|phi4-reasoning:plus">Phi-4 Reasoning Plus</SelectItem>
                <SelectItem value="local|devstral-small-2:latest">Devstral Small 2</SelectItem>
                <SelectItem value="local|qwen2.5-coder:32b">Qwen 2.5 Coder 32B</SelectItem>
                <SelectItem value="local|deepseek-coder-v2:latest">DeepSeek Coder v2</SelectItem>
              </SelectGroup>
              
            </SelectContent>
          </Select>

        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden bg-background">
          <ScrollArea className="h-full p-6">
            <div className="flex flex-col space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground mt-10">
                  Konnichiwa! How can I help you study Japanese today?
                </div>
              )}
              
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-foreground border border-border text-lg"
                    }`}
                  >
                    {/* normal text for user and parsed text for assistant */}
                    {/* {m.role === "user" ? m.content : parse(m.content, parseOptions)} */}
                    {m.role === "user" ? 
                      m.content :
                     <ReactMarkdown>{m.content}</ReactMarkdown>
                    }
                    
                    {isLoading && m.role === "assistant" && index === messages.length - 1 && (
                      <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4 bg-muted/10">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Japanese..."
              className="flex-1 bg-background"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}