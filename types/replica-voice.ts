export interface ReplicaVoice {
  id: string;
  name: string;
  description: string;
  accent: string;
  gender: string;
  voiceAge: string;
  characteristics: string[];
  styles: {
    id: string;
    name: string;
  }[];
}
