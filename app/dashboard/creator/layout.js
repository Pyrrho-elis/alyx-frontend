"use client"

import DashboardNav from "@/app/components/DashboardNav";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DSidebar } from "@/app/components/Dashboard/DSidebar";
import React, { Suspense, useState } from "react";
import { UserProvider, useUserContext } from "./UserContext";

// Import your tab components
import EditPage from "./tabs/EditPage";
import Integrations from "./tabs/Integrations";
import Members from "./tabs/Members";
import Analytics from "./tabs/Analytics";

const TAB_COMPONENTS = {
    "Edit Page": EditPage,
    "Integrations": Integrations,
    "Members": Members,
    "Analytics": Analytics,
};

export default function CreatorLayout() {
    return (
        <UserProvider>
            <InnerLayout />
        </UserProvider>
    );
}

function InnerLayout() {
    const { user, logout, creator, loading } = useUserContext();
    const [activeTab, setActiveTab] = useState("Edit Page");

    if (loading) {
        return <div>Loading...</div>;
    }

    const ActiveComponent = TAB_COMPONENTS[activeTab];

    return (
        <>
            <DSidebar title="Dashboard" activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="w-full">
                <DashboardNav user={user} logout={logout} />
                <SidebarTrigger className="hidden md:block fixed bg-gray-100 border-r-2 border-b-2 border-t-2 mt-2 rounded-r-lg rounded-l-none text-2xl" />
                <Suspense fallback={<div>Loading...</div>}>
                    <ActiveComponent />
                </Suspense>
            </main>
        </>
    );
}