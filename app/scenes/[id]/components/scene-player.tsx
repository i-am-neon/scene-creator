"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlayCircle,
  PauseCircle,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Character } from "@/types/character";
import { Scene, CharacterPositionMap } from "@/types/scene";

interface ScenePlayerProps {
  scene: Scene;
  characters: Character[];
}

const positionToClassName: Record<keyof CharacterPositionMap, string> = {
  "far-left": "left-0",
  "mid-left": "left-[16.66%]",
  left: "left-[33.33%]",
  right: "right-[33.33%]",
  "mid-right": "right-[16.66%]",
  "far-right": "right-0",
};

const ScenePlayer: React.FC<ScenePlayerProps> = ({ scene, characters }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldContinuePlayback, setShouldContinuePlayback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLine = scene.script[currentLineIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (currentLine.audioUrl) {
      const audio = new Audio(currentLine.audioUrl);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        if (currentLineIndex < scene.script.length - 1) {
          setCurrentLineIndex((prev) => prev + 1);
          if (shouldContinuePlayback) {
            setIsPlaying(true);
          }
        } else {
          setIsPlaying(false);
          setShouldContinuePlayback(false);
        }
      });

      if (shouldContinuePlayback) {
        audio.play();
        setIsPlaying(true);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
    };
  }, [
    currentLine.audioUrl,
    currentLineIndex,
    scene.script.length,
    shouldContinuePlayback,
  ]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setShouldContinuePlayback(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setShouldContinuePlayback(false);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setShouldContinuePlayback(false);
    }
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex((prev) => prev - 1);
      if (shouldContinuePlayback) {
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (currentLineIndex < scene.script.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
      if (shouldContinuePlayback) {
        setIsPlaying(true);
      }
    }
  };

  const getCharacterByName = (name: string) => {
    return characters.find((char) => char.displayName === name);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden mb-4">
        <Image
          src={scene.backgroundImageUrl}
          alt="Scene background"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
        />

        {Object.entries(scene.characterPositions).map(
          ([characterName, position]) => {
            const character = getCharacterByName(characterName);
            if (!character) return null;

            const isActive = currentLine.characterName === characterName;

            return (
              <div
                key={characterName}
                className={`absolute bottom-0 w-64 h-[450px] transition-all ${positionToClassName[position]}`}
                style={{
                  filter: isActive ? "brightness(100%)" : "brightness(50%)",
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={character.portraitUrl}
                    alt={character.displayName}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 25vw, 192px"
                  />
                </div>
              </div>
            );
          }
        )}
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="font-semibold mb-2 text-lg">
            {currentLine.characterName}
          </div>
          <div
            className={`text-lg ${
              currentLine.characterName === "Narrator" ? "italic" : ""
            }`}
          >
            {currentLine.text}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-4 mt-6 mb-4">
        <button
          onClick={handlePrevious}
          disabled={currentLineIndex === 0}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
          aria-label="Previous line"
        >
          <SkipBack className="w-8 h-8" />
        </button>

        {isPlaying ? (
          <button
            onClick={handlePause}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Pause"
          >
            <PauseCircle className="w-12 h-12" />
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Play"
          >
            <PlayCircle className="w-12 h-12" />
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Reset current line"
        >
          <RotateCcw className="w-8 h-8" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentLineIndex === scene.script.length - 1}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
          aria-label="Next line"
        >
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        Line {currentLineIndex + 1} of {scene.script.length}
      </div>
    </div>
  );
};

export default ScenePlayer;

