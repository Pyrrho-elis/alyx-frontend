import Link from 'next/link'
import React from 'react'
import { Brush, Plug2, Users, ChartLine } from "lucide-react"
import logo from "@/app/public/LOGO.png"
import Image from 'next/image'

export default function DashboardSideBar() {
    return (
        <div className='hidden md:flex flex-col items-center gap-4 left-0 top-0 pt-4 z-50 w-40 overflow-hidden h-screen fixed bg-white'>
            <div className="relative flex-shrink-0 hidden md:flex">
                <Link href="/" className="flex items-center">
                    {/* <Mountain className="h-8 w-8 text-primary" /> */}
                    <Image src={logo} alt="Logo" width={32} height={32} />
                </Link>
            </div>
            <hr className="mb-4 md:mb-0 w-full border-gray-300" />
            <div className='flex gap-2 justify-around items-center w-full px-4'><Brush className='h-4 w-4' /><Link href="/dashboard/creator/editpage">Edit Design</Link></div>
            <div className='flex gap-2 justify-around items-center w-full px-4'><Plug2 className='h-4 w-4' /><Link href="/dashboard/creator/integrations">Integrations</Link></div>
            <div className='flex gap-2 justify-around items-center w-full px-4'> <Users className='h-4 w-4' /><Link href="/dashboard/creator/members">Members</Link></div>
            <div className='flex gap-2 justify-around items-center w-full px-4'><ChartLine className='h-4 w-4' /><Link href="/dashboard/creator/analytics">Analytics</Link></div>
        </div>
    )
}
