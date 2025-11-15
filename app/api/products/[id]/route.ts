import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET /api/products/[id] - Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
    
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;
    
    // Fetch the product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      console.error('Product ID:', productId);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Product not found', code: error.code },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { 
          error: error.message || 'Failed to fetch product',
          code: error.code,
          details: error.details || error.hint || 'No additional details'
        },
        { status: 500 }
      );
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
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
    
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
    
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;
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
    
    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .single();
    
    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Update the product
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        quantity,
        category,
      })
      .eq('id', productId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      console.error('Product ID:', productId);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: error.message || 'Failed to update product',
          code: error.code,
          details: error.details || error.hint || 'No additional details'
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
    
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product (optional)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
    
    // Handle both Promise and direct params (for Next.js 15+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const productId = resolvedParams.id;
    
    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

