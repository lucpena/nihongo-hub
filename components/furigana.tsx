import React from 'react';
import { cn } from "@/lib/utils"; // Importando o utilitário do Shadcn

export function FuriganaText({ 
  text, 
  className 
}: { 
  text: string; 
  className?: string; // Declaramos que o className é opcional
}) {
  const regex = /([^\s\[\]]+)\[([^\]]+)\]/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    elements.push(
      <ruby key={match.index}>
        {match[1]}
        <rt className="text-xs text-muted-foreground">{match[2]}</rt>
      </ruby>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  // Passamos a propriedade className para a tag root (span) usando o cn()
  return (
    <span className={cn(className)}>
      {elements.length > 0 ? elements : text}
    </span>
  );
}