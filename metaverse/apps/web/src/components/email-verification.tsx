import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailVerificationProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
}

export function EmailVerification({ onSubmit, isLoading }: EmailVerificationProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: EmailFormData) => {
    try {
      setError(null);
      await onSubmit(data.email);
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-xl  shadow-xl rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="p-8 md:w-1/3 flex flex-col justify-center items-center">
          <Mail className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">Email Verification</h2>
          <p className="text-sm text-center opacity-90">
            Enter your email address to receive a verification code
          </p>
        </div>

        <CardContent className="p-8 md:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
}