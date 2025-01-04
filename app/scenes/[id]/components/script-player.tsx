"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Script } from "@/types/scene";

interface ScriptPlayerProps {
  script: Script;
}

const ScriptPlayer: React.FC<ScriptPlayerProps> = ({ script }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const handleEnded = useCallback(() => {
    setPlayingIndex(null);
  }, []);

  const togglePlay = useCallback(
    (index: number) => {
      const audio = audioRef.current;

      // If we're already playing this line, stop it
      if (playingIndex === index) {
        audio.pause();
        setPlayingIndex(null);
        return;
      }

      // If we're playing a different line, stop it first
      if (playingIndex !== null) {
        audio.pause();
      }

      // Play the new line
      if (script[index].audioUrl) {
        audio.src = script[index].audioUrl;
        audio.onended = handleEnded;
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          setPlayingIndex(null);
        });
        setPlayingIndex(index);
      }
    },
    [playingIndex, script, handleEnded]
  );

  return (
    <div className="space-y-4">
      {script.map((line, index) => (
        <div
          key={index}
          className="flex items-start gap-4 border-b pb-2 last:border-0"
        >
          <Button
            onClick={() => togglePlay(index)}
            variant="ghost"
            size="icon"
            className="mt-1 shrink-0"
            disabled={!line.audioUrl}
          >
            {playingIndex === index ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div>
            <div className="font-medium">{line.characterName}</div>
            <div className="mt-1 text-muted-foreground">{line.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScriptPlayer;
