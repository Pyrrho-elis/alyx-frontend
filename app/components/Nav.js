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

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="sticky top-4 z-50 w-full">
            <div className="relative mx-auto mt-4 flex h-16 max-w-3xl items-center justify-between rounded-full px-4 sm:px-6 lg:px-8 bg-white shadow-md">
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
                <div className="relative flex-shrink-0">
                    <Link href="/" className="flex items-center">
                        {/* <Mountain className="h-8 w-8 text-primary" /> */}
                        <Image src={logo} alt="Logo" width={32} height={32} />
                    </Link>
                </div>

                {/* Desktop Navigation - Centered */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 transform md:block">
                    <div className="flex space-x-4">
                        <Link href="#features">
                            <Button variant="ghost">
                                Features
                            </Button>
                        </Link>
                        <Link href="#pricing">
                            <Button variant="ghost">
                                Pricing
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Desktop CTA Buttons */}
                <div className="relative ml-auto hidden md:flex md:items-center">
                    <Link href="/login">
                        <Button variant="ghost" className="mr-2">
                            Sign In
                        </Button>
                    </Link>
                    <Link href="/apply">
                        <Button>Get Started for Free</Button>
                    </Link>
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
                                <Link href="#features" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
                                    Features
                                </Link>
                                <Link href="#pricing" className="text-lg font-semibold" onClick={() => setIsOpen(false)}>
                                    Pricing
                                </Link>
                                <hr className="my-4" />
                                <Link href="/login" className="justify-start" onClick={() => setIsOpen(false)}>
                                    <Button variant="ghost" className="justify-start" onClick={() => setIsOpen(false)}>
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/apply" className="justify-start" onClick={() => setIsOpen(false)}>
                                    <Button className="justify-start" onClick={() => setIsOpen(false)}>
                                        Get Started for Free
                                    </Button>
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
}