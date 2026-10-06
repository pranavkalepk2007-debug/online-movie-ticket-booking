import React, { useCallback, useState } from 'react';
import { signupWithPassword } from 'modelence/client';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link } from 'react-router-dom';
import Page from '@/client/components/Page';
import { toast } from 'react-hot-toast';

export default function SignupPage() {
  return (
    <Page>
      <div className="flex items-center justify-center min-h-full">
        <SignupForm />
      </div>
    </Page>
  );
}

function SignupForm() {
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(event.currentTarget);
    
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');
    
    if (password.length < 8) {
      setErrorMsg('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    try {
      await signupWithPassword({ email, password });
      setIsSignupSuccess(true);
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (isSignupSuccess) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-white text-gray-900 shadow-xl border border-gray-200">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-green-700">
            Account Created Successfully!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <p className="text-gray-600 text-sm">
            Your account is now registered in the database. You can sign in right away.
          </p>
          <Link to="/login" className="w-full">
            <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Sign In Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-white text-gray-900">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          Create an account
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="block mb-2">
              Email
            </Label>
            <Input 
              type="email" 
              name="email" 
              id="email" 
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block mb-2">
              Password
            </Label>
            <Input 
              type="password" 
              name="password" 
              id="password" 
              required
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="block mb-2">
              Confirm password
            </Label>
            <Input 
              type="password" 
              name="confirmPassword" 
              id="confirm-password" 
              required
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consent-terms"
                type="checkbox"
                name="consent-terms"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <Label htmlFor="consent-terms" className="text-gray-600">
                I accept the <a className="font-medium text-blue-600 hover:underline" href="/terms" target="_blank">Terms and Conditions</a>
              </Label>
            </div>
          </div>

          <Button
            className="w-full"
            type="submit"
          >
            Create account
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-gray-900 underline hover:no-underline font-medium"
          >
            Sign in here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
