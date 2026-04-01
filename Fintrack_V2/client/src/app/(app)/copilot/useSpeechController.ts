"use client";

import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export type CopilotState = "idle" | "listening" | "thinking" | "speaking";

export interface UseSpeechControllerReturn {
  status: CopilotState;
  transcript: string;
  startListening: () => void;
  stopInteraction: () => void;
  submitTextQuery: (text: string) => void;
}

export interface UseSpeechControllerOptions {
  /** Fired with AI reply text — page appends to its own message list */
  onReply: (text: string) => void;
  /** When true, TTS output is suppressed */
  muted?: boolean;
}

export function useSpeechController(
  options: UseSpeechControllerOptions,
): UseSpeechControllerReturn {
  const [status, setStatus]         = useState<CopilotState>("idle");
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthesisRef   = useRef<SpeechSynthesis | null>(null);
  const statusRef      = useRef<CopilotState>("idle");

  // Always-fresh refs — updated every render, zero re-render cost
  const onReplyRef = useRef(options.onReply);
  const mutedRef   = useRef(options.muted ?? false);
  onReplyRef.current = options.onReply;
  mutedRef.current   = options.muted ?? false;

  /* ── sync helper ─────────────────────────────── */
  const setStatusSynced = useCallback((s: CopilotState) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  /* ── lazy Web API init ───────────────────────── */
  const ensureApis = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    if (!synthesisRef.current) synthesisRef.current = window.speechSynthesis;

    if (!recognitionRef.current) {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SR) return false;

      const rec          = new SR();
      rec.continuous     = false;
      rec.interimResults = false;
      rec.lang           = "en-US";

      rec.onresult = (event: any) => {
        const text: string = event.results[0][0].transcript;
        setTranscript(text);
        // runQueryRef.current is always the latest version — no stale closure
        runQueryRef.current(text);
      };
      rec.onerror = (event: any) => {
        if (event.error !== "no-speech") toast.error("Mic: " + event.error);
        setStatusSynced("idle");
      };
      rec.onend = () => {
        if (statusRef.current === "listening") setStatusSynced("idle");
      };

      recognitionRef.current = rec;
    }
    return true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── TTS ─────────────────────────────────────── */
  const speak = useCallback((text: string) => {
    if (mutedRef.current) { setStatusSynced("idle"); return; }
    const synth = synthesisRef.current;
    if (!synth) { setStatusSynced("idle"); return; }
    synth.cancel();

    const utter  = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice  =
      voices.find(v => v.lang.startsWith("en") && v.name.includes("Premium")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      null;
    if (voice) utter.voice = voice;
    utter.rate  = 1.05;
    utter.pitch = 1.0;

    utter.onstart = () => setStatusSynced("speaking");
    utter.onend   = () => setStatusSynced("idle");
    utter.onerror = () => setStatusSynced("idle");

    synth.speak(utter);
  }, [setStatusSynced]);

  /* ── query runner (stored in ref so rec.onresult is never stale) ── */
  const runQueryRef = useRef<(text: string) => void>(() => {});
  runQueryRef.current = async (text: string) => {
    if (!text.trim()) { setStatusSynced("idle"); return; }
    setStatusSynced("thinking");

    try {
      const res = await api.post("/copilot/chat", { transcript: text });

      // TransformInterceptor wraps as { success: true, data: { response: "..." } }
      const aiText: string =
        res.data?.data?.response ??
        res.data?.response        ??
        "I couldn't get a response right now.";

      // Deliver to page via stable callback ref — no useState dependency chain
      onReplyRef.current(aiText);
      speak(aiText);
    } catch (err: any) {
      const msg =
        err.response?.data?.data?.message ||
        err.response?.data?.message       ||
        err.message                        ||
        "Failed to reach Copilot.";
      toast.error(msg);
      const fallback = "My connection was interrupted. Please try again.";
      onReplyRef.current(fallback);
      speak(fallback);
    }
  };

  // Stable wrapper so components can call it without worrying about identity
  const runQuery = useCallback((text: string) => {
    runQueryRef.current(text);
  }, []);

  /* ── stop ────────────────────────────────────── */
  const stopInteraction = useCallback(() => {
    recognitionRef.current?.abort();
    synthesisRef.current?.cancel();
    setStatusSynced("idle");
  }, [setStatusSynced]);

  /* ── start listening ─────────────────────────── */
  const startListening = useCallback(() => {
    if (!ensureApis()) {
      toast.error("Speech recognition not supported. Use the text input.");
      return;
    }
    if (statusRef.current !== "idle") stopInteraction();
    try {
      setTranscript("");
      recognitionRef.current!.start();
      setStatusSynced("listening");
    } catch {
      toast.error("Failed to start microphone.");
      setStatusSynced("idle");
    }
  }, [ensureApis, stopInteraction, setStatusSynced]);

  /* ── submit text ─────────────────────────────── */
  const submitTextQuery = useCallback((text: string) => {
    ensureApis();
    if (statusRef.current !== "idle") stopInteraction();
    setTranscript(text);
    runQuery(text);
  }, [ensureApis, stopInteraction, runQuery]);

  return { status, transcript, startListening, stopInteraction, submitTextQuery };
}