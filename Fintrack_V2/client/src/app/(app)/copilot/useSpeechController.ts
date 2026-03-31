"use client";

import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export type CopilotState = "idle" | "listening" | "thinking" | "speaking";

export interface UseSpeechControllerReturn {
  status: CopilotState;
  transcript: string;
  response: string;
  startListening: () => void;
  stopInteraction: () => void;
  submitTextQuery: (text: string) => void;
}

export function useSpeechController(): UseSpeechControllerReturn {
  const [status, setStatus]       = useState<CopilotState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse]   = useState(
    "Hello! I am your AI Wealth Copilot. I can analyze your portfolio, keep you on budget, and help you grow your wealth. Just ask!"
  );

  // ── Stable refs so callbacks never go stale ──────────────────────
  const recognitionRef  = useRef<any>(null);
  const synthesisRef    = useRef<SpeechSynthesis | null>(null);
  const statusRef       = useRef<CopilotState>("idle");

  // Keep statusRef in sync with state
  const setStatusSynced = useCallback((s: CopilotState) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ── Lazy-init Web APIs (avoids SSR crash) ────────────────────────
  const ensureApis = useCallback(() => {
    if (typeof window === "undefined") return false;

    if (!synthesisRef.current) {
      synthesisRef.current = window.speechSynthesis;
    }

    if (!recognitionRef.current) {
      const SR =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SR) return false;

      const rec = new SR();
      rec.continuous      = false;
      rec.interimResults  = false;
      rec.lang            = "en-US";

      rec.onresult = (event: any) => {
        const text: string = event.results[0][0].transcript;
        setTranscript(text);
        handleQuery(text);       // safe — handleQuery is a stable ref below
      };

      rec.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          toast.error("Microphone: " + event.error);
        }
        setStatusSynced("idle");
      };

      rec.onend = () => {
        // Only fall back to idle if we're still "listening"
        // (could already be "thinking" if result fired first)
        if (statusRef.current === "listening") setStatusSynced("idle");
      };

      recognitionRef.current = rec;
    }

    return true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Speak helper ─────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    const synth = synthesisRef.current;
    if (!synth) return;
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);

    // Pick a premium English voice when available
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

  // ── Core query handler (stable ref via useCallback) ───────────────
  // FIX 1: handleQuery is defined with useCallback so rec.onresult can
  //         call it without a stale closure.
  // FIX 2: TransformInterceptor wraps the body as { success, data }.
  //         The controller returns { response: string }, so the actual
  //         text lives at res.data.data.response (not res.data.response).
  const handleQuery = useCallback(async (text: string) => {
    if (!text.trim()) { setStatusSynced("idle"); return; }

    setStatusSynced("thinking");
    setResponse("");

    try {
      const res = await api.post("/copilot/chat", { transcript: text });

      // TransformInterceptor wraps: { success: true, data: { response: "..." } }
      // api.post returns the axios response, so res.data is the outer envelope.
      const aiText: string =
        res.data?.data?.response   // TransformInterceptor path  ✓
        ?? res.data?.response      // fallback (no interceptor)   ✓
        ?? "I couldn't get a response right now.";

      setResponse(aiText);
      speak(aiText);
    } catch (err: any) {
      const msg =
        err.response?.data?.data?.message ||
        err.response?.data?.message       ||
        err.message                        ||
        "Failed to contact Copilot.";
      toast.error(msg);
      const fallback = "My connection to the financial ledger was interrupted. Please try again.";
      setResponse(fallback);
      speak(fallback);
    }
  }, [setStatusSynced, speak]);

  // ── Public API ───────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!ensureApis()) {
      toast.error("Speech recognition is not supported in this browser. Use the text input.");
      return;
    }
    if (statusRef.current !== "idle") stopInteractionInner();

    try {
      setTranscript("");
      recognitionRef.current!.start();
      setStatusSynced("listening");
    } catch {
      toast.error("Failed to start microphone.");
      setStatusSynced("idle");
    }
  }, [ensureApis, setStatusSynced]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopInteractionInner = useCallback(() => {
    recognitionRef.current?.abort();
    synthesisRef.current?.cancel();
    setStatusSynced("idle");
  }, [setStatusSynced]);

  const stopInteraction = stopInteractionInner;

  const submitTextQuery = useCallback((text: string) => {
    ensureApis();                     // init synthesis if needed
    if (statusRef.current !== "idle") stopInteractionInner();
    setTranscript(text);
    handleQuery(text);
  }, [ensureApis, stopInteractionInner, handleQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, transcript, response, startListening, stopInteraction, submitTextQuery };
}