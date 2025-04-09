import VideoTile from "./VideoTile";

interface VideoGridProps {
  participants: string[]; // List of participant names
}

export default function VideoGrid({ participants }: VideoGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {participants.map((participant, index) => (
        <VideoTile key={index} participantName={participant} />
      ))}
    </div>
  );
}
