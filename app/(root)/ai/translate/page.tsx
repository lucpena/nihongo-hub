"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Languages } from "lucide-react";

export default function TranslatePage() {
  // Estado para controlar nosso Toggle Switch
  const [server, setServer] = useState<"local" | "homelab">("local");
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setCompletion(""); 

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, server }),
      });

      if (!res.ok) throw new Error("Error in the requisition.");

      const data = await res.text();      
      setCompletion(data);
    } catch (error) {
        console.error("Error: ", error);
        setCompletion("Conection error. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-8rem)] min-w-5xl max-w-6xl mx-auto p-6 space-y-10">
      
      <div className="flex flex-col items-center space-y-5">
        <h1 className="text-5xl font-bold flex items-center gap-4 text-primary tracking-tight">
          <Languages className="h-12 w-12" />
          Translate
        </h1>
        
        <div className="flex items-center space-x-4 bg-muted/50 p-2 rounded-full px-6 border shadow-sm">
          <Label 
            htmlFor="server-toggle" 
            className={`text-sm font-medium cursor-pointer transition-colors ${server === "local" ? "text-primary" : "text-muted-foreground"}`}
          >
            Local
          </Label>
          <Switch
            id="server-toggle"
            checked={server === "homelab"}
            onCheckedChange={(checked) => setServer(checked ? "homelab" : "local")}
          />
          <Label 
            htmlFor="server-toggle" 
            className={`text-sm font-medium cursor-pointer transition-colors ${server === "homelab" ? "text-primary" : "text-muted-foreground"}`}
          >
            Homelab
          </Label>
        </div>
      </div>

      {(completion || isLoading) && (
        <Card className="w-full min-h-[300px] flex items-center justify-center p-10 bg-primary/5 border-primary/20 shadow-lg transition-all duration-500 ease-in-out rounded-3xl">
          <CardContent className="text-center p-0 text-3xl font-medium tracking-wide">
            {isLoading && !completion ? (
              <div className="flex flex-col items-center space-y-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <span className="text-lg font-normal"></span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{completion}</p> 
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="w-full relative shadow-sm rounded-3xl group">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)} // Agora usamos o onChange nativo
          placeholder="Digita ou cola o texto japonês ou português aqui..."
          className="min-h-[250px] resize-none text-2xl p-8 pr-24 rounded-3xl bg-background border-2 focus-visible:ring-primary shadow-inner leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="absolute bottom-8 right-8 h-16 w-16 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {isLoading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Send className="h-7 w-7 ml-1" />}
        </Button>
      </form>

    </div>
  );
}