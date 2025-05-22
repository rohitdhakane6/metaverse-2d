import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTypedSelector } from "@/hooks/useTypedSelector";
import MicToggle from "@/components/space/ToggelMic";
import VideoToggle from "@/components/space/ToggelCamera";
import { User, MicOff, VideoOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { type CarouselApi } from "@/components/ui/carousel";
import MicVisualizer from "@/components/MicVisualizer";

type SpaceOnboardingProps = {
  spaceName: string;
  onComplete: (userName: string, avatar: string) => void;
};

const avatars = [
  { name: "adam", img: "/assets/login/Adam_login.png" },
  { name: "ash", img: "/assets/login/Ash_login.png" },
  { name: "lucy", img: "/assets/login/Lucy_login.png" },
  { name: "nancy", img: "/assets/login/Nancy_login.png" },
];

export default function SpaceOnboarding({
  spaceName,
  onComplete,
}: SpaceOnboardingProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");

  // Media setup
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useTypedSelector((state) => state.mediaDevices.tracks.camera);
  const isVideoEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.camera
  );
  const isMicrophoneEnabled = useTypedSelector(
    (state) => state.mediaDevices.enabled.microphone
  );

  // Initialize video stream
  useEffect(() => {
    if (videoRef.current && stream && isVideoEnabled) {
      const mediaStream = new MediaStream([stream]);
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, isVideoEnabled]);
  useEffect(() => {
    if (!api) {
      return;
    }
    api.on("select", () => {
      setAvatarIndex(api.selectedScrollSnap());
    });
  }, [api]);

  const handleJoin = () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    onComplete(userName, avatars[avatarIndex].name);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative">
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to <span className="text-[#73f9ff]">{spaceName}</span>
      </motion.h1>

      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Video Preview Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="h-48 w-48 md:h-56 md:w-80 rounded-2xl overflow-hidden bg-gray-800 relative flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {isVideoEnabled && stream ? (
                <motion.div
                  key="video-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <motion.video
                    ref={videoRef}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  {isMicrophoneEnabled && <MicVisualizer />}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  className="h-full w-full flex flex-col items-center justify-center bg-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <User size={64} className="text-gray-400" />
                  {isMicrophoneEnabled && <MicVisualizer />}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status indicators */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
              <AnimatePresence>
                {!isVideoEnabled && (
                  <motion.div
                    key="video-off"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-red-500 px-2 py-1 rounded-full flex items-center text-xs"
                  >
                    <VideoOff size={12} className="mr-1" />
                    Camera Off
                  </motion.div>
                )}

                {!isMicrophoneEnabled && (
                  <motion.div
                    key="mic-off"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-red-500 px-2 py-1 rounded-full flex items-center text-xs"
                  >
                    <MicOff size={12} className="mr-1" />
                    Mic Off
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <motion.div
            className="flex justify-center mt-4 space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <VideoToggle />
            <MicToggle />
          </motion.div>
        </motion.div>

        {/* Avatar Selection & Name Input */}
        <motion.div
          className="flex flex-col items-center space-y-6 w-full max-w-xs"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="w-full flex flex-col items-center justify-center gap-4">
            {/* Avatar Selection */}
            <div className="text-center mb-2">
              <h3 className="text-sm text-gray-300">Choose your avatar</h3>
              <p className="text-xs text-gray-400 mt-1">
                Currently: {avatars[avatarIndex].name}
              </p>
            </div>

            <Carousel
              setApi={setApi}
              className="w-48"
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {avatars.map((avatar, index) => (
                  <CarouselItem key={avatar.name}>
                    <div className="flex items-center justify-center p-1">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative rounded-full p-1 ${
                          index === avatarIndex
                            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800"
                            : ""
                        }`}
                      >
                        <img
                          src={avatar.img}
                          alt={avatar.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </motion.div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>

            {/* Name Input */}
            <div className="w-full mt-4">
              <label className="text-sm text-gray-300 mb-1 block">
                Your name
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full text-lg py-6 pr-10 bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          {/* Join Button */}
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handleJoin}
              disabled={!userName.trim()}
              className="font-semibold px-8 py-6 rounded-full w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Space
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Legal */}
      <motion.p
        className="absolute bottom-4 text-xs text-gray-400 text-center max-w-md px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        By joining this space, you agree to our Terms of Service and Privacy
        Policy, and confirm that you're over 18 years of age.
      </motion.p>
    </div>
  );
}
