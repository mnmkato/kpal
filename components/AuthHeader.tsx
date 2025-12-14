'use client'

import { LogOut } from 'lucide-react';
import { Button } from './ui/button'

interface AuthHeaderProps {
    signOut: () => void;
}

export function AuthHeader({ signOut }: AuthHeaderProps) {

    return (
        <div className="flex items-center gap-2">
            <Button onClick={() => signOut()} className="bg-primary text-primary-foreground px-4 py-2 rounded cursor-pointer">
                <LogOut />
            </Button>
        </div>
    );
}