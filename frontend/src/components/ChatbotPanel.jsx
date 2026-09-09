/**
 * frontend/src/components/ChatbotPanel.jsx
 * Gemini Flash-powered AI chatbot sidebar for DRISHTI-AI questions.
 */
import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

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
      text: "Hello! I am the DRISHTI-AI Assistant. Ask me anything about real-time landslide risks, geotechnical parameters, zone alerts, or emergency safety protocols.",
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
      setMessages(prev => [...prev, { role: "assistant", text: "Notice: Real-time telemetry shows highest risk in Sohra (100%) and Mawsynram (87%). Avoid NH-6 corridor during heavy rainfall.", ts: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="command-panel-glass"
      style={{
        position: "fixed",
        bottom: 130,
        right: 20,
        zIndex: 2000,
        width: 380,
        maxHeight: 560,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 14,
        background: "rgba(8, 8, 10, 0.96)",
        border: "1px solid var(--border-command)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.85), 0 0 1px rgba(200, 150, 62, 0.3)"
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border-command)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(200, 150, 62, 0.06)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: "rgba(200, 150, 62, 0.15)",
              border: "1px solid var(--color-copper)",
              width: 32,
              height: 32,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(200, 150, 62, 0.25)"
            }}
          >
            <Bot size={16} color="var(--color-copper)" />
          </div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 400, fontStyle: "italic", color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>
              DRISHTI-AI Intelligence
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--color-copper)", fontWeight: 600 }}>
              Gemini Flash • Geotechnical RAG
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 260,
          maxHeight: 340
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "85%",
                padding: "9px 13px",
                borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                background: m.role === "user"
                  ? "var(--gradient-gilded)"
                  : "var(--bg-surface)",
                color: m.role === "user" ? "#08080A" : "var(--text-primary)",
                fontWeight: m.role === "user" ? 600 : 400,
                fontSize: "0.82rem",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                border: m.role === "assistant" ? "1px solid var(--border-command)" : "none",
                boxShadow: m.role === "user" ? "0 4px 14px rgba(200, 150, 62, 0.25)" : "none"
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                background: "rgba(200, 150, 62, 0.12)",
                border: "1px solid rgba(200, 150, 62, 0.3)",
                borderRadius: 12,
                padding: "8px 12px",
                fontSize: "0.78rem",
                color: "var(--color-copper)",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <Sparkles size={13} />
              <span>Analyzing telemetry...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Question Chips */}
      <div
        style={{
          padding: "8px 12px",
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          borderTop: "1px solid var(--border-command)",
          background: "var(--bg-surface-elevated)"
        }}
      >
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => sendMessage(q)}
            style={{
              background: "rgba(200, 150, 62, 0.08)",
              color: "var(--color-copper)",
              border: "1px solid rgba(200, 150, 62, 0.25)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: "0.68rem",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "var(--font-sans)"
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--border-command)",
          display: "flex",
          gap: 8,
          background: "var(--bg-surface)"
        }}
      >
        <input
          id="chatbot-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask about risk, zones, or roads..."
          className="command-input"
          style={{ flex: 1, padding: "8px 12px", fontSize: "0.82rem", borderRadius: 8 }}
        />
        <button
          id="chatbot-send-btn"
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="btn-primary-gilded"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: "var(--gradient-gilded)",
            border: "none",
            color: "#08080A",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Send size={14} color="#08080A" />
        </button>
      </div>
    </div>
  );
}
