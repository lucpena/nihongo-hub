import React from 'react';
import { cn } from "@/lib/utils";

export function FuriganaText({ 
  text, 
  className,
  furiganaSize = "text-xs"
}: { 
  text: string; 
  className?: string;
  furiganaSize?: string;
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
        <rt className={cn(furiganaSize, "text-muted-foreground")}>{match[2]}</rt>
      </ruby>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return (
    <span className={cn(className)}>
      {elements.length > 0 ? elements : text}
    </span>
  );
}