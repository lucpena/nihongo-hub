"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FuriganaText } from "./furigana";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";


// shuffle array with Fisher-Yates
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function BombSession({ initialCards }: { initialCards: any[] }) {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const progressPercentage = ((currentIndex) / cards.length) * 100;
  //const [sessionStartTime, setSessionStartTime] = useState(Date.now());


  // Embaralha logo que o componente monta
  useEffect(() => {
    setCards(shuffleArray(initialCards));
  }, [initialCards]);

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];


  const handleAnswer = async (isCorrect: boolean) => {
    setIsSubmitting(true);

    try {
      // xp earned
      fetch("/api/games/review-bomb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect }),
      });

      // game loop
      if (currentIndex + 1 >= cards.length) {
        setCards(shuffleArray(cards));  // shuffles again
        setCurrentIndex(0);             // back to begining
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
      
      setIsFlipped(false);

    } catch (error) {
      console.error("Erro ao enviar resposta", error);
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

        {currentCard.deck_name && (
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
            {currentCard.deck_name}
          </div>
        )}

      </div>

      <Card 
        className="w-full max-w-4xl min-h-80 flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:shadow-lg"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          {!isFlipped ? (
            <span>
              <FuriganaText
                text= {currentCard.face}
                className="text-5xl font-bold tracking-tight mb-2" 
              />
              <span className="text-lg">
                {currentCard.content?.ja_on && (
                <div>
                  {currentCard.content?.ja_on}
                </div>)}
                {currentCard.content?.ja_kun && (
                <div>
                  {currentCard.content?.ja_kun}
                </div>)}
                
                {currentCard.content?.kana !== currentCard.face && (
                <div>
                  {currentCard.content?.kana}
                </div>)}

              </span>
            </span>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300 w-full">
              <span>
                <h2 className="text-5xl font-bold tracking-tight mb-2">{currentCard.face}</h2>
                <span className="text-lg">
                  {currentCard.content?.ja_on && (
                  <div>
                    {currentCard.content?.ja_on}
                  </div>)}
                  {currentCard.content?.ja_kun && (
                  <div>
                    {currentCard.content?.ja_kun}
                  </div>)}

                  {currentCard.content?.kana !== currentCard.face && (
                  <div>
                    {currentCard.content?.kana}
                  </div>)}
                  
                </span>
              </span>

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
              className="flex-1 h-16 border-red-200 hover:bg-red-50 text-red-600 text-lg font-semibold cursor-pointer" 
              onClick={() => handleAnswer(false)}
              disabled={isSubmitting}
            >
              Incorrect
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-16 border-green-200 hover:bg-green-50 text-green-600 text-lg font-semibold cursor-pointer" 
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

//   return (
//     <div className="flex flex-col items-center w-full space-y-6">
//       <div 
//         className="w-full h-64 p-6 border rounded-xl shadow-lg flex flex-col items-center justify-center cursor-pointer bg-white transition-all"
//         onClick={() => !isFlipped && setIsFlipped(true)}
//       >
//         <div className="text-2xl text-center">
//           {/* Aqui você pode usar o seu componente de FuriganaText */}
//           {currentCard.face}
//         </div>

//         {isFlipped && (
//           <div className="mt-8 pt-4 border-t w-full text-center text-lg text-gray-700">
//              {/* Exiba o verso/conteúdo da carta dependendo do seu modelo */}
//              {currentCard.content?.meaning || currentCard.content?.back || "Resposta não encontrada"}
//           </div>
//         )}
//       </div>

//       {!isFlipped ? (
//         <Button 
//           className="w-full max-w-sm" 
//           onClick={() => setIsFlipped(true)}
//         >
//           Show Answer
//         </Button>
//       ) : (
//         <div className="flex gap-4 w-full max-w-sm">
//           <Button 
//             variant="destructive" 
//             className="w-full" 
//             disabled={isSubmitting}
//             onClick={() => handleResponse(false)}
//           >
//             Incorrect
//           </Button>
//           <Button 
//             variant="default" 
//             className="w-full bg-green-600 hover:bg-green-700" 
//             disabled={isSubmitting}
//             onClick={() => handleResponse(true)}
//           >
//             Correct
//           </Button>
//         </div>
//       )}
//     </div>
//   );
}