import { useState } from "react";
import Space from "@/components/space/Space";
import SpaceOnboarding from "@/components/space/SpaceOnboarding";

export default function SpacePage() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleOnboardingComplete = (userName: string, avatar:string) => {
    setUserName(userName);
    setAvatar(avatar);
    setShowOnboarding(false);
  };

  return (
    <div>
      {showOnboarding ? (
        <SpaceOnboarding
          onComplete={handleOnboardingComplete}
          spaceName="demo"
        />
      ) : (
        <Space userName={userName} avatar={avatar} />
      )}
    </div>
  );
}
