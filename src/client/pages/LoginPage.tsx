import React, { useCallback, useState } from 'react';
import { getConfig, loginWithPassword } from 'modelence/client';
import { Button } from '@/client/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/client/components/ui/Card';
import { Input } from '@/client/components/ui/Input';
import { Label } from '@/client/components/ui/Label';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Page from '@/client/components/Page';

export default function LoginPage() {
  return (
    <Page>
      <div className="flex items-center justify-center min-h-full py-12">
        <LoginForm />
      </div>
    </Page>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const encodedRedirect = searchParams.get('_redirect');
  const redirect = encodedRedirect ? decodeURIComponent(encodedRedirect) : '/';

  const isSandboxEnv = getConfig('_system.env.type') === 'sandbox';
  const defaultDemoEmail = (isSandboxEnv ? getConfig('example.modelenceDemoUsername') as string | undefined : undefined) || 'demo@modelence.dev';
  const defaultDemoPassword = (isSandboxEnv ? getConfig('example.modelenceDemoPassword') as string | undefined : undefined) || '12345678';

  const [email, setEmail] = useState(defaultDemoEmail);
  const [password, setPassword] = useState(defaultDemoPassword);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      await loginWithPassword({ email: cleanEmail, password });
      navigate(redirect, { replace: true });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Session is not initialized')) {
        // Clear old stale session from localStorage and retry once
        localStorage.removeItem('modelence.session');
        window.location.reload();
        return;
      }
      setErrorMsg(msg || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }, [email, password, redirect, navigate]);

  const handleFillDemo = () => {
    setEmail('demo@modelence.dev');
    setPassword('12345678');
    setErrorMsg(null);
  };

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-xl border border-gray-200">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Sign in to your account
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">Book movie tickets & select seats</p>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Quick Demo Credentials Box */}
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-center justify-between">
          <div>
            <span className="font-semibold block">Demo Account:</span>
            <span>demo@modelence.dev | 12345678</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2 py-1 bg-rose-600 text-white font-medium rounded hover:bg-rose-700 transition"
          >
            Autofill
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input 
              type="email" 
              name="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
            </div>
            <Input 
              type="password" 
              name="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-gray-100 pt-4">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-rose-600 hover:text-rose-700 underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
