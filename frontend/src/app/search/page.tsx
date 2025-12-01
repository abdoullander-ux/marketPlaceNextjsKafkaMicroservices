import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

async function searchProducts(query: string) {
    const res = await fetch(`http://product-service:3001/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store'
    });
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const query = params.q || '';
    const products = query ? await searchProducts(query) : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Search Results for "{query}"
                    </h1>
                    <p className="text-gray-600">{products.length} products found</p>
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
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
                        <p className="text-gray-600">Try different keywords or browse categories</p>
                    </div>
                )}
            </main>
        </div>
    );
}
