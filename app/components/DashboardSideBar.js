import Link from 'next/link'
import React from 'react'
import { Brush, Plug2, Users, ChartLine } from "lucide-react"

export default function DashboardSideBar() {
    return (
        <div className='hidden md:flex flex-col items-center gap-4 left-0 z-1 w-40 overflow-hidden h-full fixed bg-white shadow-xl'>
            <div className='flex gap-2 justify-around items-center w-full px-4'><Brush className='h-4 w-4' /><Link href="/dashboard/creator/editpage">Edit Design</Link></div>
            <div className='flex gap-2 justify-around items-center w-full px-4'><Plug2 className='h-4 w-4' /><Link href="/dashboard/creator/integrations">Integrations</Link></div>
            <div className='flex gap-2 justify-around items-center w-full px-4'> <Users className='h-4 w-4' /><Link href="/dashboard/creator/members">Members</Link></div>
            <div className='flex gap-2 justify-around items-center w-full px-4'><ChartLine className='h-4 w-4' /><Link href="/dashboard/creator/analytics">Analytics</Link></div>
        </div>
    )
}
