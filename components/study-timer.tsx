"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

// states
type TimerStatus = "idle" | "running" | "paused" | "stopped";

export function StudyTimer() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === "running") {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status]);

  const handlePlay = () => {
    // resset time when stop is pressed
    if (status === "stopped" || status === "idle") {
      setSeconds(0);
    }
    // if it was paused, resumes from the current seconds
    setStatus("running");
  };

  const handlePause = () => {
    setStatus("paused");
  };

  const handleStop = async () => {
    if (seconds === 0) return; // prevent saving 0 seconds
    
    const timeToSave = seconds;
    setStatus("stopped"); // pauses the timer and keeps the final time on screen
    setIsSaving(true);

    try {
      await fetch('/api/user/time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionSeconds: timeToSave })
      });
    } catch (error) {
      console.error("Failed to save study time");
    } finally {
      setIsSaving(false);
    }
  };

  // format seconds to MM:SS for the display
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col gap-2 px-2 py-3 bg-sidebar-accent/50 rounded-lg mx-2 mb-2">
      {/* display */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Study Session
        </span>
        <span className="font-mono font-bold text-primary tracking-widest">
          {formatTime(seconds)}
        </span>
      </div>
      
      {/* controls */}
      <div className="flex items-center gap-2">
        {status === "running" ? (
          <Button variant="secondary" size="sm" className="flex-1 cursor-pointer" onClick={handlePause}>
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button variant="default" size="sm" className="flex-1 cursor-pointer" onClick={handlePlay}>
            <Play className="h-4 w-4 mr-2" />
            Play
          </Button>
        )}
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1 cursor-pointer" 
          onClick={handleStop}
          // only enable stop if there is actually time to save
          disabled={status === "idle" || status === "stopped" || isSaving}
        >
          {/* fdill the square to make it look like a classic stop button */}
          <Square className="h-4 w-4 mr-2 fill-current" />
          {isSaving ? "Saving" : "Stop"}
        </Button>
      </div>
    </div>
  );
}