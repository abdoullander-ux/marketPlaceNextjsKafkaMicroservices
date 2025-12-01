'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Cart() {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [mvolaNumber, setMvolaNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Process each item as a separate sale (simplification for MVP)
            // Ideally, we should have an Order API that handles multiple items
            for (const item of cart) {
                const res = await fetch('http://localhost:3002/sales', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: item.id,
                        quantity: item.quantity,
                        mvolaNumber: mvolaNumber
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Payment failed for some items');
                }
            }

            setSuccess(true);
            setCart([]);
            localStorage.removeItem('cart');
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && !success) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <Link href="/" className="text-green-600 hover:text-green-500 font-medium">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                    <p className="text-sm text-gray-500">Redirecting to home...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.map((item, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow flex gap-4">
                                <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700">
                                            Remove
                                        </button>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {item.color}, {item.size}
                                    </p>
                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                        <div className="text-lg font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Checkout */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-green-600">Free</span>
                            </div>
                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-orange-600">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-4">
                                <div>
                                    <label htmlFor="mvola" className="block text-sm font-medium text-gray-700 mb-1">
                                        MVola Number
                                    </label>
                                    <input
                                        type="text"
                                        id="mvola"
                                        required
                                        placeholder="034 xx xxx xx"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        value={mvolaNumber}
                                        onChange={(e) => setMvolaNumber(e.target.value)}
                                    />
                                </div>

                                {error && <div className="text-red-600 text-sm">{error}</div>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 text-white py-3 rounded-full font-bold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Pay with MVola'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
