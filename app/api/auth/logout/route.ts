import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Sign out from Supabase (this will automatically clear the session cookies via the server client)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out from Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      );
    }
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Explicitly clear all Supabase auth cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Find and clear Supabase auth cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
      if (projectRef) {
        // Clear the main auth cookie
        const cookieName = `sb-${projectRef}-auth-token`;
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        response.cookies.delete(cookieName);
      }
    }
    
    // Clear any other Supabase-related cookies
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-') && cookie.name.includes('auth')) {
        response.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        response.cookies.delete(cookie.name);
      }
    });
    
    return response;
  } catch (error) {
    console.error('Error in logout route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

