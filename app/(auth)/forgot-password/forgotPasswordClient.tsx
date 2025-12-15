'use client'
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';

interface ForgotPasswordClientProps {
    resetPassword: (email: string) => Promise<{ error?: string, success?: boolean }>;
}
export function ForgotPasswordClient({ resetPassword }: ForgotPasswordClientProps) {

    const [formData, setFormData] = useState({ email: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.email) {
            const result = await resetPassword(formData.email);
            if (result?.error) setError(result.error);
            if (result?.success) {
                setSuccess(true);
            }
        }

    }
    return (
        <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md bg-emerald-800 border-emerald-700">
                {success ? (
                    <CardHeader>
                        <CardTitle className="text-center text-white">
                            Reset lİnk Sent
                        </CardTitle>
                        <CardDescription className="text-center text-white">
                            Check your email for a reset link
                        </CardDescription>
                    </CardHeader>
                ) : (
                    <>
                        <CardHeader>
                            <CardTitle className="text-center text-white">
                                Forgot your password?
                            </CardTitle>
                            <CardDescription className="text-center text-white">
                                Enter your email to get a reset link
                            </CardDescription>
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
                                        className="bg-emerald-700 border-emerald-600 text-white mt-2"
                                        required
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                <div className='mt-2 flex justify-between items-center md:flex-direction-column-reverse'>
                                    <Link href={"/auth"} className='flex items-center gap-2 text-white'>
                                        <ArrowLeft className='size-4 stroke-2' />
                                        <span className='ml-2'>Back to the login page</span>
                                    </Link>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Reset password</Button>
                                </div>
                            </form>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}