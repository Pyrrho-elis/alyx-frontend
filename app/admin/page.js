'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        username: '',
        creator_name: '',
        is_whitelisted: false
    });

    const [usernameError, setUsernameError] = useState('');

    const validateUsername = (username) => {
        if (!username) return { error: "Error: Username is required!" }
        if (! /^[a-zA-Z0-9_]{5,16}$/.test(username.toString()) || /\s/.test(username)) {
            return { error: "Username must be greater than 5 characters long, contain only letters, numbers, and underscores, and have no spaces." }
        }
        return username.toString().toLowerCase()
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            const checkUsername = validateUsername(value);
            if (checkUsername.error) {
                setUsernameError(checkUsername.error);
            } else {
                setUsernameError('');
            }
        }
        setNewUser({ ...newUser, [name]: value });
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch users');
            }

            setUsers(data.users);
            setError(null);
        } catch (err) {
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user');
            }

            // Reset form and refresh users
            setNewUser({
                email: '',
                password: '',
                username: '',
                creator_name: '',
                is_whitelisted: false
            });
            setShowCreateForm(false);
            await fetchUsers();

        } catch (err) {
            alert(err.message);
        }
    };

    const handleWhitelistToggle = async (userId, currentStatus) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    is_whitelisted: !currentStatus,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            // Update local state
            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, is_whitelisted: !currentStatus };
                }
                return user;
            }));
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <h2 className="mt-4 text-lg font-medium text-gray-900">Loading...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Access Denied! </strong>
                            <span className="block sm:inline">You are not authorized to view this page.</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {showCreateForm ? 'Cancel' : 'Create New User'}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={newUser.password}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newUser.username}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {usernameError && (
                                    <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Creator Name</label>
                                <input
                                    type="text"
                                    name="creator_name"
                                    value={newUser.creator_name}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_whitelisted"
                                    checked={newUser.is_whitelisted}
                                    onChange={(e) => setNewUser({ ...newUser, is_whitelisted: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Whitelist User
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={usernameError}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                            >
                                Create User
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">User List</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage user access and permissions</p>
                    </div>
                    <div className="border-t border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign In</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_whitelisted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.is_whitelisted ? 'Whitelisted' : 'Not Whitelisted'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleWhitelistToggle(user.id, user.is_whitelisted)}
                                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                    user.is_whitelisted
                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            >
                                                {user.is_whitelisted ? 'Remove from Whitelist' : 'Add to Whitelist'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
