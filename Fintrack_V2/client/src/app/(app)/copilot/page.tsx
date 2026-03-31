"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, CornerDownLeft, Sparkles } from "lucide-react";
import Avatar from "./Avatar";
import { useSpeechController } from "./useSpeechController";

export default function CopilotPage() {
  const { status, transcript, response, startListening, stopInteraction, submitTextQuery } = useSpeechController();
  const [textInput, setTextInput] = useState("");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    submitTextQuery(textInput);
    setTextInput("");
  };

  return (
    <div style={{
      maxWidth: 900, margin: "0 auto", minHeight: "calc(100vh - 120px)",
      display: "flex", flexDirection: "column", position: "relative"
    }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>AI Wealth Copilot</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Your personal CA and CFA integrated into FinTrack.</p>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: "linear-gradient(145deg, #0f1117 0%, #1a1f2e 100%)",
        borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)",
        padding: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        
        {/* State Information */}
        <div style={{ height: 30, marginBottom: 20 }}>
          <AnimatePresence mode="wait">
             <motion.p
               key={status}
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               style={{
                 fontSize: 14, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                 color: status === "listening" ? "#10b981" : status === "thinking" ? "#f59e0b" : status === "speaking" ? "#6366f1" : "rgba(255,255,255,0.3)"
               }}>
               {status === "listening" ? "Listening to your request..." :
                status === "thinking" ? "Analyzing financial ledger..." :
                status === "speaking" ? "Copilot is speaking" :
                "Ready for your command"}
             </motion.p>
          </AnimatePresence>
        </div>

        {/* 3D Avatar */}
        <div style={{ marginBottom: 40 }}>
           <Avatar status={status} />
        </div>

        {/* Conversation Text */}
        <div style={{ width: "100%", maxWidth: 600, minHeight: 120, textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
          {transcript && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic" }}>
                "{transcript}"
              </p>
            </motion.div>
          )}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p style={{ fontSize: 18, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.6 }}>
                {response}
              </p>
            </motion.div>
          )}
        </div>
        
        {/* Controls Container (Absolute attached to bottom of UI) */}
        <div style={{ marginTop: "auto", width: "100%", maxWidth: 600 }}>
           <form onSubmit={handleFormSubmit} style={{
             display: "flex", alignItems: "center", gap: 12,
             background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
             padding: "8px 12px", borderRadius: 16, transition: "border 0.2s"
           }}>
              <input
                 type="text"
                 placeholder="Type your financial query or use voice..."
                 value={textInput}
                 onChange={e => setTextInput(e.target.value)}
                 disabled={status === "listening" || status === "thinking"}
                 style={{
                   flex: 1, background: "transparent", border: "none", color: "var(--text-primary)",
                   fontSize: 15, padding: "8px 12px", outline: "none"
                 }}
              />
              
              <AnimatePresence mode="popLayout">
                {textInput.trim() ? (
                  <motion.button
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    type="submit"
                    className="btn btn-primary btn-icon" style={{ borderRadius: 12 }}
                  >
                    <CornerDownLeft size={16} />
                  </motion.button>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: "flex", gap: 8 }}>
                    {status !== "idle" ? (
                      <button type="button" onClick={stopInteraction} className="btn btn-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <Square size={16} fill="currentColor" />
                      </button>
                    ) : (
                      <button type="button" onClick={startListening} className="btn btn-primary btn-icon" style={{ borderRadius: 12 }}>
                        <Mic size={16} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
           </form>

           <div style={{ textAlign: "center", marginTop: 16 }}>
             <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Powered by Gemini 1.5 Flash. Financial data remains private to zero-trust processing.</p>
           </div>
        </div>

      </div>
    </div>
  );
}
