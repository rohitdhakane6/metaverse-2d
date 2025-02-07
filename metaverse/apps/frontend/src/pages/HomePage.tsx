import { Button } from "@repo/design-system/components/ui/button";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our Platform
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Create and manage spaces effortlessly. Join us today!
        </p>

        <a href="/dashboard">
          <Button className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg font-medium">
            Get Started
          </Button>
        </a>
      </div>
    </div>
  );
}
