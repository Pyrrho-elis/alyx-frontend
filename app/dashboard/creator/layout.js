"use client";

import DashboardNav from "@/app/components/DashboardNav";
import DashboardSideBar from "@/app/components/DashboardSideBar";
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
            <main className="flex p-4">
                <DashboardSideBar />
                <div className="flex-1 lg:ml-40">
                    {children}
                </div>
            </main>
        </div>
    );
}
