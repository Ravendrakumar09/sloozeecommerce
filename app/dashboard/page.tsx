'use client';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { Product } from '../types/product';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
  });
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#f9fafb' : '#1f2937';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const parsedProducts = await response.json();
        setProducts(parsedProducts);
        
        const totalValue = parsedProducts.reduce((sum: number, p: Product) => sum + (p.price * p.quantity), 0);
        const lowStock = parsedProducts.filter((p: Product) => p.quantity < 10).length;
        
        setStats({
          totalProducts: parsedProducts.length,
          totalValue,
          lowStock,
        });
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

  // Prepare data for pie chart (products by category)
  const categoryData = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value,
    }));
  }, [products]);

  // Prepare data for bar chart (top products by total value)
  const topProductsData = useMemo(() => {
    return products
      .map(product => ({
        name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
        fullName: product.name,
        value: product.price * product.quantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [products]);

  // Colors for charts
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

  return (
    <ProtectedRoute allowedRoles={['manager']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Welcome, {user?.name}! Here's an overview of your commodities.
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Products
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.totalProducts}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Total Value
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          Low Stock Items
                        </dt>
                        <dd className="text-lg font-medium text-gray-900 dark:text-white">
                          {stats.lowStock}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {products.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart - Products by Category */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Products by Category
                    </h3>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                              borderRadius: '8px',
                              color: textColor,
                            }}
                            itemStyle={{ color: textColor }}
                          />
                          <Legend 
                            wrapperStyle={{ color: textColor }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No category data available</p>
                    )}
                  </div>
                </div>

                {/* Bar Chart - Top Products by Value */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Top Products by Total Value
                    </h3>
                    {topProductsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProductsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fill: isDark ? '#9ca3af' : '#4b5563' }}
                          />
                          <YAxis 
                            tick={{ fill: isDark ? '#9ca3af' : '#4b5563' }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            formatter={(value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            contentStyle={{
                              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                              borderRadius: '8px',
                              color: textColor,
                            }}
                            itemStyle={{ color: textColor }}
                          />
                          <Legend 
                            wrapperStyle={{ color: textColor }}
                          />
                          <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No product data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Products
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.slice(0, 5).map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {product.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              ${product.price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

