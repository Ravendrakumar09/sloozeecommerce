import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/products - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // Transform the data to match the Product interface
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      quantity: product.quantity,
      category: product.category,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));
    
    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, description, price, quantity, category } = body;
    
    // Validation
    if (!name || !description || price === undefined || quantity === undefined || !category) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }
    
    // Insert the product
    // Note: created_by is optional - only include if the column exists in your table
    const insertData: any = {
      name,
      description,
      price,
      quantity,
      category,
    };
    
    // Don't include created_by for now since the column might not exist
    // Uncomment below if you've added the created_by column to your table
    // if (user?.id) {
    //   insertData.created_by = user.id;
    // }
    
    const { data: product, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Return more detailed error message
      return NextResponse.json(
        { 
          error: error.message || 'Failed to create product',
          code: error.code,
          details: error.details || error.hint || 'No additional details available'
        },
        { status: 500 }
      );
    }
    
    // Transform the response to match the Product interface
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      quantity: product.quantity,
      category: product.category,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
    
    return NextResponse.json(transformedProduct, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

