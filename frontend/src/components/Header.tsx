'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { isAuthenticated, user, login, logout, isLoading, isMerchant, isOwner } = useAuth();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const categories = [
        'Electronics',
        'Fashion',
        'Home & Garden',
        'Sports',
        'Beauty',
        'Toys',
        'Automotive'
    ];

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-2">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
                    <div className="flex gap-4">
                        <span>🎉 Welcome to MadaMarket!</span>
                        <span>📦 Free Shipping on orders over $50</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        {isLoading ? (
                            <span>Loading...</span>
                        ) : isAuthenticated && user ? (
                            <>
                                <span className="font-semibold">👋 {user.name}</span>
                                {!isMerchant && !isOwner && (
                                    <>
                                        <span className="text-gray-200">|</span>
                                        <Link href="/merchant/register" className="hover:underline font-bold">Become a Seller</Link>
                                    </>
                                )}
                                {isMerchant && (
                                    <>
                                        <span className="text-gray-200">|</span>
                                        <Link href="/merchant/dashboard" className="hover:underline font-bold">Merchant Dashboard</Link>
                                    </>
                                )}
                                {isOwner && (
                                    <>
                                        <span className="text-gray-200">|</span>
                                        <Link href="/admin" className="hover:underline font-bold">Admin Panel</Link>
                                    </>
                                )}
                                <span className="text-gray-200">|</span>
                                <button onClick={logout} className="hover:underline">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/merchant/register" className="hover:underline font-semibold">Become a Seller</Link>
                                <span className="text-gray-200">|</span>
                                <button onClick={login} className="hover:underline">Login</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-green-700">
                            MadaMarket
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                        <div className="flex">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for products..."
                                className="flex-1 px-4 py-2 border-2 border-orange-500 rounded-l-full focus:outline-none focus:border-orange-600"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-8 py-2 rounded-r-full hover:from-green-600 hover:to-orange-600 font-semibold"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Cart */}
                    <Link href="/cart" className="flex items-center gap-2 hover:text-orange-600 transition">
                        <div className="relative">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                0
                            </span>
                        </div>
                        <span className="font-semibold">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Categories Bar */}
            <div className="bg-gray-100 border-t">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-6 py-3 overflow-x-auto">
                        <Link href="/" className="text-sm font-semibold hover:text-orange-600 whitespace-nowrap transition">
                            All Categories
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category}
                                href={`/category/${encodeURIComponent(category)}`}
                                className="text-sm hover:text-orange-600 whitespace-nowrap transition"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
