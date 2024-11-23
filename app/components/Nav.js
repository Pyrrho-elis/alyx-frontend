"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import Image from "next/image"
import logo from "@/app/public/LOGO.png"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import CustomButton from "./CustomButton"

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (pathname.startsWith("/dashboard") || pathname.startsWith("/paytest") || pathname.startsWith("/pay")) {
        return null
    }

    const navLinks = [
        { href: "/waitlist", label: "Join the Waitlist" },
        { href: "/learn-more", label: "How It Works" },
        { href: "/contact", label: "Contact" },
        { href: "/waitlist", label: "Get Access" },
    ]

    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "py-2 bg-white/80 backdrop-blur-lg shadow-sm" : "py-4"
            }`}>
            <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src={logo}
                                alt="Subzz Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-black/90 to-primary bg-clip-text text-transparent">
                            SUBZZ
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="absolute left-1/2 -translate-x-1/2 transform">
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.slice(0, -1).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Desktop CTA Buttons */}
                <div className="hidden md:flex md:items-center md:space-x-4">
                    <Link href="/waitlist">
                        <CustomButton variant="gooeyLeft">
                            Get Early Access
                        </CustomButton>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-sm">
                            <div className="mt-6 flow-root">
                                <div className="divide-y divide-gray-200">
                                    <div className="space-y-2 py-6">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
}