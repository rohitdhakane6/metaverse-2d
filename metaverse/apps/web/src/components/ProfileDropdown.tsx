import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown() {
  const navigate = useNavigate();

  const handelLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }
  


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-1 ">
          <User size={20} />
          <samp>Rohit Dhakane</samp>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuItem onClick={() => console.log("Profile clicked")}>
          <User size={16} className="mr-2" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handelLogout} className="text-red-500 focus:text-red-500" >
          <LogOut size={16} className="mr-2" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
