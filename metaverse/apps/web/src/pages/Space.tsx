import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Game } from "phaser";
import { GameConfig } from "@/game/config";
import { Card } from "@/components/ui/card"; // shadcn/ui component
import Menu from "@/components/space/Menu";
import { useTypedSelector } from "@/hooks/useTypedSelector";

const Space = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const isGameInFocus = useTypedSelector((state) => state.arena.isGameInFocus);

  const gameInstanceRef = useRef<Game | null>(null);

  useEffect(() => {
    gameInstanceRef.current = new Game(GameConfig);
    localStorage.setItem("spaceId", spaceId!);

    return () => {
      gameInstanceRef.current?.destroy(true);
      localStorage.removeItem("spaceId");
    };
  }, [spaceId]);

  useEffect(() => {
    if (gameInstanceRef.current?.input.keyboard) {
      gameInstanceRef.current.input.keyboard.enabled = isGameInFocus;
    }
    if (gameInstanceRef.current?.input.mouse) {
      gameInstanceRef.current.input.mouse.enabled = isGameInFocus;
    }
  }, [isGameInFocus]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="p-4 bg-background text-foreground shadow">
        <h1 className="text-xl font-bold">Space Adventure</h1>
      </header>

      {/* Main Game Container */}
      <main className="flex-grow bg-muted">
        <Card className="h-full w-full flex items-center justify-center">
          <div id="game-container" className="w-full h-full" />
        </Card>
      </main>

      {/* Controls Menu */}
      {/* <footer className="bg-background shadow"> */}
      <Menu />
      {/* </footer> */}
    </div>
  );
};

export default Space;
