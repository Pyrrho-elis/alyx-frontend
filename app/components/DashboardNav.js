"use client"

import { useState } from "react"
import Link from "next/link"
import { Mountain, Menu } from "lucide-react"
import Image from "next/image"
import logo from "@/app/public/LOGO.png"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

export default function Navbar({ userEmail, isActive, handlePublish, userName }) {
    const [isOpen, setIsOpen] = useState(false)

    const handlePublishClick = () => {
        handlePublish()
    }

    return (
        <nav className="sticky w-full top-0 z-50">
            <div className="relative lg:m-0 flex h-[65px] max-w-full items-center px-16 sm:px-6 lg:px-8 bg-white border-b border-gray-300">
                {/* Blurry background */}
                {/* <div className="absolute inset-0 rounded-full bg-white/30 backdrop-blur-md" /> */}
                <div className="bg-white" />

                {/* Grainy texture */}
                {/* <div className="absolute inset-0 rounded-full opacity-50 mix-blend-multiply"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                /> */}

                {/* Logo */}


                <div className="flex w-full px-4 space-x-4 md:hidden">
                    {/* <Button className="shadow-sm" variant="outline" onClick={() => console.log('Publish')}>
                            {isActive ? 'Unpublish' : 'Publish'}
                        </Button> */}
                    {isActive ? (
                        <>
                            <Button className="shadow-sm" variant="outline" onClick={handlePublishClick}>
                                Unpublish
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>Share</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="">
                                    <DropdownMenuLabel>Share Your Community</DropdownMenuLabel>
                                    <div className="flex gap-4 p-4">
                                        <Input className="font-bold text-base" disabled value={`alyx.pro.et/${userName}`} />
                                        <Button>Copy</Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="ml-auto hidden md:flex md:items-center">
                            <Button className="shadow-sm" variant="outline" onClick={handlePublish}>
                                Publish
                            </Button>
                        </div>
                    )}
                </div>

                {/* Desktop Navigation - Centered */}
                <div className=" hidden  md:block">
                    <div className="flex space-x-4">
                        {/* <Button className="shadow-sm" variant="outline" onClick={() => console.log('Publish')}>
                            {isActive ? 'Unpublish' : 'Publish'}
                        </Button> */}
                        {isActive ? (
                            <>
                                <Button className="shadow-sm" variant="outline" onClick={handlePublishClick}>
                                    Unpublish
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button>Share</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="">
                                        <DropdownMenuLabel>Share Your Community</DropdownMenuLabel>
                                        <div className="flex gap-4 p-4">
                                            <Input className="font-bold text-base" disabled value={`alyx.pro.et/${userName}`} />
                                            <Button>Copy</Button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button className="shadow-sm" variant="outline" onClick={handlePublishClick}>
                                    Publish
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop CTA Buttons */}
                <div className="relative ml-auto hidden md:flex md:items-center">
                    {/* <Link href="/apply"> */}
                    <Button>{userEmail}</Button>
                    {/* </Link> */}
                </div>

                {/* Mobile Menu Button */}
                <div className="relative md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <nav className="flex flex-col space-y-4">
                                <Link href="/dashboard/creator/editpage" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost">
                                        Edit Design
                                    </Button>
                                </Link>
                                <Link href="/dashboard/creator/integrations" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost">
                                        Integrations
                                    </Button>
                                </Link>
                                <Link href="/dashboard/creator/members" className="justify-start" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost">
                                        Members
                                    </Button>
                                </Link>
                                <Link href="/dashboard/creator/analytics" className="justify-start" onLink={() => setIsOpen(false)}>
                                    <Button variant="ghost">
                                        Analytics
                                    </Button>
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav >
    )
}