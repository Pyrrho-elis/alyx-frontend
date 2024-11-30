"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const activeClass = "text-blue-500";
    const inactiveClass = "text-gray-600";

    return (
        <div className="w-full mt-16">
            <nav className="flex space-x-4 justify-center mt-8">
                <Link href="/admin/dashboard" className={pathname === '/admin/dashboard' ? activeClass : inactiveClass}>
                    Dashboard
                </Link>
                <Link href="/admin/withdrawals" className={pathname === '/admin/withdrawals' ? activeClass : inactiveClass}>
                    Withdrawals
                </Link>
            </nav>
            {children}
        </div>
    );
}