import { useState } from "react";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { SpaceCard } from "../components/SpaceCard";
import { Button } from "@/components/ui/button";

const spaces = [
  {
    id: 1,
    title: "Project Space",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800",
    lastVisited: "today",
    activeUsers: 12,
    lastActive: "2 mins ago",
    location: "Floor 1",
  },
  {
    id: 2,
    title: "Team Meeting Room",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800",
    lastVisited: "yesterday",
    activeUsers: 5,
    lastActive: "15 mins ago",
    location: "Floor 2",
  },
];

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState("lastVisited");

  return (
    <div className="min-h-screen bg-[#1E2132]">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <Button
              variant={activeFilter === "lastVisited" ? "default" : "ghost"}
              onClick={() => setActiveFilter("lastVisited")}
            >
              Last Visited
            </Button>
            <Button
              variant={activeFilter === "createdSpaces" ? "default" : "ghost"}
              onClick={() => setActiveFilter("createdSpaces")}
            >
              Created Spaces
            </Button>
          </div>

          <div className="w-72">
            <SearchBar />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {spaces.map((space) => (
            <SpaceCard
              key={space.id}
              title={space.title}
              image={space.image}
              activeUsers={space.activeUsers}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
