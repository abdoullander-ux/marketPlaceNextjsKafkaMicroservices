import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        price: number;
        originalPrice?: number;
        discountPrice?: number;
        rating: number;
        soldCount: number;
        images: string[];
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - (product.discountPrice || product.price)) / product.originalPrice) * 100)
        : 0;

    return (
        <Link href={`/product/${product.id}`} className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 group block">
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {product.images && product.images[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                {discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discountPercentage}%
                    </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-white p-2 rounded-full shadow-lg hover:bg-red-50">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="p-3">
                <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition h-10">
                    {product.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold text-red-600">
                        ${product.discountPrice || product.price}
                    </span>
                    {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                            ${product.originalPrice}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="text-orange-400">{'★'.repeat(Math.floor(product.rating))}</span>
                        <span className="font-semibold text-gray-700">{product.rating}</span>
                    </div>
                    <span>{product.soldCount.toLocaleString()} sold</span>
                </div>
            </div>
        </Link>
    );
}
