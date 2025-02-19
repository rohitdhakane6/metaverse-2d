import { Video, Mic, User } from 'lucide-react';

export function BottomMenu() {
  return (
    <div className="bg-gray-800 text-white flex justify-around items-center p-4 shadow-md">
      <Video className="w-6 h-6 cursor-pointer hover:text-gray-400" />
      <Mic className="w-6 h-6 cursor-pointer hover:text-gray-400" />
      <User className="w-6 h-6 cursor-pointer hover:text-gray-400" />
    </div>
  );
}
