import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Auth = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md shadow-light dark:shadow-dark">
        <h2 className="text-2xl font-semibold text-center text-foreground">Welcome to Gather Clone</h2>
        <form className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full bg-input text-foreground border border-border"
          />
          <Input
            type="password"
            placeholder="Enter your password"
            className="w-full bg-input text-foreground border border-border"
          />
          <Button className="w-full">Login</Button>
          <Button variant="secondary" className="w-full">Register</Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
