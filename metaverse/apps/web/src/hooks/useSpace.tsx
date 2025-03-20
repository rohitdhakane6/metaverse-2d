import axiosInstance from "@/util/axiosInstance";
import { useEffect, useState } from "react";

interface Space {
  id: string;
  name: string;
  thumbnail: string;
}

export const useSpace = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger

  const fetchSpaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/space/all");
      setSpaces(response.data.spaces);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to fetch spaces");
    } finally {
      setLoading(false);
    }
  };

  // Refetch function that also updates the refresh trigger
  const refetch = () => {
    setRefreshTrigger((prev) => prev + 1); // Increment trigger to force useEffect to run
  };

  useEffect(() => {
    fetchSpaces();
  }, [refreshTrigger]);
  useEffect(() => {
    console.log("Updated spaces:", spaces);
  }, [spaces]);

  return { spaces, loading, error, refetch };
};
