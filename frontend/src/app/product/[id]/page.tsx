import ProductDetail from '@/components/ProductDetail';
import { notFound } from 'next/navigation';
import Image from 'next/image';

async function getProduct(id: string) {
    // Use product-service hostname for internal docker communication
    // But since we are running in dev mode locally, and Next.js might be running on host or container...
    // If Next.js is in container (which it is), it can reach product-service:3001
    const res = await fetch(`http://product-service:3001/products/${id}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        return undefined;
    }

    return res.json();
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="text-sm text-gray-600">
                        <span className="hover:text-orange-600 cursor-pointer">Accueil</span>
                        <span className="mx-2">›</span>
                        <span className="hover:text-orange-600 cursor-pointer">Vêtements</span>
                        <span className="mx-2">›</span>
                        <span className="hover:text-orange-600 cursor-pointer">T-shirts</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-900">Produit</span>
                    </div>
                </div>
            </div>

            {/* Product Detail */}
            <div className="py-6">
                <ProductDetail product={product} />
            </div>

            {/* Similar Articles Section */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Articles similaires</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex flex-col gap-2 group cursor-pointer">
                                <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden border border-gray-200 group-hover:border-orange-300 transition">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                        Produit {i}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                        -{20 + i}%
                                    </div>
                                </div>
                                <div className="text-sm text-gray-800 line-clamp-2 group-hover:text-orange-600 transition">
                                    T-shirt similaire style {i}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-red-600">${(4.99 + i * 0.5).toFixed(2)}</span>
                                    <span className="text-xs text-gray-400 line-through">${(9.99 + i).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="text-orange-400">★★★★☆</span>
                                    <span>{100 + i * 10} vendus</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
