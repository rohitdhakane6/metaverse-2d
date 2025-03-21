import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SpaceCard } from "@/components/SpaceCard";
import { Button } from "@/components/ui/button";
import { useSpace } from "@/hooks/useSpace";

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState("lastVisited");
  const { spaces, loading, error } = useSpace();

  console.log("Dashboard render with spaces:", spaces);

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

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : spaces.length === 0 ? (
          <div className="text-center text-white">No spaces found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                id={space.id}
                name={space.name}
                image={space.thumbnail}
                activeUsers={0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
