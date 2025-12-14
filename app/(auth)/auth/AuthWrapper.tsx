'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
interface AuthWrapperProps {
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string, success?: boolean }>;
  signUpNewUser: (email: string, password: string) => Promise<{ error?: string, success?: boolean }>;
  signOut: () => void;
}

export const AuthWrapper = ({ signInWithEmail, signUpNewUser, signOut }: AuthWrapperProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      if (isLogin) {
        const result = await signInWithEmail(formData.email, formData.password);
        if (result?.error) setError(result.error);
        if (result?.success) {
          router.push('/');
        }
      }
      else {
        const result = await signUpNewUser(formData.email, formData.password);
        if (result?.error) setError(result.error);
        if (result?.success) {
          router.push('/');
        }
      }
    }
  };


  return (
    <div className="min-h-screen bg-emerald-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-emerald-800 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-center text-white">
            {isLogin ? 'Login' : 'Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-emerald-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-emerald-700 border-emerald-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-emerald-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-emerald-700 border-emerald-600 text-white"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};