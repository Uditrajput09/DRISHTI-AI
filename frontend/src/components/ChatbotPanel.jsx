/**
 * frontend/src/components/ChatbotPanel.jsx
 * Gemini Flash-powered AI chatbot sidebar for DRISHTI-AI questions.
 */
import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Minimize2, Sparkles } from "lucide-react";
import { api } from "../api";

const QUICK_QUESTIONS = [
  "Which zone is most at risk today?",
  "Should residents near Sohra evacuate?",
  "What causes landslides in East Khasi Hills?",
  "How do I submit a field report?"
];

export default function ChatbotPanel({ zones = [], onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am the DRISHTI-AI assistant. Ask me anything about current landslide risks, zone status, or what to do during an emergency.",
      ts: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    const userMsg = { role: "user", text: text.trim(), ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text.trim() })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.answer, ts: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, I could not reach the AI backend. Please check your connection.", ts: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", bottom: 90, right: 24, zIndex: 2000,
      width: 360, maxHeight: 540,
      background: "rgba(11, 17, 30, 0.97)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(6, 182, 212, 0.3)",
      borderRadius: 16,
      boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
      display: "flex", flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "linear-gradient(135deg, #06b6d4, #0284c7)", padding: 6, borderRadius: 8 }}>
            <Bot size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#f8fafc" }}>DRISHTI-AI Assistant</div>
            <div style={{ fontSize: "0.68rem", color: "#06b6d4" }}>Powered by Gemini Flash</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              padding: "8px 12px",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.role === "user" ? "linear-gradient(135deg, #0284c7, #06b6d4)" : "rgba(30, 41, 59, 0.8)",
              color: "#f8fafc",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none"
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ background: "rgba(6,182,212,0.2)", borderRadius: 12, padding: "8px 14px", fontSize: "0.8rem", color: "#06b6d4" }}>
              <Sparkles size={13} style={{ marginRight: 4 }} />Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Questions */}
      <div style={{ padding: "6px 12px", display: "flex", flexWrap: "wrap", gap: 5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} style={{
            background: "rgba(6,182,212,0.1)", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.25)",
            borderRadius: 20, padding: "3px 9px", fontSize: "0.7rem", cursor: "pointer", fontWeight: 600
          }}>
            {q.length > 30 ? q.slice(0, 28) + "…" : q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
        <input
          id="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask about any zone or risk..."
          style={{
            flex: 1, background: "rgba(15,23,42,0.8)", color: "#e2e8f0",
            border: "1px solid var(--border-glass)", borderRadius: 10,
            padding: "7px 12px", fontSize: "0.82rem", outline: "none"
          }}
        />
        <button
          id="chatbot-send-btn"
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          style={{
            background: "linear-gradient(135deg, #0284c7, #06b6d4)",
            border: "none", borderRadius: 10, padding: "7px 12px",
            color: "#fff", cursor: "pointer", display: "flex", alignItems: "center"
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
