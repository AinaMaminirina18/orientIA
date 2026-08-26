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

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(StorageRepository.getUserProfile());

  useEffect(() => {
    setProfile(StorageRepository.getUserProfile());
    return subscribeToStore(() => {
      setProfile(StorageRepository.getUserProfile());
    });
  }, []);

  return {
    profile,
    updateProfile: (updated: Partial<UserProfile>) => StorageRepository.saveUserProfile(updated),
  };
}

export function useFormations() {
  const [formations, setFormations] = useState<ISPMFormation[]>(StorageRepository.getFormations());

  useEffect(() => {
    setFormations(StorageRepository.getFormations());
    return subscribeToStore(() => {
      setFormations(StorageRepository.getFormations());
    });
  }, []);

  return {
    formations,
    getFormation: (id: string) => StorageRepository.getFormationById(id),
  };
}

export function useRecommendation() {
  const [recommendation, setRecommendation] = useState<RecommendationResult>(
    StorageRepository.getRecommendation()
  );

  useEffect(() => {
    setRecommendation(StorageRepository.getRecommendation());
    return subscribeToStore(() => {
      setRecommendation(StorageRepository.getRecommendation());
    });
  }, []);

  return {
    recommendation,
    recompute: () => StorageRepository.recomputeRecommendation(),
  };
}

export function useSources() {
  const [sources, setSources] = useState<RAGSource[]>(StorageRepository.getSources());

  useEffect(() => {
    setSources(StorageRepository.getSources());
    return subscribeToStore(() => {
      setSources(StorageRepository.getSources());
    });
  }, []);

  return { sources };
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(StorageRepository.getChatMessages());

  useEffect(() => {
    setMessages(StorageRepository.getChatMessages());
    return subscribeToStore(() => {
      setMessages(StorageRepository.getChatMessages());
    });
  }, []);

  return {
    messages,
    sendMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) =>
      StorageRepository.addChatMessage(msg),
    clearChat: () => StorageRepository.clearChat(),
  };
}

export function useEvaluation() {
  const [testCases, setTestCases] = useState<EvaluationTestCase[]>(
    StorageRepository.getEvaluationTests()
  );
  const [traces, setTraces] = useState<ExecutionTrace[]>(StorageRepository.getExecutionTraces());

  useEffect(() => {
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
    resetAll: () => StorageRepository.resetAllData(),
  };
}
