'use client';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types/product';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to load products:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    // Listen for custom event (when products are added/edited)
    const handleProductsUpdate = () => {
      loadProducts();
    };
    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                All Products
              </h1>
              <Link
                href="/products/add"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add New Product
              </Link>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {products.length === 0 ? 'No products yet. Add your first product!' : 'No products match your search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          product.quantity < 10
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {product.quantity} in stock
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="mt-4 block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Edit Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

