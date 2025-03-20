import { useState } from "react";
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
import { toast } from "sonner";
import { CreateSpaceSchema } from "@repo/common";
import axiosInstance from "@/util/axiosInstance";
import { useSpace } from "@/hooks/useSpace";

export default function CreateSpaceDialog() {
  const { refetch } = useSpace();
  const [formData, setFormData] = useState({
    name: "",
    dimensions: "200x200",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false); // Manage dialog open state

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const parsedData = CreateSpaceSchema.safeParse(formData);

    if (!parsedData.success) {
      setError(parsedData.error.errors[0].message);
      setIsSubmitting(false);
      return;
    }

    try {
      axiosInstance.post("/space", parsedData.data);
      toast.success("Space created successfully");
      setOpen(false);
      refetch();
      location.reload();
      // TODO: Remove location.reload() and replace with a better solution
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to create space");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)} // Open the dialog
          className="bg-[#10B981] hover:bg-[#059669] px-5 py-3 rounded-lg flex items-center gap-2 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Create Space
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent
        className="max-w-md p-6 rounded-lg shadow-lg"
        aria-describedby="Create a new office space"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create a new office space for your team
          </DialogTitle>
        </DialogHeader>

        {/* Space Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="spaceName" className="text-sm font-medium">
            Space Name <span className="text-red-500">*</span> (Appears at the
            end of URL)
          </Label>
          <Input
            id="spaceName"
            name="spaceName"
            value={formData.name}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown} // Handle Enter key press
            required
            className={`px-3 py-2 border rounded-md focus:ring-2 outline-none ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#10B981]"
            }`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable button while submitting
            className="w-full bg-[#10B981] hover:bg-[#059669] py-2 text-white font-medium rounded-md cursor-pointer"
          >
            {isSubmitting ? "Creating..." : "Create Space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
