import { useTypedSelector } from "@/hooks/useTypedSelector";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MicVisualizer() {
  const [levels, setLevels] = useState<number>(0);

  const track = useTypedSelector((state) => state.mediaDevices.tracks.microphone);

  useEffect(() => {
    if (!track) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode;
    let source: MediaStreamAudioSourceNode;
    let animationId: number;

    const stream = new MediaStream([track]);

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
      const level = Math.min(5, Math.floor(avg / 15));
      setLevels(level);
      animationId = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (audioContext) audioContext.close();
      cancelAnimationFrame(animationId);
    };
  }, [track]);

  return (
    <div className="absolute bottom-2 right-2 flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            backgroundColor: i < levels ? "#4ade80" : "#4b5563", 
          }}
          transition={{ duration: 0.2 }}
          className="w-1.5 h-4 rounded-sm"
        />
      ))}
    </div>
  );
}
