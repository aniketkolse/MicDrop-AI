"use client";

import * as React from "react";
import { Loader2, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLES: Record<string, string> = {
  "en-IN": "Here is a quick look at how this voice sounds when it is telling a story.",
  "hi-IN": "नमस्ते! यह आवाज़ किसी कहानी को कितना जीवंत बना सकती है, यह सुनिए।",
  "mr-IN": "नमस्कार! ही आवाज एखादी गोष्ट किती सजीव करू शकते, ते ऐका.",
  "ta-IN": "வணக்கம்! இந்தக் குரல் ஒரு கதையை எவ்வளவு உயிர்ப்புடன் சொல்ல முடியும் என்று கேளுங்கள்.",
  "te-IN": "నమస్కారం! ఈ స్వరం ఒక కథను ఎంత సజీవంగా చెప్పగలదో వినండి.",
  "bn-IN": "নমস্কার! এই কণ্ঠস্বর একটি গল্পকে কতটা জীবন্ত করে তুলতে পারে, শুনুন।",
  "gu-IN": "નમસ્તે! આ અવાજ એક વાર્તાને કેટલી જીવંત બનાવી શકે છે, સાંભળો.",
  "kn-IN": "ನಮಸ್ಕಾರ! ಈ ಧ್ವನಿ ಒಂದು ಕಥೆಯನ್ನು ಎಷ್ಟು ಜೀವಂತವಾಗಿ ಹೇಳಬಲ್ಲದು ಎಂದು ಕೇಳಿ.",
  "ml-IN": "നമസ്കാരം! ഈ ശബ്ദം ഒരു കഥയെ എത്ര ജീവസുറ്റതാക്കും എന്ന് കേൾക്കൂ.",
  "pa-IN": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਇਹ ਆਵਾਜ਼ ਇੱਕ ਕਹਾਣੀ ਨੂੰ ਕਿੰਨਾ ਜੀਵੰਤ ਬਣਾ ਸਕਦੀ ਹੈ, ਸੁਣੋ।",
};

export function VoicePreviewButton({
  language,
  voiceId,
  className,
  label = "Preview voice",
  withLabel = false,
}: {
  language: string;
  voiceId: string;
  className?: string;
  label?: string;
  withLabel?: boolean;
}) {
  const [state, setState] = React.useState<"idle" | "loading" | "playing">("idle");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const urlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const stop = React.useCallback(() => {
    audioRef.current?.pause();
    setState("idle");
  }, []);

  const preview = React.useCallback(async () => {
    if (state === "playing") {
      stop();
      return;
    }
    setState("loading");
    try {
      const response = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: SAMPLES[language] ?? SAMPLES["en-IN"],
          language,
          voiceId,
          pace: 1,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { audios?: string[]; error?: string }
        | null;
      if (!response.ok || !payload?.audios?.length) {
        throw new Error(payload?.error || "Voice preview failed.");
      }
      const binary = atob(payload.audios[0]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.onended = () => setState("idle");
      await audio.play();
      setState("playing");
    } catch (error) {
      setState("idle");
      // Surface through the browser's own affordance minimally; page-level
      // actions surface detailed errors via the studio toast.
      console.error(error);
    }
  }, [language, state, stop, voiceId]);

  return (
    <button
      type="button"
      onClick={preview}
      title={label}
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-[#1A1A22] text-text-secondary transition-colors hover:border-[#4A4560] hover:text-primary",
        withLabel ? "h-7 px-2.5 text-[10.5px]" : "h-7 w-7",
        state === "playing" && "border-primary/40 text-primary",
        className,
      )}
    >
      {state === "loading" ? (
        <Loader2 className={cn("animate-spin", withLabel ? "h-3 w-3" : "h-3 w-3")} />
      ) : state === "playing" ? (
        <Square className="h-2.5 w-2.5 fill-current" />
      ) : (
        <Play className="ml-0.5 h-3 w-3 fill-current" />
      )}
      {withLabel ? (
        <span>{state === "loading" ? "Loading" : state === "playing" ? "Stop" : "Preview"}</span>
      ) : null}
    </button>
  );
}
