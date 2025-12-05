'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Merchant {
    id: number;
    shopName: string;
    status: string;
    user: {
        email: string;
        name: string;
    };
}

export default function AdminDashboard() {
    const { token } = useAuth();
    const [merchants, setMerchants] = useState<Merchant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingMerchants();
    }, [token]);

    const fetchPendingMerchants = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/merchant/admin/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMerchants(data);
            }
        } catch (error) {
            console.error('Failed to fetch merchants', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/merchant/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setMerchants(merchants.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <h2 className="text-xl mb-4">Pending Merchant Approvals</h2>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {merchants.map((merchant) => (
                            <tr key={merchant.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{merchant.shopName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{merchant.user.name}</div>
                                    <div className="text-sm text-gray-500">{merchant.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button
                                        onClick={() => handleApproval(merchant.id, 'APPROVED')}
                                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleApproval(merchant.id, 'REJECTED')}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {merchants.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No pending approvals</div>
                )}
            </div>
        </div>
    );
}
