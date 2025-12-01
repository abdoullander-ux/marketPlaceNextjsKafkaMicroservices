import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

async function getProductsByCategory(category: string) {
    const res = await fetch(`http://product-service:3001/category/${encodeURIComponent(category)}`, {
        cache: 'no-store'
    });
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    const products = await getProductsByCategory(decodedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-gray-600">
                    <a href="/" className="hover:text-orange-600">Home</a>
                    <span className="mx-2">›</span>
                    <span className="text-gray-900 font-semibold">{decodedCategory}</span>
                </div>

                {/* Category Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-2">{decodedCategory}</h1>
                    <p className="text-lg opacity-90">{products.length} products available</p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-semibold text-gray-700">Sort by:</span>
                        <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-medium hover:bg-orange-200">
                            Best Selling
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                            Price: Low to High
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                            Price: High to Low
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
                            Top Rated
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                        <p className="text-gray-600">Try browsing other categories</p>
                    </div>
                )}
            </main>
        </div>
    );
}
