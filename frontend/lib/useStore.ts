"use client";

import { useState, useEffect } from "react";
import { StorageRepository, subscribeToStore } from "./storage";
import {
  UserProfile,
  ISPMFormation,
  RecommendationResult,
  RAGSource,
  ChatMessage,
  EvaluationTestCase,
  ExecutionTrace,
} from "./types";
import {
  INITIAL_USER_PROFILE,
  INITIAL_RECOMMENDATION,
  ISPM_FORMATIONS,
  INITIAL_RAG_SOURCES,
  INITIAL_CHAT_MESSAGES,
  INITIAL_EVALUATION_TESTS,
  INITIAL_EXECUTION_TRACES,
} from "./mockData";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setProfile(StorageRepository.getUserProfile());
    return subscribeToStore(() => {
      setProfile(StorageRepository.getUserProfile());
    });
  }, []);

  return {
    profile,
    isMounted,
    updateProfile: (updated: Partial<UserProfile>) => StorageRepository.saveUserProfile(updated),
  };
}

export function useFormations() {
  const [formations, setFormations] = useState<ISPMFormation[]>(ISPM_FORMATIONS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setFormations(StorageRepository.getFormations());
    return subscribeToStore(() => {
      setFormations(StorageRepository.getFormations());
    });
  }, []);

  return {
    formations,
    isMounted,
    getFormation: (id: string) => StorageRepository.getFormationById(id),
  };
}

export function useRecommendation() {
  const [recommendation, setRecommendation] = useState<RecommendationResult>(INITIAL_RECOMMENDATION);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setRecommendation(StorageRepository.getRecommendation());
    return subscribeToStore(() => {
      setRecommendation(StorageRepository.getRecommendation());
    });
  }, []);

  return {
    recommendation,
    isMounted,
    recompute: () => StorageRepository.recomputeRecommendation(),
  };
}

export function useSources() {
  const [sources, setSources] = useState<RAGSource[]>(INITIAL_RAG_SOURCES);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSources(StorageRepository.getSources());
    return subscribeToStore(() => {
      setSources(StorageRepository.getSources());
    });
  }, []);

  return { sources, isMounted };
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setMessages(StorageRepository.getChatMessages());
    return subscribeToStore(() => {
      setMessages(StorageRepository.getChatMessages());
    });
  }, []);

  return {
    messages,
    isMounted,
    sendMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) =>
      StorageRepository.addChatMessage(msg),
    clearChat: () => StorageRepository.clearChat(),
  };
}

export function useEvaluation() {
  const [testCases, setTestCases] = useState<EvaluationTestCase[]>(INITIAL_EVALUATION_TESTS);
  const [traces, setTraces] = useState<ExecutionTrace[]>(INITIAL_EXECUTION_TRACES);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTestCases(StorageRepository.getEvaluationTests());
    setTraces(StorageRepository.getExecutionTraces());
    return subscribeToStore(() => {
      setTestCases(StorageRepository.getEvaluationTests());
      setTraces(StorageRepository.getExecutionTraces());
    });
  }, []);

  return {
    testCases,
    traces,
    isMounted,
    resetAll: () => StorageRepository.resetAllData(),
  };
}
