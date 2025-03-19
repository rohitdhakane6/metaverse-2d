import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Invite = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-900 dark:text-gray-100">
          Invite Friends
        </h2>
        <div className="mb-4">
          <Label className="block mb-2 text-gray-700 dark:text-gray-300">Invite Link</Label>
          <Input
            type="text"
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-none"
            value="https://your-app.com/invite/12345"
            readOnly
          />
        </div>
        <Button className="w-full">Send Invitation</Button>
      </div>
    </div>
  );
};

export default Invite;
