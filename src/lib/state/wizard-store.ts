"use client";
import { create } from "zustand";
import type { BirthInput, Gender, CalendarType } from "@/lib/bazi/types";

interface WizardState {
  step: 0 | 1 | 2 | 3 | 4;
  draft: Partial<BirthInput>;
  setName: (v: string) => void;
  setGender: (v: Gender) => void;
  setCalendar: (v: CalendarType) => void;
  setDate: (year: number, month: number, day: number, isLeap?: boolean) => void;
  setTime: (hour: number, minute: number) => void;
  setLocation: (city: string, longitude: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  isComplete: () => boolean;
  toBirthInput: () => BirthInput | null;
}

const initial: Partial<BirthInput> = {
  gender: "男",
  calendar: "solar",
  longitude: 120,
};

export const useWizard = create<WizardState>((set, get) => ({
  step: 0,
  draft: { ...initial },
  setName: (name) => set((s) => ({ draft: { ...s.draft, name } })),
  setGender: (gender) => set((s) => ({ draft: { ...s.draft, gender } })),
  setCalendar: (calendar) => set((s) => ({ draft: { ...s.draft, calendar } })),
  setDate: (year, month, day, isLeapMonth) =>
    set((s) => ({ draft: { ...s.draft, year, month, day, isLeapMonth } })),
  setTime: (hour, minute) => set((s) => ({ draft: { ...s.draft, hour, minute } })),
  setLocation: (city, longitude) =>
    set((s) => ({ draft: { ...s.draft, city, longitude } })),
  next: () => set((s) => ({ step: Math.min(4, s.step + 1) as WizardState["step"] })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) as WizardState["step"] })),
  reset: () => set({ step: 0, draft: { ...initial } }),
  isComplete: () => {
    const d = get().draft;
    return (
      d.gender !== undefined &&
      d.calendar !== undefined &&
      typeof d.year === "number" &&
      typeof d.month === "number" &&
      typeof d.day === "number" &&
      typeof d.hour === "number" &&
      typeof d.minute === "number" &&
      typeof d.longitude === "number"
    );
  },
  toBirthInput: () => {
    if (!get().isComplete()) return null;
    return get().draft as BirthInput;
  },
}));
