"use client";

import DashboardNav from "@/app/components/DashboardNav";
import { useUser } from '@/app/hooks/useUser'
import { useEffect, useState } from 'react'

export default function CreatorLayout({ children }) {
    const { user } = useUser()
    const [email, setEmail] = useState('')
    useEffect(() => {
        if (user) {
            setEmail(user.email)
        }
    }, [user])
    return (
        <div>
            <DashboardNav userEmail={email} />
            <main className="p-4">
                {children}
            </main>
        </div>
    );
}
