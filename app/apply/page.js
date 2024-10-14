"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import swal from 'sweetalert';

export default function ApplyPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        creator_name: '',
        acc_no: '',
        telegram_group_username: '',
        username: ''
    });
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [telegramUsernameError, setTelegramUsernameError] = useState('');
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        swal({
            title: 'Instructions',
            text: "Before you apply, let's quickly set up your Telegram group. It's easy and takes less than a minute! \n 1. Open your Telegram group \n 2. Add @alyxSupportBot bot as an admin \n 3. That's it! You're ready to apply",
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'Got it!',
        })
    }, []);

    const validateUsername = (username) => {
        if (!username) return { error: "Error: Username is required!" }
        if (! /^[a-zA-Z0-9_]{5,16}$/.test(username.toString()) || /\s/.test(username)) return { error: "Username must be greater than 5 characters long, contain only letters, numbers, and underscores, and have no spaces." }
        return username.toString().toLowerCase()
    }
    const handleChange = (e) => {
        const { name, value } = e.target
        switch (name) {
            case 'username':
                const checkUsername = validateUsername(value)
                if (checkUsername.error) {
                    setUsernameError(checkUsername.error)
                    setFormData({ ...formData, [name]: value });
                } else {
                    setUsernameError('')
                    setFormData({ ...formData, [name]: value });
                }
                break
            case 'telegram_group_username':
                const checkTgUsername = validateUsername(value)
                if (checkTgUsername.error) {
                    setTelegramUsernameError(checkTgUsername.error)
                    setFormData({ ...formData, [name]: value });
                } else {
                    setTelegramUsernameError('')
                    setFormData({ ...formData, [name]: value });
                }
                break
            default:
                setFormData({ ...formData, [name]: value });
                break
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (usernameError) {
            setError(usernameError)
            return
        }
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, type: 'signup' }),
            });

            if (response.ok) {
                const { session } = await response.json();
                if (session) {
                    // Store the session in the browser
                    const supabase = createClient();
                    await supabase.auth.setSession(session);
                    router.push('/dashboard/creator'); // Redirect to creator dashboard
                } else {
                    router.push('/success'); // Redirect to success page for email confirmation
                }
            } else {
                const data = await response.json();
                console.log(data);
                setError(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">Apply to be a Creator</h2>
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="creator_name" className="block text-gray-700 text-sm font-bold mb-2">
                            Creator Name
                        </label>
                        <input
                            type="text"
                            id="creator_name"
                            name="creator_name"
                            value={formData.creator_name}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                            Username
                        </label>
                        {usernameError && <p className="text-red-500">{usernameError}</p>}
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="acc_no" className="block text-gray-700 text-sm font-bold mb-2">
                            CBE Account Number
                        </label>
                        <input
                            type="text"
                            id="acc_no"
                            name="acc_no"
                            value={formData.acc_no}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="telegram_group_username" className="block text-gray-700 text-sm font-bold mb-2">
                            Telegram Group Username
                        </label>
                        {telegramUsernameError && <p className="text-red-500">{telegramUsernameError}</p>}
                        <div className="flex items-center">
                            <span className="mr-2">@</span>
                            <input
                                type="text"
                                id="telegram_group_username"
                                name="telegram_group_username"
                                value={formData.telegram_group_username}
                                onChange={handleChange}
                                required
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
        </div>
    );
}
