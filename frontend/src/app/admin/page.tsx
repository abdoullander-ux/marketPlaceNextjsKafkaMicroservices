'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function AdminPage() {
    const [pendingMerchants, setPendingMerchants] = useState<any[]>([]);
    const { isAuthenticated, isOwner, isLoading, login, token } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            login();
        } else if (isAuthenticated && isOwner) {
            fetchPendingMerchants();
        }
    }, [isLoading, isAuthenticated, login, isOwner]);

    const fetchPendingMerchants = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/merchant/admin/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPendingMerchants(await res.json());
            }
        } catch (error) {
            console.error('Error fetching pending merchants:', error);
        }
    };

    const handleApprove = async (merchantId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/merchant/${merchantId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'APPROVED' })
            });

            if (res.ok) {
                alert('Merchant approved successfully');
                setPendingMerchants(pendingMerchants.filter(m => m.userId !== merchantId));
            } else {
                alert('Failed to approve merchant');
            }
        } catch (error) {
            console.error('Error approving merchant:', error);
            alert('Error approving merchant');
        }
    };

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
                        <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
                        <p className="text-3xl font-bold text-orange-600">{pendingMerchants.length}</p>
                    </div>
                    {/* Other stats placeholders */}
                </div>

                {/* Pending Merchants Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Pending Merchant Applications</h2>
                    </div>
                    {pendingMerchants.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {pendingMerchants.map((merchant) => (
                                <li key={merchant.userId} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {merchant.logo && (
                                                <img src={merchant.logo} alt={merchant.shopName} className="h-12 w-12 rounded-full object-cover mr-4" />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{merchant.shopName}</h3>
                                                <div className="text-sm text-gray-500">
                                                    <p>Owner: {merchant.user?.name} ({merchant.user?.email})</p>
                                                    <p>Address: {merchant.address}</p>
                                                    <p>MVola: {merchant.mvolaNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleApprove(merchant.userId)}
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            No pending merchant applications.
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Other Admin Functions</h2>
                    <div className="space-y-4">
                        <div className="border-b pb-4">
                            <h3 className="font-semibold mb-2">Manage All Products</h3>
                            <p className="text-sm text-gray-600">View, edit, or delete any product in the marketplace</p>
                        </div>
                        {/* ... other sections ... */}
                    </div>
                </div>
            </div>
        </div>
    );
}
