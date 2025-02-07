import { Network, Layout } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import CreateSpaceDialog from "./CreateSpaceDialog";

export function Header() {
  return (
    <header className="bg-[#2D3142] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Network className="w-8 h-8 text-[#7289DA]" />
          </Link>

          <nav className="ml-8 flex space-x-4">
            <Link
              to="/spaces"
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-[#3D425A]"
            >
              <Layout className="w-5 h-5" />
              <span>My Spaces</span>
            </Link>
          </nav>

          <div className="ml-auto flex items-center space-x-4">
            <ProfileDropdown />
            <CreateSpaceDialog />
          </div>
        </div>
      </div>
    </header>
  );
}
