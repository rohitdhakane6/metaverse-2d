import { useState } from 'react';
import { useToast } from '@hooks/use-toast';
import { EmailVerification } from '../components/email-verification';
import { OTPVerification } from '../components/otp-verification';

type VerificationStep = 'email' | 'otp';

function App() {
  const [step, setStep] = useState<VerificationStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // In a real application, these would be API calls
  const handleEmailSubmit = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEmail(email);
      setStep('otp');
      toast({
        title: 'Verification code sent',
        description: `We've sent a verification code to ${email}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (otp: string) => {
    // Simulate API verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    return otp === '123456'; // In production, this would be a real verification
  };

  const handleResend = async () => {
    // Simulate resending OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Success",
      description: "You have successfully logged in.",
      duration: 5000,
      status: "success",
      action: {
        label: "Go to Dashboard",
        onClick: () => router.push("/dashboard"),
      },
    });
  };

  return (
    <div className="min-h-screen w-full  flex items-center justify-center p-6">
      <div className="w-full flex justify-center items-center">
        {step === 'email' ? (
          <EmailVerification
            onSubmit={handleEmailSubmit}
            isLoading={isLoading}
          />
        ) : (
          <OTPVerification
            onVerify={handleVerify}
            onResend={handleResend}
            sessionTimeout={300} // 5 minutes
            maxRetries={3}
          />
        )}
      </div>
    </div>
  );
}

export default App;