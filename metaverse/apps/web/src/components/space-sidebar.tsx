import { Home, Users, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="bg-gray-800 w-16 h-full flex flex-col items-center py-4 space-y-6">
      <Home className="text-white w-6 h-6 cursor-pointer hover:text-gray-400" />
      <Users className="text-white w-6 h-6 cursor-pointer hover:text-gray-400" />
      <Settings className="text-white w-6 h-6 cursor-pointer hover:text-gray-400" />
    </div>
  );
}
