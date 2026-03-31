"use client";

import { motion } from "framer-motion";

interface AvatarProps {
  status: "idle" | "listening" | "thinking" | "speaking";
}

export default function Avatar({ status }: AvatarProps) {
  const getImage = () => {
    switch (status) {
      case "listening":
      case "thinking":
        return "/avatars/thinking.png";
      case "speaking":
        return "/avatars/speaking.png";
      case "idle":
      default:
        return "/avatars/idle.png";
    }
  };

  return (
    <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
      {/* Glow effect for speaking or listening */}
      {(status === "listening" || status === "speaking") && (
        <motion.div
           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
           transition={{ repeat: Infinity, duration: status === 'speaking' ? 0.8 : 1.5 }}
           style={{
             position: 'absolute', inset: -20, borderRadius: '50%',
             background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%)',
             zIndex: 0
           }}
        />
      )}
      
      {status === "thinking" && (
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
           style={{
             position: 'absolute', inset: -10, borderRadius: '50%',
             border: '2px dashed rgba(99,102,241,0.5)',
             zIndex: 0
           }}
        />
      )}

      {/* Main Avatar Image */}
      <motion.img
        key={status} // force re-render transition
        initial={{ opacity: 0.5, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        src={getImage()}
        alt={`Avatar is ${status}`}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          borderRadius: "50%", zIndex: 1, position: "relative",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
          border: "2px solid rgba(255,255,255,0.05)"
        }}
      />
    </div>
  );
}
