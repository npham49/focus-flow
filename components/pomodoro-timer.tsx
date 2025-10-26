"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw, Settings, Bell, BellOff, Maximize2, Minimize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { subscribeUser, unsubscribeUser, sendNotification } from "@/app/actions"

interface TimerSettings {
  workDuration: number
  breakDuration: number
}

interface TimerState {
  settings: TimerSettings
  setSettings: (settings: TimerSettings) => void
  isWork: boolean
  setIsWork: (isWork: boolean) => void
  timeLeft: number
  setTimeLeft: (timeLeft: number | ((prev: number) => number)) => void
  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => void
  subscription: PushSubscription | null
  setSubscription: (sub: PushSubscription | null) => void
  hasInitialized: React.MutableRefObject<boolean>
}

// Utility function to convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PomodoroTimer({
  viewMode = "full",
  onViewModeChange,
  timerState,
}: {
  viewMode?: "full" | "compact"
  onViewModeChange?: (mode: "full" | "compact") => void
  timerState?: TimerState
}) {
  // Use passed timerState if available, otherwise use local state (for backwards compatibility)
  const localSettings = useState<TimerSettings>({ workDuration: 25, breakDuration: 5 })
  const localIsWork = useState(true)
  const localTimeLeft = useState(25 * 60)
  const localIsRunning = useState(false)
  const localNotificationsEnabled = useState(false)
  const localSubscription = useState<PushSubscription | null>(null)
  const localHasInitialized = useRef(false)

  const settings = timerState?.settings ?? localSettings[0]
  const setSettings = timerState?.setSettings ?? localSettings[1]
  const isWork = timerState?.isWork ?? localIsWork[0]
  const setIsWork = timerState?.setIsWork ?? localIsWork[1]
  const timeLeft = timerState?.timeLeft ?? localTimeLeft[0]
  const setTimeLeft = timerState?.setTimeLeft ?? localTimeLeft[1]
  const isRunning = timerState?.isRunning ?? localIsRunning[0]
  const setIsRunning = timerState?.setIsRunning ?? localIsRunning[1]
  const notificationsEnabled = timerState?.notificationsEnabled ?? localNotificationsEnabled[0]
  const setNotificationsEnabled = timerState?.setNotificationsEnabled ?? localNotificationsEnabled[1]
  const subscription = timerState?.subscription ?? localSubscription[0]
  const setSubscription = timerState?.setSubscription ?? localSubscription[1]
  const hasInitialized = timerState?.hasInitialized ?? localHasInitialized

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Load settings from localStorage after mount (client-side only) - only if not using shared state
  useEffect(() => {
    if (timerState) return // Skip if using shared state

    setIsClient(true)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodoroSettings")
      if (saved) {
        const savedSettings = JSON.parse(saved)
        setSettings(savedSettings)
        if (!hasInitialized.current) {
          setTimeLeft(savedSettings.workDuration * 60)
          hasInitialized.current = true
        }
      } else {
        hasInitialized.current = true
      }
    }
  }, [timerState])

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Register service worker and check subscription status
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        registerServiceWorker()
      }
    }
  }, [])

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
      setNotificationsEnabled(sub !== null && Notification.permission === 'granted')
    } catch (error) {
      console.error('Error registering service worker:', error)
    }
  }

  const requestNotificationPermission = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported')
      return
    }

    try {
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        await subscribeToPush()
      } else {
        setNotificationsEnabled(false)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      setSubscription(sub)
      const serializedSub = JSON.parse(JSON.stringify(sub))
      await subscribeUser(serializedSub)
      setNotificationsEnabled(true)
    } catch (error) {
      console.error('Error subscribing to push:', error)
      setNotificationsEnabled(false)
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe()
      setSubscription(null)
      await unsubscribeUser()
      setNotificationsEnabled(false)
    } catch (error) {
      console.error('Error unsubscribing:', error)
    }
  }

  const sendPushNotification = async (message: string) => {
    if (!notificationsEnabled || !subscription) {
      console.log('Notifications not enabled or no subscription')
      return
    }

    try {
      await sendNotification(message)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const playNotificationSound = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  // Main timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      playNotificationSound()
      if (isWork) {
        sendPushNotification("Work Session Complete! 🎉 Time for a break. Great job!")
        setTimeLeft(settings.breakDuration * 60)
      } else {
        sendPushNotification("Break Time Over! 💪 Ready to get back to work?")
        setTimeLeft(settings.workDuration * 60)
      }
      setIsWork(!isWork)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isWork, settings.workDuration, settings.breakDuration])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(settings.workDuration * 60)
    setIsWork(true)
  }

  const handleSettingsSave = (work: number, breakTime: number) => {
    setSettings({ workDuration: work, breakDuration: breakTime })
    setIsRunning(false)
    setTimeLeft(isWork ? work * 60 : breakTime * 60)
    setDialogOpen(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = isWork ? settings.workDuration * 60 : settings.breakDuration * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  if (viewMode === "compact") {
    return (
      <div
        className={`w-full transition-colors duration-500 border-b ${isWork ? "bg-blue-950/30 border-blue-800/50" : "bg-emerald-950/30 border-emerald-800/50"
          }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Timer display */}
            <div className="flex items-center gap-2 min-w-[140px]">
              <span className={`h-2 w-2 rounded-full ${isWork ? "bg-blue-500" : "bg-emerald-500"}`} />
              <div className="text-2xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <span className="text-xs text-muted-foreground">{isWork ? "Work" : "Break"}</span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${isWork ? "bg-blue-500" : "bg-emerald-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1">
              <Button onClick={toggleTimer} size="sm" variant="ghost" className="h-8 w-8 p-0">
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button onClick={resetTimer} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={notificationsEnabled ? unsubscribeFromPush : requestNotificationPermission}
                title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
              >
                {notificationsEnabled ? (
                  <Bell className="h-4 w-4 text-green-500" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                    <DialogDescription>Customize your work and break durations (in minutes)</DialogDescription>
                  </DialogHeader>
                  <TimerSettingsForm settings={settings} onSave={handleSettingsSave} />
                </DialogContent>
              </Dialog>
              {onViewModeChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onViewModeChange("full")}
                  title="Expand timer"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Card
        className={`transition-colors duration-500 ${isWork ? "bg-blue-950/30 border-blue-800/50" : "bg-emerald-950/30 border-emerald-800/50"
          }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isWork ? "bg-blue-500" : "bg-emerald-500"}`} />
            {isWork ? "Work Session" : "Break Time"}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={notificationsEnabled ? unsubscribeFromPush : requestNotificationPermission}
              title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-green-500" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                  <DialogDescription>Customize your work and break durations (in minutes)</DialogDescription>
                </DialogHeader>
                <TimerSettingsForm settings={settings} onSave={handleSettingsSave} />
              </DialogContent>
            </Dialog>
            {onViewModeChange && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewModeChange("compact")}
                title="Minimize timer"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative flex items-center justify-center">
            <svg className="h-64 w-64 -rotate-90 transform">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ${isWork ? "text-blue-500" : "text-emerald-500"}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{isWork ? "Focus time" : "Take a break"}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button onClick={toggleTimer} size="lg" className="w-32">
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function TimerSettingsForm({
  settings,
  onSave,
}: {
  settings: TimerSettings
  onSave: (work: number, breakTime: number) => void
}) {
  const [work, setWork] = useState(settings.workDuration)
  const [breakTime, setBreakTime] = useState(settings.breakDuration)

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="work">Work Duration (minutes)</Label>
        <Input
          id="work"
          type="number"
          min="1"
          max="60"
          value={work}
          onChange={(e) => setWork(Number(e.target.value))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="break">Break Duration (minutes)</Label>
        <Input
          id="break"
          type="number"
          min="1"
          max="30"
          value={breakTime}
          onChange={(e) => setBreakTime(Number(e.target.value))}
        />
      </div>
      <Button onClick={() => onSave(work, breakTime)} className="w-full">
        Save Settings
      </Button>
    </div>
  )
}
