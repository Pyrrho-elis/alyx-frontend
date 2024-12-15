'use client';
import { useEffect } from "react";

export default function PaymentSuccessPage() {
    useEffect(() => {
        setTimeout(() => {
            window.location.href = 'https://t.me/subzzSupportBot';
        }, 2000); // Redirect after 2 seconds
    }, []);
    return (
        <div className="flex flex-col items-center w-full justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <h2 className="text-center text-3xl font-bold text-gray-900">Payment Success</h2>
                <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-center text-gray-700">You will be redirected back to Telegram in a few seconds</p>
            </div>
        </div>
    );
}