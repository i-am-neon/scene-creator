"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Character } from "@/types/character";
import { Scene, CharacterPositionMap } from "@/types/scene";

interface ScenePlayerProps {
  scene: Scene;
  characters: Character[];
}

const positionToClassName: Record<keyof CharacterPositionMap, string> = {
  "far-left": "left-4",
  "mid-left": "left-1/4",
  left: "left-1/3",
  right: "right-1/3",
  "mid-right": "right-1/4",
  "far-right": "right-4",
};

const ScenePlayer: React.FC<ScenePlayerProps> = ({ scene, characters }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLine = scene.script[currentLineIndex];

  useEffect(() => {
    // Reset audio element when line changes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // If there's an audio URL for the current line, play it
    if (currentLine.audioUrl) {
      const audio = new Audio(currentLine.audioUrl);
      audioRef.current = audio;

      audio.addEventListener("ended", () => {
        // Auto-advance to next line when audio finishes
        if (currentLineIndex < scene.script.length - 1) {
          setCurrentLineIndex((prev) => prev + 1);
        }
        setIsPlaying(false);
      });

      audio.play();
      setIsPlaying(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
    };
  }, [currentLine.audioUrl, currentLineIndex, scene.script.length]);

  // Find character info by name
  const getCharacterByName = (name: string) => {
    return characters.find((char) => char.displayName === name);
  };

  const handleNext = () => {
    if (currentLineIndex < scene.script.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Scene container with background */}
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden mb-4">
        <Image
          src={scene.backgroundImageUrl}
          alt="Scene background"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1536px) 100vw, 1536px"
        />

        {/* Character portraits */}
        {Object.entries(scene.characterPositions).map(
          ([characterName, position]) => {
            const character = getCharacterByName(characterName);
            if (!character) return null;

            const isActive = currentLine.characterName === characterName;

            return (
              <div
                key={characterName}
                className={`absolute bottom-0 w-48 h-72 transition-opacity ${positionToClassName[position]}`}
                style={{
                  opacity: isActive ? 1 : 0.5,
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

      {/* Dialog box */}
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

      {/* Navigation controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentLineIndex === 0 || isPlaying}
          className="px-6 py-3 bg-gray-200 rounded-lg disabled:opacity-50 text-lg"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentLineIndex === scene.script.length - 1 || isPlaying}
          className="px-6 py-3 bg-gray-200 rounded-lg disabled:opacity-50 text-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ScenePlayer;
