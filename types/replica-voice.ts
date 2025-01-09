type VoiceStyle = {
  id: string;
  name: string;
  speakerId: string;
};

export interface ReplicaVoice {
  id: string;
  name: string;
  description: string;
  accent: string;
  gender: string;
  voiceAge: string;
  characteristics: string[];
  styles: VoiceStyle[];
  defaultStyle: VoiceStyle;
}

