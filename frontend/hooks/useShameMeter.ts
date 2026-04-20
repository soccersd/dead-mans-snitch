"use client";

import { useState, useRef, useCallback } from "react";

interface ShameMeterState {
  score: number;
  message: string;
  loading: boolean;
  accepted: boolean;
}

interface UseShameMeterReturn extends ShameMeterState {
  analyzeSecret: (content: string, walletAddress?: string) => void;
  reset: () => void;
}

const initialState: ShameMeterState = {
  score: 0,
  message: "",
  loading: false,
  accepted: false,
};

export function useShameMeter(): UseShameMeterReturn {
  const [state, setState] = useState<ShameMeterState>(initialState);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setState(initialState);
  }, []);

  const analyzeSecret = useCallback(
    (content: string, walletAddress?: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // If content is empty or too short, reset and don't call API
      if (!content || content.length < 10) {
        setState((prev) => ({
          ...prev,
          score: 0,
          accepted: false,
          loading: false,
        }));
        return;
      }

      // Set loading state immediately
      setState((prev) => ({ ...prev, loading: true }));

      // Debounce the API call
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const response = await fetch("/api/judge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content,
              wallet_address: walletAddress || "",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to analyze secret");
          }

          const data = await response.json();

          setState({
            score: data.score,
            message: data.message,
            loading: false,
            accepted: data.score >= 60,
          });
        } catch (error) {
          console.error("Error analyzing secret:", error);
          setState((prev) => ({
            ...prev,
            loading: false,
            message: "The Judge cannot hear you right now...",
          }));
        }
      }, 500);
    },
    []
  );

  return {
    ...state,
    analyzeSecret,
    reset,
  };
}
