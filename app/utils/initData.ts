import { Product } from '../types/product';

export function initializeDummyProducts() {
  const storedProducts = localStorage.getItem('products');
  
  // Only initialize if no products exist
  if (!storedProducts || JSON.parse(storedProducts).length === 0) {
    const dummyProducts: Product[] = [
      {
        id: '1',
        name: 'Premium Coffee Beans',
        description: 'High-quality Arabica coffee beans sourced from Colombia. Perfect for espresso and filter coffee.',
        price: 24.99,
        quantity: 150,
        category: 'Beverages',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString(),
      },
      {
        id: '2',
        name: 'Organic Wheat Flour',
        description: '100% organic whole wheat flour, stone-ground for superior texture and flavor.',
        price: 8.50,
        quantity: 45,
        category: 'Food Items',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
      },
      {
        id: '3',
        name: 'Cotton T-Shirts',
        description: 'Comfortable 100% cotton t-shirts available in multiple colors and sizes.',
        price: 15.99,
        quantity: 8,
        category: 'Clothing',
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString(),
      },
      {
        id: '4',
        name: 'LED Desk Lamp',
        description: 'Energy-efficient LED desk lamp with adjustable brightness and color temperature.',
        price: 45.00,
        quantity: 25,
        category: 'Electronics',
        createdAt: new Date('2024-02-05').toISOString(),
        updatedAt: new Date('2024-02-05').toISOString(),
      },
      {
        id: '5',
        name: 'Olive Oil - Extra Virgin',
        description: 'Premium extra virgin olive oil from Mediterranean olives. Cold-pressed and unfiltered.',
        price: 18.75,
        quantity: 30,
        category: 'Food Items',
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-02-10').toISOString(),
      },
      {
        id: '6',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with long battery life and precise tracking.',
        price: 29.99,
        quantity: 5,
        category: 'Electronics',
        createdAt: new Date('2024-02-12').toISOString(),
        updatedAt: new Date('2024-02-12').toISOString(),
      },
      {
        id: '7',
        name: 'Honey - Raw & Unfiltered',
        description: 'Pure raw honey collected from local beekeepers. No additives or processing.',
        price: 12.50,
        quantity: 20,
        category: 'Food Items',
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString(),
      },
      {
        id: '8',
        name: 'Denim Jeans',
        description: 'Classic fit denim jeans with stretch for comfort. Available in various sizes.',
        price: 49.99,
        quantity: 12,
        category: 'Clothing',
        createdAt: new Date('2024-02-18').toISOString(),
        updatedAt: new Date('2024-02-18').toISOString(),
      },
      {
        id: '9',
        name: 'Green Tea - Jasmine',
        description: 'Fragrant jasmine green tea with delicate floral notes. Loose leaf premium quality.',
        price: 14.25,
        quantity: 35,
        category: 'Beverages',
        createdAt: new Date('2024-02-20').toISOString(),
        updatedAt: new Date('2024-02-20').toISOString(),
      },
      {
        id: '10',
        name: 'USB-C Cable',
        description: 'Fast charging USB-C cable, 6 feet long with data transfer support.',
        price: 9.99,
        quantity: 3,
        category: 'Electronics',
        createdAt: new Date('2024-02-22').toISOString(),
        updatedAt: new Date('2024-02-22').toISOString(),
      },
    ];

    localStorage.setItem('products', JSON.stringify(dummyProducts));
  }
}

