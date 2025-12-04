import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

async function getProducts() {
  // Use server-side API URL for Docker, fallback to client URL for development
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${apiUrl}/products`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status, res.statusText);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  // Group products by category
  const electronics = products.filter((p: any) => p.category === 'Electronics').slice(0, 6);
  const fashion = products.filter((p: any) => p.category === 'Fashion').slice(0, 6);
  const homeGarden = products.filter((p: any) => p.category === 'Home & Garden').slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-orange-400 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-4">
                  Mega Sale!
                </h1>
                <p className="text-2xl mb-6">
                  Up to 70% OFF on selected items
                </p>
                <p className="text-lg mb-8 opacity-90">
                  Shop now and save big on electronics, fashion, home goods, and more!
                </p>
                <button className="bg-white text-green-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
                  Shop Now →
                </button>
              </div>
              <div className="hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="font-bold">Electronics</div>
                    <div className="text-sm opacity-90">From $24.99</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
                    <div className="text-4xl mb-2">👕</div>
                    <div className="font-bold">Fashion</div>
                    <div className="text-sm opacity-90">From $4.52</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
                    <div className="text-4xl mb-2">🏠</div>
                    <div className="font-bold">Home & Garden</div>
                    <div className="text-sm opacity-90">From $34.99</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
                    <div className="text-4xl mb-2">⚽</div>
                    <div className="font-bold">Sports</div>
                    <div className="text-sm opacity-90">From $34.99</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flash Deals */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold mb-2">⚡ Flash Deals</h2>
                <p className="text-lg">Limited time offers - Hurry up!</p>
              </div>
              <div className="text-center">
                <div className="text-sm mb-1">Ends in</div>
                <div className="flex gap-2">
                  <div className="bg-white text-orange-600 px-3 py-2 rounded font-bold">12</div>
                  <div className="text-2xl">:</div>
                  <div className="bg-white text-orange-600 px-3 py-2 rounded font-bold">34</div>
                  <div className="text-2xl">:</div>
                  <div className="bg-white text-orange-600 px-3 py-2 rounded font-bold">56</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Electronics Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">📱 Electronics</h2>
            <a href="/category/Electronics" className="text-orange-600 hover:text-orange-700 font-semibold">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {electronics.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Fashion Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">👕 Fashion</h2>
            <a href="/category/Fashion" className="text-orange-600 hover:text-orange-700 font-semibold">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fashion.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Home & Garden Section */}
        {homeGarden.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">🏠 Home & Garden</h2>
              <a href="/category/Home%20%26%20Garden" className="text-orange-600 hover:text-orange-700 font-semibold">
                View All →
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {homeGarden.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🔥 Trending Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.slice(0, 15).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Track Order</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">About Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Company Info</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Shop</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Electronics</a></li>
                <li><a href="#" className="hover:text-white">Fashion</a></li>
                <li><a href="#" className="hover:text-white">Home & Garden</a></li>
                <li><a href="#" className="hover:text-white">Sports</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-2xl hover:text-orange-500">📘</a>
                <a href="#" className="text-2xl hover:text-orange-500">📷</a>
                <a href="#" className="text-2xl hover:text-orange-500">🐦</a>
                <a href="#" className="text-2xl hover:text-orange-500">📺</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 MadaMarket. All rights reserved. Built with Next.js & Microservices.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
