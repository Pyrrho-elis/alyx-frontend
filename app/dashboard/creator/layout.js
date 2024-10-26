"use client"

import DashboardNav from "@/app/components/DashboardNav";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DSidebar } from "@/app/components/Dashboard/DSidebar";
import getCreatorData from "./getCreatorData";
import { useUser } from "@/app/hooks/useUser";
import { useCreator } from "@/app/hooks/useCreator";
import React, { Suspense } from "react";
import CreatorDataContext from "./creatorDataContext";

export default function CreatorLayout({ children }) {
    const { user } = useUser()
    const { creator } = useCreator({ username: user?.user_metadata.username })
    const data = creator ? creator : {}
    return (
        <CreatorDataContext.Provider value={data}>
            <DSidebar title="Dashboard" />
            <main className="w-full">
                <DashboardNav />
                {/* <div role="presentation" className="hidden md:block fixed p-2 bg-gray-300 rounded-r-lg "> */}
                <SidebarTrigger className="hidden md:block fixed bg-gray-100 border-r-2 border-b-2 border-t-2 mt-2 rounded-r-lg rounded-l-none text-2xl" />
                {/* </div> */}
                <Suspense fallback={<>loading</>}>
                    {children}
                </Suspense>
            </main>
        </ CreatorDataContext.Provider>
    );
}
