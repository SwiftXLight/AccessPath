"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PROFILE, ACCESSIBILITY_NEED_EVENT_TAGS, type UserProfile, type AccessibilityNeed } from "@/lib/types";

const STORAGE_KEY = "accesspath-profile";
const LEGACY_STORAGE_KEY = "local-life-explorer-profile";

interface UserPreferencesContextValue {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  resetProfile: () => void;
  isLoaded: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(
  null
);

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const saved = JSON.parse(raw) as Partial<UserProfile>;
    const profile = {
      ...DEFAULT_PROFILE,
      ...saved,
      searchLocation: {
        ...DEFAULT_PROFILE.searchLocation,
        ...(saved.searchLocation ?? {}),
      },
      accessibilityNeeds: (saved.accessibilityNeeds ?? DEFAULT_PROFILE.accessibilityNeeds).filter(
        (need): need is AccessibilityNeed => need in ACCESSIBILITY_NEED_EVENT_TAGS
      ),
    };
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
    return profile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProfileState(loadProfile());
    setIsLoaded(true);
  }, []);

  const persist = useCallback((next: UserProfile) => {
    setProfileState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setProfile = useCallback(
    (next: UserProfile) => persist(next),
    [persist]
  );

  const updateProfile = useCallback(
    (partial: Partial<UserProfile>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...partial };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const resetProfile = useCallback(() => persist(DEFAULT_PROFILE), [persist]);

  return (
    <UserPreferencesContext.Provider
      value={{ profile, setProfile, updateProfile, resetProfile, isLoaded }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  }
  return ctx;
}
