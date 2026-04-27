"use client"

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { FuriganaText } from "./furigana";

interface StudyCard {
  id: string;
  face: string;
  content: any;
  type: string;
  progressId: string | null;
}

export default function StudySession({ initialCards, deckId, userId }: { 
  initialCards: StudyCard[], 
  deckId: string,
  userId: string 
}) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCard = cards[currentIndex];
  const progressPercentage = ((currentIndex) / cards.length) * 100;

  const handleAnswer = async (isCorrect: boolean) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          deckId,
          userId,
          isCorrect,
        }),
      });

      if (response.ok) {
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsFlipped(false);
        } else {
          router.push("/"); 
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error saving review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 items-center">
      <div className="w-full max-w-md flex flex-col gap-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{currentIndex + 1} / {cards.length}</span>
        </div>
        <ProgressBar value={progressPercentage} className="h-2" />
      </div>

      <Card 
        className="w-full max-w-4xl min-h-[400px] cursor-pointer flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:shadow-lg"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          {!isFlipped ? (
            <h2 className="text-5xl font-bold tracking-tight">{currentCard.face}</h2>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300 w-full">
              <h2 className="text-3xl font-bold border-b pb-4 opacity-50">{currentCard.face}</h2>
              
              {typeof currentCard.content === 'string' ? (
                // simple text
                <div className="text-2xl text-primary font-medium">
                  {currentCard.content}
                </div>
              ) : (
                // JSON processing
                <>
                  {/* meaning */}
                  <div className="text-2xl text-primary font-medium">
                    {currentCard.content?.meaning || JSON.stringify(currentCard.content)}
                  </div>

                  {/* example 1 */}
                  {(currentCard.content?.ex1_ja_furigana || currentCard.content?.ex1_ja || currentCard.content?.examples) && (
                    <div className="flex flex-col gap-2 border-t pt-4">
                      <FuriganaText 
                        text={currentCard.content?.ex1_ja_furigana || currentCard.content?.ex1_ja || currentCard.content?.examples} 
                        className="text-3xl font-bold" 
                      />
                      {currentCard.content?.ex1_en && (
                        <div className="text-xl font-thin">
                          {currentCard.content.ex1_en}
                        </div>
                      )}
                    </div>
                  )}

                  {/* example 2 if exists */}
                  {(currentCard.content?.ex2_ja_furigana || currentCard.content?.ex2_ja) && (
                    <div className="flex flex-col gap-2 pt-4">
                      <FuriganaText 
                        text={currentCard.content?.ex2_ja_furigana || currentCard.content?.ex2_ja} 
                        className="text-3xl font-bold" 
                      />
                      {currentCard.content?.ex2_en && (
                        <div className="text-xl font-thin">
                          {currentCard.content.ex2_en}
                        </div>
                      )}
                    </div>
                  )}

                  {/* notes if exists*/}
                  {currentCard.content?.note && (
                    <div className="text-xl font-medium rounded-2xl mt-4 py-6 px-2 bg-gray-100">
                      "{currentCard.content.note}"
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="w-full max-w-2xl flex flex-col items-center gap-4">
        {!isFlipped ? (
          <Button 
            size="lg" 
            className="w-full max-w-xs h-16 text-xl"
            onClick={() => setIsFlipped(true)}
          >
            Show Answer
          </Button>
        ) : (
          <div className="flex gap-4 w-full max-w-md">
            <Button 
              variant="outline" 
              className="flex-1 h-16 border-red-200 hover:bg-red-50 text-red-600 text-lg font-semibold" 
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
            >
              Incorrect
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-16 border-green-200 hover:bg-green-50 text-green-600 text-lg font-semibold" 
              onClick={() => handleAnswer(true)}
              disabled={isSubmitting}
            >
              Correct
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}