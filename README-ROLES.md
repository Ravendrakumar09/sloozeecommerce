# User Role Management

## How Roles Are Determined

### Current Implementation (Demo/Development)
Currently, users can select their role during login. This is **NOT secure for production** and is only suitable for demos.

### Production-Ready Implementation

The role is determined from a database table (`user_roles`) that links to Supabase auth users.

## Setup Instructions

### 1. Create Database Schema

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL

This will create:
- `user_roles` table to store user roles
- Row Level Security policies
- Trigger to auto-create role entries when users sign up
- Helper function to get user roles

### 2. Assign Roles to Users

#### Option A: Via Supabase Dashboard (SQL Editor)
```sql
-- Make a user a manager
UPDATE public.user_roles 
SET role = 'manager' 
WHERE email = 'manager@example.com';

-- Make a user a storekeeper
UPDATE public.user_roles 
SET role = 'storekeeper' 
WHERE email = 'storekeeper@example.com';
```

#### Option B: Via API (Admin Endpoint)
Create an admin endpoint to assign roles (only accessible by admins).

#### Option C: Via Supabase Dashboard UI
1. Go to Authentication → Users
2. Find the user
3. Edit their metadata and add `role: 'manager'` or `role: 'storekeeper'`
4. The trigger will sync this to the `user_roles` table

### 3. How It Works

1. **User Signs Up/Logs In**: 
   - User authenticates with email/password
   - If new user, trigger creates entry in `user_roles` table
   - Role defaults to 'storekeeper' unless specified in metadata

2. **Role Retrieval**:
   - On login, API fetches role from `user_roles` table
   - Role is stored in session
   - Frontend uses role for access control

3. **Access Control**:
   - `ProtectedRoute` checks user role
   - Dashboard only accessible to managers
   - Products accessible to both roles

## Security Notes

- ✅ Roles are stored in database (authoritative source)
- ✅ Row Level Security prevents users from modifying their own roles
- ✅ Only service role can manage roles
- ❌ Users cannot self-assign roles (security risk removed)

## Testing

1. Create a user via login page
2. Assign role via SQL:
   ```sql
   UPDATE user_roles SET role = 'manager' WHERE email = 'your-email@example.com';
   ```
3. Logout and login again
4. User should have the assigned role

