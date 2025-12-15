'use client'
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter } from "next/navigation";

interface UpdatePasswordClientProps {
    params: Promise<{ code: string }>;
    updatePassword: (password: string, code: string) => Promise<{ error?: string, success?: boolean }>;
}
export default async function UpdatePasswordClient({ params, updatePassword }: UpdatePasswordClientProps) {
    const codePromise = params.then((p) => String(p.code));
    const resetCode = await codePromise;
    return (
        <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <UpdatePasswordForm code={resetCode} updatePassword={updatePassword} />
            </Suspense>
        </div>
    );
}
function UpdatePasswordForm({ code, updatePassword }: { code: string, updatePassword: (password: string, code: string) => Promise<{ error?: string, success?: boolean }> }) {

    const [formData, setFormData] = useState({ password: '', reenterPassword: '' });
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.reenterPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.password) {
            const { error } = await updatePassword(formData.password, code);

            if (error) {
                setError(error);
            } else {
                router.push("/auth");
            }
        }
    }
    return (
        <Card className="w-full max-w-md bg-emerald-800 border-emerald-700">
            <CardHeader>
                <CardTitle className="text-center text-white">
                    Update Password
                </CardTitle>
                <CardDescription className="text-center text-white">
                    Enter your new password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div>
                        <Label htmlFor="reenterPassword" className="text-emerald-300">Re-enter Password</Label>
                        <Input
                            id="reenterPassword"
                            type="password"
                            value={formData.reenterPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, reenterPassword: e.target.value }))}
                            className="bg-emerald-700 border-emerald-600 text-white"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className='mt-2 flex justify-between items-center md:flex-direction-column-reverse'>
                        <Link href={"/auth"} className='flex items-center gap-2 text-white'>
                            <ArrowLeft className='size-4 stroke-2' />
                            <span className='ml-2'>Back to the login page</span>
                        </Link>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Update password</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}