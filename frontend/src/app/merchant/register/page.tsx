'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MerchantRegister() {
    const { user, token, login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        country: 'Madagascar',
        shopName: '',
        address: '',
        mvolaNumber: '',
        logo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('images', files[0]);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: uploadFormData,
            });

            if (!res.ok) throw new Error('Failed to upload logo');

            const data = await res.json();
            setFormData({ ...formData, logo: data.urls[0] });
        } catch (err: any) {
            setError(err.message || 'Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            let url = `${process.env.NEXT_PUBLIC_API_URL}/user/merchant`;
            let body: any = {
                shopName: formData.shopName,
                address: formData.address,
                mvolaNumber: formData.mvolaNumber,
                logo: formData.logo
            };
            let headers: any = {
                'Content-Type': 'application/json'
            };

            if (user) {
                // Existing user upgrading to merchant
                headers['Authorization'] = `Bearer ${token}`;
                body.userId = user.id;
                body.email = user.email;
                body.name = user.name;
            } else {
                // New user registration
                url = `${process.env.NEXT_PUBLIC_API_URL}/user/register/merchant`;
                body.email = formData.email;
                body.password = formData.password;
                body.name = formData.name;
            }

            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            if (!user) {
                // Redirect to login or auto-login
                router.push('/'); // Or login page
                alert('Registration successful! Please login.');
            } else {
                router.push('/merchant/pending');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Fill in the Registration Information
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {!user && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Registration Country</label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                                    >
                                        <option>Madagascar</option>
                                        <option>United States</option>
                                        <option>France</option>
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">Country cannot be changed after registration.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Please enter email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Set up an account password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Please enter password"
                                    />
                                </div>

                                <div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                        placeholder="Please enter password again"
                                    />
                                </div>
                            </>
                        )}

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        required
                                        value={formData.shopName}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">MVola Number</label>
                                    <input
                                        type="text"
                                        name="mvolaNumber"
                                        required
                                        value={formData.mvolaNumber}
                                        onChange={handleChange}
                                        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Shop Logo</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        {formData.logo && (
                                            <img src={formData.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
                                        )}
                                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!user && (
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        required
                                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-gray-700">
                                        I have read and agreed to <a href="#" className="text-green-600 hover:text-green-500">Service Agreement</a>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Register'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
