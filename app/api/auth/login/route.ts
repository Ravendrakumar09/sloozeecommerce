import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign in with Supabase (login only, no signup)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get role from database (user_roles table) - this is the authoritative source
    let { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role, name')
      .eq('id', data.user.id)
      .single();

    // If role doesn't exist in database, create it with default 'storekeeper' role
    if (!userRoleData) {
      const { data: newUserRole, error: insertError } = await supabase
        .from('user_roles')
        .insert({
          id: data.user.id,
          email: data.user.email || email,
          role: 'storekeeper', // Default to storekeeper
          name: data.user.user_metadata?.name || email.split('@')[0],
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user role:', insertError);
        // Continue with fallback
        userRoleData = null;
      } else {
        userRoleData = newUserRole;
      }
    }

    // Default to 'storekeeper' if no role found
    const userRole = userRoleData?.role || 'storekeeper';
    const userName = userRoleData?.name || data.user?.user_metadata?.name || email.split('@')[0];

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: userRole, // Use role from database, not from request
        name: userName,
      },
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

