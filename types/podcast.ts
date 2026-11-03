export type LanguageCode =
  | "en-IN"
  | "hi-IN"
  | "mr-IN"
  | "ta-IN"
  | "te-IN"
  | "bn-IN"
  | "gu-IN"
  | "kn-IN"
  | "ml-IN"
  | "pa-IN";

export type SourceType = "topic" | "prompt" | "document" | "text";

export type PodcastStyle =
  | "educational"
  | "casual"
  | "interview"
  | "debate"
  | "news"
  | "storytelling";

export type Audience =
  | "general"
  | "beginners"
  | "professionals"
  | "students"
  | "enthusiasts";

export type Depth = "overview" | "standard" | "deep";

export interface VoiceOption {
  id: string;
  name: string;
  gender: "female" | "male";
  style: string;
}

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  native: string;
  model: string;
  voices: VoiceOption[];
}

export interface PodcastSettings {
  sourceType: SourceType;
  topic: string;
  sourceText: string;
  fileName?: string;
  duration: 2 | 5 | 10 | 15;
  language: LanguageCode;
  speakerCount: 1 | 2 | 3;
  style: PodcastStyle;
  audience: Audience;
  depth: Depth;
  pace: number;
  voiceIds: string[];
  musicEnabled: boolean;
  musicVolume: number;
}

export interface ScriptSpeaker {
  id: string;
  name: string;
  role: string;
  voiceId?: string;
}

export interface ScriptSegment {
  id: string;
  heading: string;
  speaker: string;
  text: string;
}

export interface PodcastScript {
  title: string;
  description: string;
  duration: number;
  language: LanguageCode;
  speakers: ScriptSpeaker[];
  segments: ScriptSegment[];
  researchNote: string;
}

export interface EpisodeMeta {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  duration: number;
  language: LanguageCode;
  speakerNames: string[];
  style: PodcastStyle;
  script: PodcastScript;
  settings: PodcastSettings;
  hasAudio: boolean;
}

export interface SegmentProgress {
  index: number;
  segmentId: string;
  status: "pending" | "generating" | "done" | "failed";
  error?: string;
}

export interface GenerationState {
  running: boolean;
  segments: SegmentProgress[];
  current: number;
  total: number;
  phase: "idle" | "voices" | "mixing" | "encoding" | "done" | "error";
  error?: string;
}

export interface PlayerState {
  url: string | null;
  title: string;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  rate: number;
}
