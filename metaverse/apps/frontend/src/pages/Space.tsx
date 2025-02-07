import { useParams } from "react-router-dom";
import Game from "../util/Game";
export default function Space() {
  const { spaceId } = useParams();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <Game />
    </div>
  );
}
