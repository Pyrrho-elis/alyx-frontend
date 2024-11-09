"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import usePublishStore from "../dashboard/creator/usePublishStore"

function Navbar({ user, logout }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')

    const { isActive, fetchCreatorData, loading, togglePublish } = usePublishStore()

    const handlePublishClick = async () => {
        togglePublish(username)
    }

    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setUsername(user.user_metadata.username)
            fetchCreatorData(username);
        }
    }, [user])

    return (
        <nav className="sticky w-full top-0 z-50 bg-gray-300">
            <div className="relative lg:m-0 flex h-[65px] min-w-full items-center sm:px-2 md:px-2 lg:px-8 bg-white border-b border-gray-300">
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
                                <Button className="shadow-sm" variant="outline" onClick={handlePublishClick} disabled={loading}> 
                                    Unpublish
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="shine" disabled={loading}>Share</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="">
                                        <DropdownMenuLabel>Share Your Community</DropdownMenuLabel>
                                        <div className="flex gap-4 p-4">
                                            <Input   className="font-bold text-base" disabled value={`subzz.vercel.app/${username}`} />
                                            <Button onClick={() => {
                                                navigator.clipboard.writeText(`subzz.vercel.app/${username}`)
                                                setIsCopied(true)
                                                setTimeout(() => {
                                                    setIsCopied(false)
                                                }, 2000)
                                            } } disabled={loading}>{isCopied ? 'Copied' : 'Copy'}</Button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button className="shadow-sm" variant="ringHover" onClick={handlePublishClick} disabled={loading}>
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