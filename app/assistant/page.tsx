"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Cpu,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAssistantChat, useUserProfile } from "@/lib/useStore";
import { ChatMessage } from "@/lib/types";

// Suggested starter questions
const SUGGESTED_QUESTIONS = [
  "Quelle formation correspond le mieux à un profil fort en Mathématiques et Python ?",
  "Quels sont les prérequis pour intégrer le Master ISAIA ?",
  "Quelle est la différence entre ISAIA et IGGLIA ?",
  "Quels débouchés professionnels offre la filière RIT ?",
  "Puis-je accéder à un Master ISPM avec un Bac Scientifique ?",
];

export default function AssistantChatPage() {
  const { messages, sendMessage, clearChat } = useAssistantChat();
  const { profile } = useUserProfile();

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputQuery]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputQuery).trim();
    if (!text || isLoading) return;

    setError(null);
    setInputQuery("");

    // Save user message to store
    const userMsg = sendMessage({ sender: "user", content: text });

    setIsLoading(true);

    try {
      // Build history to send (exclude tool metadata, just content)
      const history = [
        ...messages,
        { sender: "user", content: text },
      ] as ChatMessage[];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          profile: {
            currentLevel: profile.currentLevel,
            preferredSubjects: profile.preferredSubjects,
            preferredWorkEnvironment: profile.preferredWorkEnvironment,
            completenessPercentage: profile.completenessPercentage,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion au modèle.");
      }

      sendMessage({
        sender: "assistant",
        content: data.content,
        confidence: "high",
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Erreur inattendue.";
      setError(errorMsg);
      sendMessage({
        sender: "assistant",
        content: `Désolé, une erreur s'est produite : ${errorMsg}`,
        confidence: "low",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    clearChat();
    setError(null);
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              ORIENT&apos;IA Assistant Chat
              <Badge variant="emerald" size="sm">
                llama3-70b · Groq
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">
              Posez vos questions sur les formations ISPM, prérequis et débouchés.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          leftIcon={<Trash2 className="w-4 h-4 text-slate-400" />}
        >
          Réinitialiser
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-y-auto p-4 space-y-4 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === "user"
                  ? "bg-emerald-700 border-emerald-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              {msg.sender === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-emerald-700" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                msg.sender === "user"
                  ? "bg-emerald-700 text-white rounded-tr-none"
                  : "bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap font-medium">{msg.content}</p>

              {/* Suggested follow-up actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-600/30">
                  {msg.suggestedActions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug.label)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {sug.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Confidence badge */}
              {msg.sender === "assistant" && msg.confidence && (
                <div className="pt-1 flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Réponse générée par Groq · {msg.confidence === "high" ? "Confiance Élevée" : "Confiance Modérée"}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
              <Cpu className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>ORIENT&apos;IA consulte le référentiel pédagogique ISPM...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested starter questions (shown when only initial message) */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3 shrink-0">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors font-medium disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-3 space-y-2 shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Posez votre question à ORIENT'IA (Shift+Entrée pour aller à la ligne)..."
            rows={1}
            className="flex-1 resize-none px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors disabled:opacity-50 leading-relaxed"
          />
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            disabled={!inputQuery.trim() || isLoading}
            leftIcon={!isLoading ? <Send className="w-3.5 h-3.5" /> : undefined}
          >
            Envoyer
          </Button>
        </form>

        {/* Mandatory Disclaimer */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          ORIENT&apos;IA est un outil d&apos;aide à l&apos;orientation. Ses réponses ne constituent pas une décision officielle d&apos;admission. ·{" "}
          <span className="font-mono">llama3-70b-8192 · Groq Cloud</span>
        </p>
      </div>
    </div>
  );
}
