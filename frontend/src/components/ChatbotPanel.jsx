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
    <div className="holo-card" style={{
      position: "fixed", bottom: 130, right: 24, zIndex: 2000,
      width: 360, maxHeight: 540,
      display: "flex", flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(90deg, rgba(255,110,199,0.15), rgba(120,115,245,0.15))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "linear-gradient(135deg, #FF6EC7, #7873F5)", padding: 6, borderRadius: 8 }}>
            <Bot size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#f8fafc", fontFamily: "Space Grotesk, sans-serif" }}>DRISHTI-AI Assistant</div>
            <div style={{ fontSize: "0.68rem", color: "#4FD8EA", fontWeight: 600 }}>Powered by Gemini Flash & RAG</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
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
              background: m.role === "user" ? "linear-gradient(120deg, #FF6EC7, #7873F5)" : "rgba(20, 20, 30, 0.85)",
              color: "#f8fafc",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
              boxShadow: m.role === "user" ? "0 4px 14px rgba(120, 115, 245, 0.3)" : "none"
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ background: "rgba(79, 216, 234, 0.15)", border: "1px solid rgba(79, 216, 234, 0.3)", borderRadius: 12, padding: "8px 14px", fontSize: "0.8rem", color: "#7EE8F5" }}>
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
            background: "rgba(79, 216, 234, 0.1)", color: "#7EE8F5", border: "1px solid rgba(79, 216, 234, 0.25)",
            borderRadius: 20, padding: "3px 9px", fontSize: "0.7rem", cursor: "pointer", fontWeight: 600, fontFamily: "Space Grotesk, sans-serif"
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
          className="holo-input"
          style={{
            flex: 1,
            padding: "8px 12px", fontSize: "0.82rem"
          }}
        />
        <button
          id="chatbot-send-btn"
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="holo-btn-primary"
          style={{
            borderRadius: 10, padding: "8px 14px",
            cursor: "pointer", display: "flex", alignItems: "center"
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
