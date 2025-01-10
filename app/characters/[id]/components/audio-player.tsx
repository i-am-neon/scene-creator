"use client";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

interface VoicePlayerProps {
  url: string;
}

export default function MyAudioPlayer({ url }: VoicePlayerProps) {
  return (
    <div className="mt-4">
      <AudioPlayer
        src={url}
        autoPlayAfterSrcChange={false}
        showJumpControls={false}
        layout="stacked"
      />
    </div>
  );
}

