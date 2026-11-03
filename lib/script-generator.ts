import { getLanguage } from "@/lib/voices";
import { chatCompletion, type ChatMessage } from "@/lib/sarvam";
import { normalizeVoiceId, safeJsonParse, scriptSchema, type RawScript } from "@/lib/validators";
import type { Audience, Depth, PodcastScript, PodcastStyle, ScriptSegment } from "@/types/podcast";

export interface ScriptInput {
  sourceType: "topic" | "prompt" | "document" | "text";
  topic: string;
  sourceText: string;
  duration: 2 | 5 | 10 | 15;
  language: string;
  speakerCount: 1 | 2 | 3;
  style: PodcastStyle;
  audience: Audience;
  depth: Depth;
  voiceIds?: string[];
}

const STYLE_DIRECTION: Record<PodcastStyle, string> = {
  educational:
    "Teach through conversation. One host can play the curious learner while the other explains with concrete examples and analogies.",
  casual:
    "Sound like two smart friends who happened to press record. Relaxed, witty, specific. No lecture voice.",
  interview:
    "One host interviews the other as a knowledgeable guest. Ask real follow-up questions, probe specifics, let the guest push back.",
  debate:
    "Give each speaker a genuinely different thesis. Steelman both sides, disagree respectfully, and never let them simply agree with everything.",
  news:
    "Treat it like a current-affairs desk: lead with the development, add context, then discuss implications and what to watch next. Do not invent breaking-news facts or claim live reporting.",
  storytelling:
    "Build a narrative arc with scenes, turning points and a payoff. Keep exposition embedded in the story rather than recited.",
};

const AUDIENCE_DIRECTION: Record<Audience, string> = {
  general: "Intelligent general listeners with no specialist background.",
  beginners: "Complete beginners. Define every term the first time it appears.",
  students: "Students revising the subject. Prioritise clear mental models and examples.",
  professionals: "Working professionals who want practical implications, not definitions.",
  enthusiasts: "Engaged enthusiasts who already know the basics and want depth and nuance.",
};

const DEPTH_DIRECTION: Record<Depth, string> = {
  overview: "Stay high-level: the big picture, three or four key ideas, no rabbit holes.",
  standard: "Balanced coverage of the main ideas, one or two supporting examples each.",
  deep: "Go deep: mechanisms, trade-offs, counterarguments and concrete examples.",
};

function targetWords(duration: number): number {
  return Math.round(duration * 135);
}

function speakerBrief(count: number): string {
  if (count === 1) return "One host delivering a crafted solo monologue. No fake co-host.";
  if (count === 2)
    return "Two speakers: a lead host (host1) who drives the show and a co-host (host2) who reacts, challenges and adds expertise.";
  return "Three speakers: a lead host (host1), a co-host (host2), and a specialist guest (host3). Give each a distinct personality and point of view.";
}

export function buildScriptMessages(input: ScriptInput): ChatMessage[] {
  const language = getLanguage(input.language);
  const words = targetWords(input.duration);
  const segmentTarget = Math.max(4, Math.min(24, Math.round(input.duration * 1.2)));
  const source =
    input.sourceType === "topic" || !input.sourceText.trim()
      ? `Topic: ${input.topic || input.sourceText.slice(0, 300)}`
      : `SOURCE MATERIAL (use this as the factual basis; summarise and restructure it, do not copy verbatim):\n${input.sourceText.slice(0, 40000)}`;

  const system = `You are the head showrunner for MICDROP AI, a professional podcast studio. You write scripts that sound like real, compelling audio — never like two people reading alternating encyclopedia paragraphs.

OUTPUT CONTRACT
Return ONLY one valid JSON object. No markdown, no code fences, no commentary before or after.
Shape:
{
  "title": "string",
  "description": "string (2-3 sentences, written like a real episode note)",
  "speakers": [
    { "id": "host1", "name": "string", "role": "string" }
  ],
  "segments": [
    { "id": "segment1", "heading": "string (short chapter label)", "speaker": "host1", "text": "spoken dialogue" }
  ]
}

HARD RULES
- Exactly ${input.speakerCount} speaker(s), ids host1..host${input.speakerCount}, unique names, distinct personalities.
- Each segment is ONE speaker turn. Never put two speakers in one segment.
- ${segmentTarget} segments total, roughly ${Math.round(words / segmentTarget)} spoken words per segment (about ${words} words overall, ${input.duration} minutes at 135 wpm).
- Dialogue must be entirely in ${language.label} (${language.code}), written in ${language.native} script. Do not write dialogue in English (except a natural loanword where a native speaker would use it), and do not transliterate Indic languages into Latin script.
- Write speech only: no markdown, no stage directions, no "(laughs)", no "[pause]", no sound-effect cues, no speaker labels inside text.
- Open with a genuine hook in the first 20 seconds — a question, a tension, a surprising fact — not "Welcome to another episode" boilerplate.
- Include natural conversational moves: reactions, short follow-ups, one respectful challenge or disagreement, and a callback near the end. Vary sentence length.
- Close with a conclusion that earns its ending. One clear takeaway and a forward-looking line. No generic "thanks for listening" filler repeated by every speaker.
- Do not invent quotes, statistics, studies or live-news claims. If a specific number is uncertain, speak qualitatively. This is AI-generated background, not verified web research.
- Segment headings are internal labels for the editor, not spoken text.

STYLE
${STYLE_DIRECTION[input.style]}

AUDIENCE
${AUDIENCE_DIRECTION[input.audience]}

DEPTH
${DEPTH_DIRECTION[input.depth]}

SPEAKER FORMAT
${speakerBrief(input.speakerCount)}`;

  const user = `Create the episode.

TITLE DIRECTION: ${input.topic ? `Working title: ${input.topic}` : "Derive a sharp, specific title from the source."}
REQUESTED DURATION: ${input.duration} minutes
LANGUAGE: ${language.label} (${language.code})
SPEAKERS: ${input.speakerCount}
STYLE: ${input.style}
AUDIENCE: ${input.audience}
DEPTH: ${input.depth}

${source}

Return the JSON object now.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

function repairScript(raw: RawScript, input: ScriptInput): PodcastScript {
  const speakerIds = raw.speakers.map((s) => s.id);
  const uniqueSpeakers = raw.speakers.filter(
    (s, i) => speakerIds.indexOf(s.id) === i,
  );
  const speakers = uniqueSpeakers.slice(0, input.speakerCount).map((speaker, index) => ({
    ...speaker,
    id: speaker.id || `host${index + 1}`,
    name: speaker.name.trim(),
    role: speaker.role.trim(),
    voiceId: input.voiceIds?.[index] ? normalizeVoiceId(input.voiceIds[index]) : undefined,
  }));

  const fallbackSpeaker = speakers[0]?.id ?? "host1";
  const seen = new Set<string>();
  const segments: ScriptSegment[] = [];

  raw.segments.forEach((segment, index) => {
    const speaker = speakers.some((s) => s.id === segment.speaker)
      ? segment.speaker
      : speakers[index % speakers.length]?.id ?? fallbackSpeaker;
    const text = segment.text.replace(/\s+/g, " ").trim();
    if (!text) return;
    let id = segment.id || `segment${index + 1}`;
    while (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    segments.push({
      id,
      heading: segment.heading.trim() || `Part ${index + 1}`,
      speaker,
      text,
    });
  });

  if (segments.length < 3) {
    throw new Error("The model returned too few dialogue segments.");
  }

  return {
    title: raw.title.trim(),
    description: raw.description.trim(),
    duration: input.duration * 60,
    language: input.language as PodcastScript["language"],
    speakers,
    segments,
    researchNote:
      "Written from Sarvam-105B model knowledge. No live web research was performed; treat specific claims as AI-generated background, not verified reporting.",
  };
}

export async function generateScript(input: ScriptInput): Promise<PodcastScript> {
  const messages = buildScriptMessages(input);
  let lastError = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    const content = await chatCompletion(messages, 6000);
    const parsed = safeJsonParse<RawScript>(content);
    if (!parsed) {
      lastError = "The model response was not valid JSON.";
    } else {
      const validated = scriptSchema.safeParse(parsed);
      if (validated.success) {
        try {
          return repairScript(validated.data, input);
        } catch (error) {
          lastError = error instanceof Error ? error.message : "Script was structurally incomplete.";
        }
      } else {
        lastError = validated.error.issues
          .slice(0, 3)
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
      }
    }

    messages.push({ role: "assistant", content: content.slice(0, 20000) });
    messages.push({
      role: "user",
      content: `Your previous response was invalid: ${lastError}\nReturn ONLY the corrected JSON object for the SAME episode. No prose, no code fences.`,
    });
  }

  throw new Error(
    `Script generation failed validation twice (${lastError}). Please retry — a different sample usually succeeds.`,
  );
}
