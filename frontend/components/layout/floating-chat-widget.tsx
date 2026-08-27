"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  Maximize2,
  MessageSquareCode,
  RotateCcw,
} from "lucide-react";
import { useUserProfile } from "@/lib/useStore";

interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: WidgetMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Bonjour ! Je suis ORIENT'IA, votre conseiller d'orientation ISPM. Posez-moi vos questions sur les formations, les prérequis ou vos débouchés.",
};

export function FloatingChatWidget() {
  const { profile } = useUserProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");

    const userMsg: WidgetMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history for API (exclude welcome msg, map to API format)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ sender: m.role === "user" ? "user" : "assistant", content: m.content }));

      history.push({ sender: "user", content: text });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          profile: {
            name: profile.name,
            currentLevel: profile.currentLevel,
            preferredSubjects: profile.preferredSubjects,
            academicGrades: profile.academicGrades,
            declaredSkills: profile.declaredSkills,
            interests: profile.interests,
            preferredWorkEnvironment: profile.preferredWorkEnvironment,
            completenessPercentage: profile.completenessPercentage,
          },
        }),
      });

      const data = await res.json();
      const reply = data.content || "Désolé, je n'ai pas pu générer une réponse.";

      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Le service est momentanément indisponible. Réessayez dans quelques instants.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <>
      {/* ── Popover Chat Panel ─────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold leading-none">ORIENT&apos;IA</p>
                <p className="text-[10px] text-emerald-400 font-medium mt-0.5 leading-none">
                  Assistant ISPM
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Reset */}
              <button
                onClick={handleReset}
                title="Réinitialiser la conversation"
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {/* Open full page */}
              <Link
                href="/assistant"
                title="Ouvrir l'assistant complet"
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                title="Fermer"
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                    msg.role === "user"
                      ? "bg-emerald-700 border-emerald-800"
                      : "bg-slate-200 border-slate-300"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-emerald-700" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-xl leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="flex gap-2 flex-row">
                <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-emerald-700" />
                </div>
                <div className="px-3 py-2 rounded-xl rounded-tl-none bg-white border border-slate-200 shadow-xs flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
                  <span className="text-slate-400 text-[11px]">ORIENT&apos;IA réfléchit…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="shrink-0 px-3 py-2.5 border-t border-slate-200 bg-white flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question…"
              disabled={isLoading}
              className="flex-1 text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Bubble Button ─────────────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Fermer l'assistant" : "Ouvrir l'assistant ORIENT'IA"}
        className={`fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full shadow-2xl border transition-all duration-300 select-none group ${
          isOpen
            ? "bg-slate-800 border-slate-700 text-white"
            : "bg-slate-900 border-emerald-700/50 text-white hover:bg-slate-800 hover:border-emerald-500"
        }`}
      >
        {/* Bot avatar with pulse when closed */}
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600/30 border border-emerald-500/50 ${
              !isOpen ? "group-hover:scale-110 transition-transform" : ""
            }`}
          >
            {isOpen ? (
              <X className="w-4 h-4 text-emerald-400" />
            ) : (
              <MessageSquareCode className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          {/* Pulse ring when closed */}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
          )}
        </div>
        <span className="text-xs font-bold tracking-wide whitespace-nowrap">
          {isOpen ? "Fermer" : "Besoin d'aide ?"}
        </span>
      </button>
    </>
  );
}
