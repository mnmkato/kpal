import { createClient } from '@/lib/supabase/server'
import { Button } from './ui/button';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/actions';
import { redirect } from 'next/navigation';
import { AuthHeader } from './AuthHeader';

export async function Header() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getClaims()
    const user = data?.claims
    console.log(user)
    if (error || !user) {
        redirect('/auth')
    }

    async function handleSignOut() {
        'use server'
        await signOut()
        redirect('/auth')
    }

    return (
        <header className="flex justify-between items-center py-2 px-4 pt-4 max-w-lg mx-auto border-b border-border shadow-sm">
            <Link href="/">
                <h1 className="text-2xl font-bold">KPal</h1>
            </Link>
            {user ? (
                <AuthHeader signOut={handleSignOut} />
            ) : (
                <Link href="/auth">
                    <Button className="bg-primary text-primary-foreground px-4 py-2 rounded cursor-pointer">Login/Register</Button>
                </Link>
            )}
        </header>
    );
}