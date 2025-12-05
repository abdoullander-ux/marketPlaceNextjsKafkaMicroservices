'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MerchantDashboard() {
    const router = useRouter();
    const { user, isMerchant, isLoading, token } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isMerchant) {
                router.push('/');
                return;
            }
            if (user?.id) {
                fetchData(user.id);
            }
        }
    }, [user, isMerchant, isLoading, router, activeTab]);

    const fetchData = async (merchantId: string) => {
        setLoadingData(true);
        try {
            if (activeTab === 'products') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/merchant/${merchantId}`);
                if (res.ok) setProducts(await res.json());
            } else {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/orders/merchant/${merchantId}`);
                if (res.ok) setOrders(await res.json());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleOrderStatus = async (orderId: number, status: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderStatus: status })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!isMerchant) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
                    {activeTab === 'products' && (
                        <Link href="/merchant/products/new" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            Add New Product
                        </Link>
                    )}
                </div>

                <div className="flex space-x-4 mb-6 border-b">
                    <button
                        className={`py-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`py-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                </div>

                {loadingData ? (
                    <div className="text-center py-12">Loading data...</div>
                ) : activeTab === 'products' ? (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <li key={product.id}>
                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-16 w-16">
                                                <img className="h-16 w-16 rounded object-cover bg-gray-200" src={product.images[0] || '/placeholder.png'} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-green-600 truncate">{product.name}</div>
                                                <div className="flex mt-1 text-sm text-gray-500">
                                                    <span className="mr-4">Price: ${product.price}</span>
                                                    <span>Stock: {product.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <Link href={`/merchant/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium">Edit</Link>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-sm font-medium">Delete</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {products.length === 0 && <div className="p-4 text-center text-gray-500">No products found.</div>}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">#{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{order.productId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{order.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">${order.totalPrice}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.orderStatus === 'SHIPPING' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button onClick={() => handleOrderStatus(order.id, 'SHIPPING')} className="text-blue-600 hover:text-blue-900">Ship</button>
                                            <button onClick={() => handleOrderStatus(order.id, 'DELIVERED')} className="text-green-600 hover:text-green-900">Deliver</button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No orders found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
