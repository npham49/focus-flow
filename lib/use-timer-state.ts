import { useState, useEffect, useRef } from "react";

interface TimerSettings {
  workDuration: number;
  breakDuration: number;
}

export function useTimerState() {
  // Initialize with default values to avoid hydration mismatch
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    breakDuration: 5,
  });
  const [isWork, setIsWork] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const hasInitialized = useRef(false);

  // Load settings from localStorage after mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodoroSettings");
      if (saved) {
        const savedSettings = JSON.parse(saved);
        setSettings(savedSettings);
        if (!hasInitialized.current) {
          setTimeLeft(savedSettings.workDuration * 60);
          hasInitialized.current = true;
        }
      } else {
        hasInitialized.current = true;
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    }
  }, [settings]);

  // Only reset timeLeft when isWork or settings change while not running
  // This prevents reset when simply pausing/resuming
  useEffect(() => {
    if (!isRunning && hasInitialized.current) {
      setTimeLeft(
        isWork ? settings.workDuration * 60 : settings.breakDuration * 60
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWork, settings.workDuration, settings.breakDuration]);
  // Note: isRunning is intentionally NOT in the dependency array
  // We only want to reset when isWork or settings change, not when pausing/resuming

  return {
    settings,
    setSettings,
    isWork,
    setIsWork,
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    notificationsEnabled,
    setNotificationsEnabled,
    subscription,
    setSubscription,
    hasInitialized,
  };
}
