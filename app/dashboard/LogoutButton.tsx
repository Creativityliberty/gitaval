'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Sign Out"
        >
            <LogOut className="h-5 w-5" />
        </button>
    );
}
