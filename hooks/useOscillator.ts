import { useCallback, useEffect, useState } from "react";

const useOscillator = (audioCtx: AudioContext | null) => {
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  useEffect(() => {
    if (!audioCtx) {
      return;
    }

    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.start();

    setOscillator(oscillator);
  }, [audioCtx]);

  const playFrequency = useCallback((frequency: number) => {
    if (!audioCtx || !oscillator) {
      return;
    }

    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); // value in hertz

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }, [audioCtx, oscillator]);

  const stopPlaying = useCallback(() => {
    audioCtx?.suspend();
  }, [audioCtx]);

  return {
    oscillator, playFrequency, stopPlaying,
  }
}

export default useOscillator;
