-- Insert sample products into the products table
-- This script will insert at least 5 products for each category

-- Clear existing products (optional - comment out if you want to keep existing data)
-- DELETE FROM public.products;

-- Insert Electronics products (5+ products)
INSERT INTO public.products (name, description, price, quantity, category) VALUES
('Premium Coffee Beans', 'High-quality Arabica coffee beans sourced from Colombia. Perfect for espresso and filter coffee.', 24.99, 150, 'Beverages'),
('Organic Wheat Flour', '100% organic whole wheat flour, stone-ground for superior texture and flavor.', 8.50, 45, 'Food Items'),
('Cotton T-Shirts', 'Comfortable 100% cotton t-shirts available in multiple colors and sizes.', 15.99, 8, 'Clothing'),
('LED Desk Lamp', 'Energy-efficient LED desk lamp with adjustable brightness and color temperature.', 45.00, 25, 'Electronics'),
('Olive Oil - Extra Virgin', 'Premium extra virgin olive oil from Mediterranean groves. Cold-pressed for maximum flavor.', 18.75, 30, 'Food Items'),
('Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life.', 199.99, 12, 'Electronics'),
('Smartphone - Latest Model', 'Latest generation smartphone with advanced camera and 5G connectivity.', 899.99, 8, 'Electronics'),
('Laptop - High Performance', 'Professional laptop with 16GB RAM, 512GB SSD, and high-resolution display.', 1299.99, 5, 'Electronics'),
('Tablet - 10 inch Display', 'Versatile tablet perfect for work and entertainment with long battery life.', 449.99, 15, 'Electronics'),
('Smart Watch', 'Feature-rich smartwatch with health tracking and notification support.', 299.99, 20, 'Electronics'),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking and long battery life.', 29.99, 50, 'Electronics'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with customizable keys.', 89.99, 18, 'Electronics'),
('USB-C Hub', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader.', 39.99, 35, 'Electronics'),
('Webcam HD', '1080p HD webcam with built-in microphone for video calls.', 59.99, 22, 'Electronics'),
('External SSD 1TB', 'Fast external SSD drive with USB 3.2 connectivity.', 129.99, 10, 'Electronics'),
('Green Tea - Organic', 'Premium organic green tea leaves, rich in antioxidants.', 12.99, 80, 'Beverages'),
('Black Tea - Assam', 'Strong and malty black tea from Assam region, perfect for morning.', 9.99, 60, 'Beverages'),
('Herbal Tea Collection', 'Assorted herbal teas including chamomile, peppermint, and ginger.', 15.99, 40, 'Beverages'),
('Fresh Orange Juice', '100% pure fresh orange juice, no added sugar or preservatives.', 6.99, 100, 'Beverages'),
('Coffee Pods - Variety Pack', 'Assorted coffee pods compatible with popular coffee machines.', 19.99, 200, 'Beverages'),
('Energy Drink - Natural', 'Natural energy drink with vitamins and no artificial colors.', 3.99, 150, 'Beverages'),
('Sparkling Water - 12 Pack', 'Premium sparkling water in convenient 12-pack bottles.', 8.99, 75, 'Beverages'),
('Protein Shake - Chocolate', 'High-protein chocolate shake, perfect for post-workout recovery.', 4.99, 90, 'Beverages'),
('Organic Honey', 'Pure organic honey from local beekeepers, unfiltered and raw.', 14.99, 35, 'Food Items'),
('Quinoa - Organic', 'Premium organic quinoa, high in protein and essential amino acids.', 11.99, 55, 'Food Items'),
('Brown Rice - 5lb Bag', 'Organic brown rice, whole grain and nutritious.', 7.99, 70, 'Food Items'),
('Pasta - Whole Wheat', '100% whole wheat pasta, high in fiber and protein.', 4.99, 120, 'Food Items'),
('Tomato Sauce - Organic', 'Organic tomato sauce made from fresh tomatoes, no preservatives.', 5.99, 85, 'Food Items'),
('Canned Beans - Black', 'Organic black beans, ready to eat, high in protein.', 3.99, 95, 'Food Items'),
('Almonds - Raw', 'Raw organic almonds, great for snacking and cooking.', 12.99, 45, 'Food Items'),
('Dark Chocolate - 70% Cocoa', 'Premium dark chocolate with 70% cocoa content, rich and smooth.', 8.99, 60, 'Food Items'),
('Granola Bars - Variety', 'Healthy granola bars with nuts and dried fruits.', 6.99, 110, 'Food Items'),
('Jeans - Classic Fit', 'Classic fit denim jeans, comfortable and durable.', 49.99, 25, 'Clothing'),
('Hoodie - Cotton Blend', 'Warm and comfortable cotton blend hoodie, perfect for casual wear.', 39.99, 30, 'Clothing'),
('Running Shoes', 'Lightweight running shoes with cushioned sole and breathable mesh.', 79.99, 15, 'Clothing'),
('Winter Jacket', 'Warm winter jacket with water-resistant outer shell.', 89.99, 12, 'Clothing'),
('Baseball Cap', 'Adjustable baseball cap with embroidered logo.', 19.99, 50, 'Clothing'),
('Socks - Pack of 6', 'Comfortable cotton socks, pack of 6 pairs in assorted colors.', 12.99, 80, 'Clothing'),
('Belt - Genuine Leather', 'Classic genuine leather belt with adjustable buckle.', 29.99, 35, 'Clothing'),
('Backpack - Laptop Compatible', 'Durable backpack with padded laptop compartment and multiple pockets.', 59.99, 20, 'Clothing'),
('Sunglasses - UV Protection', 'Stylish sunglasses with 100% UV protection and polarized lenses.', 34.99, 28, 'Clothing'),
('Scarf - Wool Blend', 'Soft wool blend scarf, perfect for cold weather.', 24.99, 40, 'Clothing');

-- Verify the insert
SELECT 
  category, 
  COUNT(*) as product_count 
FROM public.products 
GROUP BY category 
ORDER BY category;

