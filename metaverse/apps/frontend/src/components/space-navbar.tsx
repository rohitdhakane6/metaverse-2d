import { Menu, UserCircle } from 'lucide-react';

export function Navbar() {
  return (
    <div className="bg-gray-800 text-white flex items-center justify-between px-4 py-2 shadow-md">
      <Menu className="w-6 h-6" />
      <h1 className="text-lg font-bold">Virtual Office</h1>
      <UserCircle className="w-8 h-8" />
    </div>
  );
}
