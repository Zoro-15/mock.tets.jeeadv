import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  initialTimeLeft: number; // in seconds
  onTick?: (timeLeft: number) => void;
  isPaused?: boolean;
}

export default function Timer({ initialTimeLeft, onTick, isPaused = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const timeLeftRef = useRef(initialTimeLeft);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  // Sync with external initial time if it changes
  useEffect(() => {
    setTimeLeft(initialTimeLeft);
    timeLeftRef.current = initialTimeLeft;
  }, [initialTimeLeft]);

  useEffect(() => {
    if (isPaused) return;

    // Record target wall-clock finish time to eliminate background tab throttling drift
    const targetEndTime = Date.now() + timeLeftRef.current * 1000;

    const timer = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
      timeLeftRef.current = remainingSeconds;
      setTimeLeft(remainingSeconds);

      if (onTickRef.current) {
        onTickRef.current(remainingSeconds);
      }

      if (remainingSeconds <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) return "00:00:00";
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const isLowTime = timeLeft > 0 && timeLeft < 300; // < 5 minutes

  return (
    <div 
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(timeLeft)}`}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wide transition-colors tabular-nums ${
        isLowTime 
          ? 'bg-danger-custom/10 border-danger-custom text-danger-custom animate-pulse' 
          : 'bg-surface-custom border-[#334155]/60 text-text-primary-custom'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
}
