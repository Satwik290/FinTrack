"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";

type CopilotState = "idle" | "listening" | "thinking" | "speaking";

interface UseSpeechControllerReturn {
  status: CopilotState;
  transcript: string;
  response: string;
  startListening: () => void;
  stopInteraction: () => void;
  submitTextQuery: (text: string) => void;
}

export function useSpeechController(): UseSpeechControllerReturn {
  const [status, setStatus] = useState<CopilotState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("Hello! I am your AI Wealth Copilot. I can analyze your portfolio, keep you on budget, and help you grow your wealth. Just ask!");
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize standard Web Speech API
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const currentText = event.results[0][0].transcript;
          setTranscript(currentText);
          handleQuerySubmission(currentText);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error !== "no-speech") {
            toast.error("Microphone issue: " + event.error);
          }
          setStatus("idle");
        };

        recognitionRef.current.onend = () => {
          setStatus((prev) => (prev === "listening" ? "idle" : prev));
        };
      } else {
        console.warn("Speech recognition not supported in this browser.");
      }
    }
    
    return () => {
       if (recognitionRef.current) {
         recognitionRef.current.abort();
       }
       if (synthesisRef.current) {
         synthesisRef.current.cancel();
       }
    }
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!synthesisRef.current) return;
    synthesisRef.current.cancel(); // Stop any ongoing speech
    
    // Choose voice - just picking first available premium english
    const voices = synthesisRef.current.getVoices();
    const premiumVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Premium')) || voices.find(v => v.lang.includes('en'));

    const utterance = new SpeechSynthesisUtterance(text);
    if (premiumVoice) {
       utterance.voice = premiumVoice;
    }
    utterance.rate = 1.05; // Slightly faster for AI feel
    utterance.pitch = 1.0;

    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");

    synthesisRef.current.speak(utterance);
  }, []);

  const handleQuerySubmission = async (text: string) => {
    if (!text.trim()) {
      setStatus("idle");
      return;
    }
    setStatus("thinking");
    setResponse(""); // Clear previous

    try {
      const res = await api.post('/copilot/chat', { transcript: text });
      const aiResponseText = res.data.response;
      setResponse(aiResponseText);
      speakResponse(aiResponseText);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to contact Copilot backend.";
      toast.error(errMsg);
      setResponse("My connection to the financial ledger was interrupted. Please try again.");
      speakResponse("My connection to the financial ledger was interrupted. Please try again.");
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition API is not supported in this browser. Please use text input.");
      return;
    }
    
    if (status === "speaking" || status === "thinking") {
      stopInteraction();
    }
    
    try {
      setTranscript("");
      recognitionRef.current.start();
      setStatus("listening");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start microphone.");
      setStatus("idle");
    }
  };

  const stopInteraction = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setStatus("idle");
  };

  const submitTextQuery = (text: string) => {
    if (status === "speaking" || status === "thinking" || status === "listening") {
      stopInteraction();
    }
    setTranscript(text);
    handleQuerySubmission(text);
  };

  return {
    status,
    transcript,
    response,
    startListening,
    stopInteraction,
    submitTextQuery
  };
}
