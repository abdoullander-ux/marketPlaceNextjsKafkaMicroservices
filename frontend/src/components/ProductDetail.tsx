'use client';

import { useState } from 'react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    discountPrice?: number;
    rating?: number;
    reviewsCount?: number;
    soldCount?: number;
    images: string[];
    colors: string[];
    sizes: string[];
    colorImages?: Record<string, string[]>;
}

export default function ProductDetail({ product }: { product: Product }) {
    // Get initial images based on first color if colorImages exists
    const getImagesForColor = (color: string) => {
        if (product.colorImages && product.colorImages[color]) {
            return product.colorImages[color];
        }
        return product.images;
    };

    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [currentImages, setCurrentImages] = useState(getImagesForColor(product.colors[0]));
    const [selectedImage, setSelectedImage] = useState(currentImages[0]);
    const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();

    const addToCart = (redirect = false) => {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: selectedImage,
            color: selectedColor,
            size: selectedSize,
            quantity: quantity,
            merchantId: (product as any).merchantId || 1 // Assuming merchantId might be missing in type definition
        };

        const storedCart = localStorage.getItem('cart');
        const cart = storedCart ? JSON.parse(storedCart) : [];
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));

        if (redirect) {
            router.push('/cart');
        } else {
            alert('Added to cart!');
        }
    };

    const discountPercentage = product.originalPrice
        ? Math.round(((product.originalPrice - (product.discountPrice || product.price)) / product.originalPrice) * 100)
        : 0;

    // Handle color change
    const handleColorChange = (color: string) => {
        setSelectedColor(color);
        const newImages = getImagesForColor(color);
        setCurrentImages(newImages);
        setSelectedImage(newImages[0]);
    };

    return (
        <div className="max-w-7xl mx-auto p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Column: Images */}
                <div className="md:col-span-5 flex gap-3">
                    <div className="flex flex-col gap-2">
                        {currentImages.map((img, idx) => (
                            <div
                                key={idx}
                                className={`w-20 h-20 border-2 cursor-pointer rounded-md overflow-hidden transition-all ${selectedImage === img
                                    ? 'border-orange-500 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onMouseEnter={() => setSelectedImage(img)}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${idx}`}
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                            src={selectedImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                        {discountPercentage > 0 && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                -{discountPercentage}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Column: Product Info */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    <div>
                        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded mb-2">
                            CYBER MONDAY
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 leading-tight">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="flex items-center text-orange-400">
                                {'★'.repeat(Math.floor(product.rating || 0))}
                                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                            </div>
                            <span className="text-gray-900 font-semibold">{product.rating}</span>
                        </div>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600">{product.reviewsCount} Avis</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 font-medium">{product.soldCount} vendus</span>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-lg border border-red-100">
                        <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-4xl font-bold text-red-600">US ${product.discountPrice || product.price}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">US ${product.originalPrice}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-orange-600 text-sm font-semibold">🔥 Vente en gros:</span>
                            <span className="text-sm text-gray-700">2+ pièces, extra -5%</span>
                        </div>
                        <div className="text-gray-500 text-xs">Prix hors taxe · Économisez US ${((product.originalPrice || 0) - (product.discountPrice || product.price)).toFixed(2)}</div>
                    </div>

                    {/* Colors */}
                    <div className="border-t pt-4">
                        <div className="text-sm font-semibold text-gray-800 mb-3">
                            Couleur: <span className="text-gray-900">{selectedColor}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-4 py-2 border-2 text-sm rounded-md font-medium transition-all ${selectedColor === color
                                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="text-sm font-semibold text-gray-800">
                                Taille: <span className="text-gray-900">{selectedSize}</span>
                            </div>
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                📏 Guide des tailles
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[3.5rem] px-3 py-2 border-2 text-sm rounded-md font-medium transition-all ${selectedSize === size
                                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="border-t pt-4">
                        <div className="text-sm font-semibold text-gray-800 mb-3">Quantité</div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition"
                                >
                                    -
                                </button>
                                <span className="w-14 text-center font-semibold text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 flex items-center justify-center font-bold text-gray-700 transition"
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-sm text-gray-500">48 disponibles</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            onClick={() => addToCart(true)}
                            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-4 rounded-full hover:from-red-700 hover:to-red-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                            Acheter maintenant
                        </button>
                        <button
                            onClick={() => addToCart(false)}
                            className="w-full bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 font-bold py-4 rounded-full border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-100 transition-all">
                            Ajouter au panier
                        </button>
                    </div>

                    <div className="flex justify-between text-sm text-gray-500 mt-2 pt-4 border-t">
                        <button className="flex items-center gap-2 hover:text-orange-600 transition">
                            <span className="text-lg">↩</span>
                            <span className="text-xs">75-Day Buyer Protection</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-red-500 transition">
                            <span className="text-lg">♡</span>
                            <span className="text-xs font-semibold">123</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Shipping & Store */}
                <div className="md:col-span-3 space-y-4">
                    <div className="border-2 border-gray-200 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                        <div className="text-sm mb-3">
                            <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <span>🚚</span>
                                <span>Livré vers <span className="text-blue-600 underline cursor-pointer">Madagascar</span></span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Livraison:</span>
                                    <span className="font-bold text-gray-900">US $5.88</span>
                                </div>
                                <div className="text-gray-500 text-xs">Estimation: 11-20 jours</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-gray-200 p-4 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                U
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-gray-900">Boutique officielle UYE</div>
                                <div className="text-xs text-gray-500">Vendeur vérifié</div>
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600 mb-3">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-green-600">95%</span>
                                <span>Positif</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-blue-600">10K+</span>
                                <span>Abonnés</span>
                            </div>
                        </div>
                        <button className="w-full border-2 border-orange-500 text-orange-600 font-semibold py-2 rounded-full hover:bg-orange-50 transition text-sm">
                            Suivre
                        </button>
                    </div>

                    <div className="border-2 border-green-200 bg-green-50 p-4 rounded-lg">
                        <div className="text-xs font-bold text-green-800 mb-2 flex items-center gap-2">
                            <span>✅</span>
                            <span>Engagement de service</span>
                        </div>
                        <ul className="text-xs text-green-700 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span>Livraison à temps garantie</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span>Protection de l'acheteur 75 jours</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span>Retour gratuit sous 15 jours</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
