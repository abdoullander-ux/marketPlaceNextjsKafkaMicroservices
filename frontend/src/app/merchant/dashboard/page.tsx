'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MerchantDashboard() {
    const router = useRouter();
    const { user, isMerchant, isLoading, token } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isMerchant) {
                router.push('/');
                return;
            }
            if (user?.id) {
                fetchProducts(user.id);
            }
        }
    }, [user, isMerchant, isLoading, router]);

    const fetchProducts = async (merchantId: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/merchant/${merchantId}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Ideally send token for secured endpoints
                }
            });

            if (res.ok) {
                setProducts(products.filter(p => p.id !== productId));
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    if (isLoading || loadingProducts) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    if (!isMerchant) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
                    <Link
                        href="/merchant/products/new"
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Add New Product
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500 mb-4">You haven't added any products yet.</p>
                        <Link
                            href="/merchant/products/new"
                            className="text-green-600 hover:text-green-700 font-medium"
                        >
                            Create your first product
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <li key={product.id}>
                                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-16 w-16">
                                                <img
                                                    className="h-16 w-16 rounded object-cover bg-gray-200"
                                                    src={product.images[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-green-600 truncate">
                                                    {product.name}
                                                </div>
                                                <div className="flex mt-1">
                                                    <p className="text-sm text-gray-500 mr-4">
                                                        Price: ${product.price}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Stock: {product.stock}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-3">
                                            <Link
                                                href={`/merchant/products/${product.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
