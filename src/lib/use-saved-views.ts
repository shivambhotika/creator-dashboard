"use client";

import { useCallback, useState } from "react";

export interface SavedView<T> {
  name: string;
  state: T;
  createdAt: string;
}

export function useSavedViews<T extends Record<string, string>>(
  key: string,
  currentState: T,
  applyState: (state: T) => void
) {
  const [views, setViews] = useState<SavedView<T>[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as SavedView<T>[] : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next: SavedView<T>[]) => {
    setViews(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  }, [key]);

  const saveView = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const next = [
      { name: clean, state: currentState, createdAt: new Date().toISOString() },
      ...views.filter((v) => v.name.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 8);
    persist(next);
  }, [currentState, persist, views]);

  const applyView = useCallback((name: string) => {
    const view = views.find((v) => v.name === name);
    if (view) applyState(view.state);
  }, [applyState, views]);

  const deleteView = useCallback((name: string) => {
    persist(views.filter((v) => v.name !== name));
  }, [persist, views]);

  return { views, saveView, applyView, deleteView };
}
