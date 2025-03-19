import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// Zod Schema for validation
const spaceSchema = z.object({
  spaceName: z
    .string()
    .min(3, "Space name must be at least 3 characters long")
    .max(20, "Space name cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, hyphens, and underscores are allowed"),
});

export default function CreateSpaceDialog() {
  const [formData, setFormData] = useState({ spaceName: "" });
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ spaceName: e.target.value });
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = () => {
    const validationResult = spaceSchema.safeParse(formData);
    
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    console.log("Space Created:", formData);
  };

  return (
    <Dialog>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button className="bg-[#10B981] hover:bg-[#059669] px-5 py-3 rounded-lg flex items-center gap-2 text-white font-medium">
          <Plus className="w-5 h-5" />
          Create Space
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="max-w-md p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create a new office space for your team
          </DialogTitle>
        </DialogHeader>

        {/* Space Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="spaceName" className="text-sm font-medium">
            Space Name <span className="text-red-500">*</span> (Appears at the end of URL)
          </Label>
          <Input
            id="spaceName"
            name="spaceName"
            value={formData.spaceName}
            onChange={handleInputChange}
            required
            className={`px-3 py-2 border rounded-md focus:ring-2 outline-none ${
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-[#10B981]"
            }`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} className="w-full bg-[#10B981] hover:bg-[#059669] py-2 text-white font-medium rounded-md">
            Create Space
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
