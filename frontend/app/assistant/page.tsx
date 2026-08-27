"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Cpu,
  ShieldCheck,
  Trash2,
  AlertCircle,
  User,
  Bot,
  ChevronRight,
  FileText,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAssistantChat, useUserProfile } from "@/lib/useStore";
import { ChatMessage } from "@/lib/types";
import { checkApiHealth } from "@/lib/services/api/health";
import { ApiStatusState } from "@/lib/types/api/health";

// Suggested starter questions
const SUGGESTED_QUESTIONS = [
  "Quelle formation correspond le mieux à un profil fort en Mathématiques et Python ?",
  "Quels sont les prérequis pour intégrer le Master ISAIA ?",
  "Quelle est la différence entre ISAIA et IGGLIA ?",
  "Quels débouchés professionnels offre la filière ESIIA ?",
  "Puis-je accéder à un Master ISPM avec un Bac Scientifique ?",
];

// Helper function to format inline markdown (bolding **text**, code `text`)
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const codeParts = text.split(/(`.*?`)/g);

  return codeParts.map((part, codeIdx) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={codeIdx}
          className="px-1.5 py-0.5 rounded bg-slate-100 text-emerald-800 font-mono text-[11px] border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const boldParts = part.split(/(\*\*.*?\*\*|__.*?__)/g);
    return (
      <React.Fragment key={codeIdx}>
        {boldParts.map((bPart, boldIdx) => {
          if (
            (bPart.startsWith("**") && bPart.endsWith("**")) ||
            (bPart.startsWith("__") && bPart.endsWith("__"))
          ) {
            return (
              <strong key={boldIdx} className="font-bold text-slate-900">
                {bPart.slice(2, -2)}
              </strong>
            );
          }
          return bPart;
        })}
      </React.Fragment>
    );
  });
}

// Full Markdown Renderer Component for LLM Assistant Chat Bubbles
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-xs leading-relaxed break-words whitespace-pre-wrap font-sans text-slate-800">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        // 1. Headers: #, ##, ###, ####
        if (line.startsWith("#")) {
          const match = line.match(/^(#{1,4})\s*(.*)$/);
          if (match) {
            const level = match[1].length;
            const titleText = match[2];
            const inlineRendered = renderInlineMarkdown(titleText);

            if (level === 1 || level === 2) {
              return (
                <h2
                  key={idx}
                  className="font-extrabold text-sm text-slate-900 mt-3 mb-1.5 pt-2 border-b border-slate-200 pb-1 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{inlineRendered}</span>
                </h2>
              );
            }
            return (
              <h3
                key={idx}
                className="font-bold text-xs sm:text-sm text-slate-900 mt-2.5 mb-1 text-emerald-950 flex items-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{inlineRendered}</span>
              </h3>
            );
          }
        }

        // 2. Blockquotes: > text
        if (line.startsWith(">")) {
          const quoteText = line.replace(/^>\s*/, "");
          return (
            <div
              key={idx}
              className="p-2.5 bg-emerald-50/80 border-l-3 border-emerald-600 rounded-r-md text-[11px] text-emerald-950 font-medium my-1.5 leading-relaxed"
            >
              {renderInlineMarkdown(quoteText)}
            </div>
          );
        }

        // 3. Unordered Lists: - item, * item, • item
        if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
          const listText = line.replace(/^[-*•]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="text-emerald-600 font-bold text-sm shrink-0 leading-none mt-0.5">•</span>
              <div className="flex-1">{renderInlineMarkdown(listText)}</div>
            </div>
          );
        }

        // 4. Numbered Lists: 1. item, 2. item
        const numMatch = line.match(/^(\d+)\.\s*(.*)$/);
        if (numMatch) {
          const num = numMatch[1];
          const listText = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 my-0.5">
              <span className="text-emerald-700 font-bold font-mono text-[11px] shrink-0 min-w-[16px]">
                {num}.
              </span>
              <div className="flex-1">{renderInlineMarkdown(listText)}</div>
            </div>
          );
        }

        // 5. Standard Paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AssistantChatPage() {
  const { messages, sendMessage, clearChat } = useAssistantChat();
  const { profile } = useUserProfile();

  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatusState | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Check FastAPI Health Status on mount (Phase 1 of SKILL-3)
  useEffect(() => {
    let isSubscribed = true;
    checkApiHealth().then((status) => {
      if (isSubscribed) {
        setApiStatus(status);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

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
    sendMessage({ sender: "user", content: text });

    setIsLoading(true);

    try {
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

      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion au service d'orientation.");
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
        content: `Désolé, le service d'orientation est momentanément indisponible : ${errorMsg}`,
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
    <div className="flex flex-col max-w-4xl mx-auto h-[calc(100vh-8.5rem)] sm:h-[calc(100vh-9.5rem)] min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs mb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>ORIENT&apos;IA Assistant Chat</span>
              
              {/* Discrete Health Badge (Phase 1 of SKILL-3) */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-50 border-slate-200">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiStatus?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span className="text-slate-700">
                  {apiStatus?.isOnline
                    ? `FastAPI Render (${apiStatus.modelStatus})`
                    : "Mode Local (Groq Engine)"}
                </span>
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Posez vos questions sur les 16 formations ISPM, prérequis et débouchés.
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
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-y-auto p-4 space-y-4 mb-3 scroll-smooth">
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

            {/* Bubble Container */}
            <div
              className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 overflow-hidden ${
                msg.sender === "user"
                  ? "bg-emerald-700 text-white rounded-tr-none"
                  : "bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none shadow-2xs"
              }`}
            >
              {msg.sender === "user" ? (
                <p className="whitespace-pre-wrap font-medium break-words">{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} />
              )}

              {/* Suggested follow-up actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
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

              {/* Confidence & Source Badge */}
              {msg.sender === "assistant" && (
                <div className="pt-1 flex items-center justify-between gap-2 text-[10px] text-slate-400 font-semibold border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Réponse ORIENT&apos;IA · Confiance Élevée</span>
                  </span>
                  
                  <a
                    href="/Brochure%20officielle%20ISPM"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Brochure officielle ISPM</span>
                  </a>
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-600">
              <Cpu className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
              <span>ORIENT&apos;IA interroge l&apos;API ... Le modèle ML prépare la réponse.</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Service momentanément indisponible</span>
              <span>{error}</span>
            </div>
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
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
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

        {/* Mandatory Disclaimer (Article 16) */}
        <p className="text-[10px] text-slate-500 text-center leading-relaxed bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
          <span className="font-bold text-slate-700">Mention obligatoire :</span> ORIENT’IA constitue un outil d’aide à l’orientation. Ses recommandations ne remplacent ni l’avis d’un conseiller pédagogique ni une décision officielle d’admission.
        </p>
      </div>
    </div>
  );
}
