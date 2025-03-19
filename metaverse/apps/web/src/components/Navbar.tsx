import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@components/mode-toggle";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background border-b border-border shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          Metavers
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/dashboard" className="text-foreground hover:text-primary">
            My Spaces
          </Link>
          <Button asChild>
            <Link to="/create-space">Create Space</Link>
          </Button>
          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <Button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col space-y-3 p-4 bg-background border-t border-border">
          <Link to="/dashboard" className="text-foreground hover:text-primary">
            My Spaces
          </Link>
          <Button asChild>
            <Link to="/create-space">Create Space</Link>
          </Button>
          <ModeToggle />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
