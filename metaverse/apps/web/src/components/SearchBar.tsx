import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search"
        className="w-full pl-10 pr-4 py-2 bg-[#3D425A] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7289DA]"
      />
    </div>
  );
}