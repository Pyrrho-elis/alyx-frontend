"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useUser } from '@/app/hooks/useUser'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"

function Navbar({ user, logout }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [email, setEmail] = useState('')
    const [isActive, setIsActive] = useState(false)
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')

    const handlePublishClick = async () => {
        try {
            const response = await fetch(`/api/creator/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isActive: !isActive,
                }),
            }
            );
            if (!response.ok) {
                throw new Error('Failed to update creator data');
            }
            const data = await response.json();
            console.log('Update successful:', data);
            fetchCreatorData();
        } catch (error) {
            console.error('Error updating creator data:', error);
        }
    }

    const fetchCreatorData = async () => {
        try {
            const response = await fetch(`/api/creator/${user.user_metadata.username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch creator data');
            }
            const data = await response.json();
            setIsActive(data.isActive);
        } catch (error) {
            console.error('Error fetching creator data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setUsername(user.user_metadata.username)
            fetchCreatorData();
        }
    }, [user])

    return (
        <nav className="sticky w-full top-0 z-50 bg-gray-300">
            <div className="relative lg:m-0 flex h-[65px] max-w-full items-center px-8 sm:px-2 md:px-2 lg:px-8 bg-white border-b border-gray-300">
                <div className="bg-gray-300" />
                <div className="flex w-full px-4 space-x-4 md:hidden">
                    {isActive ? (
                        <>
                            <Button className="shadow-sm" variant="outline" onClick={handlePublishClick}>
                                Unpublish
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="shine">Share</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="">
                                    <DropdownMenuLabel>Share Your Community</DropdownMenuLabel>
                                    <div className="flex gap-4 p-4">
                                        <Input className="font-bold text-base" disabled value={`subzz.vercel.app/${username}`} />
                                        <Button onClick={() => {
                                            navigator.clipboard.writeText(`subzz.vercel.app/${username}`)
                                            setIsCopied(true)
                                            setTimeout(() => {
                                                setIsCopied(false)
                                            }, 2000)
                                        }}>{isCopied ? 'Copied' : 'Copy'}</Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <div className="ml-auto hidden md:flex md:items-center">
                            <Button className="shadow-sm" variant="ringHover" onClick={handlePublishClick}>
                                Publish
                            </Button>
                        </div>
                    )}
                </div>

                {/* Desktop Navigation - Centered */}
                <div className=" hidden  md:block">
                    <div className="flex space-x-4">
                        {isActive ? (
                            <>
                                <Button className="shadow-sm" variant="outline" onClick={handlePublishClick}>
                                    Unpublish
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="shine">Share</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="">
                                        <DropdownMenuLabel>Share Your Community</DropdownMenuLabel>
                                        <div className="flex gap-4 p-4">
                                            <Input className="font-bold text-base" disabled value={`subzz.vercel.app/${username}`} />
                                            <Button onClick={() => {
                                                navigator.clipboard.writeText(`subzz.vercel.app/${username}`)
                                                setIsCopied(true)
                                                setTimeout(() => {
                                                    setIsCopied(false)
                                                }, 2000)
                                            }}>{isCopied ? 'Copied' : 'Copy'}</Button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button className="shadow-sm" variant="ringHover" onClick={handlePublishClick}>
                                    Publish
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop CTA Buttons */}
                <div className="relative ml-auto hidden md:flex md:items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button>{email}</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="flex flex-col gap-2 justify-around items-center p-2">
                            <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
                            <Button className="w-full" onClick={logout}>Logout</Button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="relative md:hidden">
                    <SidebarTrigger />
                </div>
            </div>
        </nav >
    )
}

export default React.memo(Navbar);