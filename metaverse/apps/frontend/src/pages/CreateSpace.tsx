// src/pages/CreateSpace.tsx

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';


const CreateSpace = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Create a New Space</h2>
        <form>
          <div className="mb-4">
            <Label className="block mb-2">Space Name</Label>
            <Input type="text" placeholder="Enter space name" className="w-full" />
          </div>
          <div className="mb-4">
            <Label className="block mb-2">Space Description</Label>
            <Textarea placeholder="Describe your space" className="w-full" />
          </div>
          <Button className="w-full">Create Space</Button>
        </form>
      </div>
    </div>
  );
};

export default CreateSpace;
