'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function AdminPage() {
    const { isAuthenticated, isOwner, isLoading, login } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            login();
        }
    }, [isLoading, isAuthenticated, login]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isOwner) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                    <p className="text-sm text-gray-500 mt-2">Only marketplace owners can access the admin panel.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Total Products</h3>
                        <p className="text-3xl font-bold text-green-600">-</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Total Merchants</h3>
                        <p className="text-3xl font-bold text-blue-600">-</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                        <p className="text-3xl font-bold text-purple-600">-</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Admin Functions</h2>
                    <div className="space-y-4">
                        <div className="border-b pb-4">
                            <h3 className="font-semibold mb-2">Manage All Products</h3>
                            <p className="text-sm text-gray-600">View, edit, or delete any product in the marketplace</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="font-semibold mb-2">Manage Merchants</h3>
                            <p className="text-sm text-gray-600">View merchant profiles and manage commissions</p>
                        </div>
                        <div className="border-b pb-4">
                            <h3 className="font-semibold mb-2">View All Sales</h3>
                            <p className="text-sm text-gray-600">Access complete sales history and analytics</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">System Settings</h3>
                            <p className="text-sm text-gray-600">Configure marketplace settings and policies</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
