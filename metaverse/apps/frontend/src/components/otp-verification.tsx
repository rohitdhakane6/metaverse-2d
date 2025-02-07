import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@hooks/use-toast';
import { cn } from '@lib/utils';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Alert, AlertDescription } from '@repo/design-system/components/ui/alert';
import { AlertCircle, CheckCircle2, Timer, Shield, KeyRound } from 'lucide-react';
import { Input } from '@repo/design-system/components/ui/input';

interface OTPVerificationProps {
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  sessionTimeout?: number;
  maxRetries?: number;
}

export function OTPVerification({
  onVerify,
  onResend,
  sessionTimeout = 120,
  maxRetries = 3,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(sessionTimeout);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      debouncedVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    if (newOtp.every(digit => digit !== '')) {
      debouncedVerify(newOtp.join(''));
    }
  };

  const debouncedVerify = useCallback(
    async (value: string) => {
      if (value.length === 6) {
        setIsLoading(true);
        setError(null);
        try {
          const isValid = await onVerify(value);
          if (isValid) {
            setIsVerified(true);
            toast({
              title: 'Verification successful',
              description: 'Your code has been verified.',
              duration: 3000,
            });
          } else {
            setRetryCount((prev) => prev + 1);
            if (retryCount + 1 >= maxRetries) {
              setError('Maximum retry attempts reached. Please request a new code.');
            } else {
              setError('Invalid verification code. Please try again.');
            }
          }
        } catch (err) {
          setError('An error occurred during verification. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    },
    [onVerify, retryCount, maxRetries, toast]
  );

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    try {
      setIsLoading(true);
      await onResend();
      setTimeLeft(sessionTimeout);
      setOtp(Array(6).fill(''));
      setError(null);
      setRetryCount(0);
      toast({
        title: 'Code resent',
        description: 'A new verification code has been sent.',
        duration: 3000,
      });
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <Card className="w-full max-w-xl  shadow-xl rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="bg-primary p-8 text-primary-foreground md:w-1/3 flex flex-col justify-center items-center">
          <Shield className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">Secure Verification</h2>
          <p className="text-sm text-center opacity-90">
            Enter the verification code sent to your device to continue
          </p>
        </div>

        <CardContent className="p-8 md:w-2/3">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Enter Verification Code</h3>
              </div>
              
              <div
                role="group"
                aria-label="Enter verification code"
                className="flex gap-3 justify-center"
              >
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={cn(
                      "w-12 h-14 text-center text-2xl font-semibold transition-all duration-200",
                      "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      error && "border-destructive",
                      isVerified && "border-green-500 bg-green-50",
                      "hover:border-primary"
                    )}
                    disabled={isLoading || isVerified || retryCount >= maxRetries}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isVerified && (
              <Alert className="bg-green-50 border-green-200 animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Verification successful!
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                <Timer className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={timeLeft > 0 || isLoading || isVerified}
                className="hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {isLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}