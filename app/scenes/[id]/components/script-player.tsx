"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Script } from "@/types/scene";

interface ScriptPlayerProps {
  script: Script;
}

const ScriptPlayer: React.FC<ScriptPlayerProps> = ({ script }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const handleEnded = useCallback(() => {
    if (currentIndex < script.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentIndex(-1);
    }
  }, [currentIndex, script.length]);

  useEffect(() => {
    const audio = audioRef.current;

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [handleEnded]);

  useEffect(() => {
    const audio = audioRef.current;

    if (currentIndex >= 0 && script[currentIndex].audioId) {
      audio.src = script[currentIndex].audioId;
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
          handleEnded();
        });
      }
    }
  }, [currentIndex, isPlaying, script, handleEnded]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleReset = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentIndex(-1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={togglePlay} variant="outline" size="icon">
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="icon"
          disabled={currentIndex === -1}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {script.map((line, index) => (
          <div
            key={index}
            className={`border-b pb-2 last:border-0 transition-colors ${
              index === currentIndex ? "bg-muted p-2 rounded" : ""
            }`}
          >
            <div className="font-medium">{line.characterName}</div>
            <div className="mt-1 text-muted-foreground">{line.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScriptPlayer;

