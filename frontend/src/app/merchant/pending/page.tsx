'use client';

import Link from 'next/link';

export default function MerchantPending() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
                    <p className="text-gray-600 mb-6">
                        Your merchant application has been submitted and is currently under review.
                        You will be notified once your account is approved.
                    </p>
                    <Link href="/" className="text-green-600 hover:text-green-500 font-medium">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
