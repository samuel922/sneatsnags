# Admin Login Instructions

## Quick Setup

Since the application has user registration, you can create an admin user in two ways:

### Option 1: Create Admin via Registration (Recommended)

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Go to the registration page** in your frontend application (http://localhost:5173/register)

3. **Register with admin credentials:**
   - **Email:** `admin@sneatsnags.com`
   - **Password:** `admin123`
   - **First Name:** `Admin`
   - **Last Name:** `User`
   - **Role:** Select `Admin` (if available in dropdown) or `Buyer` initially

4. **Manual Database Update (if needed):**
   If the admin role isn't selectable during registration, you can update it manually:
   
   ```sql
   -- Connect to your database and run:
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@sneatsnags.com';
   ```

### Option 2: Direct Database Insert

If you have database access, you can insert an admin user directly:

```sql
-- Insert admin user (password is bcrypt hash of 'admin123')
INSERT INTO users (
  id, 
  email, 
  password, 
  "firstName", 
  "lastName", 
  role, 
  "isEmailVerified", 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'admin_' || generate_random_uuid(),
  'admin@sneatsnags.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXfs3S5/sJG6',
  'Admin',
  'User',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
);
```

### Option 3: Using the Backend API

You can make a POST request to create an admin user:

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sneatsnags.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

## Login Credentials

Once created, use these credentials to login as admin:

- **Email:** `admin@sneatsnags.com`
- **Password:** `admin123`

## Admin Access

After logging in as admin, you'll have access to:

1. **Admin Dashboard** - `/admin/dashboard`
   - Platform statistics and overview
   - Quick access to management tools

2. **User Management** - `/admin/users`
   - View and manage all users
   - User role assignments
   - User activity monitoring

3. **Event Management** - `/admin/events`
   - Create, edit, and manage events
   - Event analytics and reporting

4. **Transaction Management** - `/admin/transactions`
   - Monitor all platform transactions
   - Process refunds and disputes

5. **System Analytics** - `/admin/analytics`
   - Detailed platform analytics
   - Revenue and performance metrics

## Navigation

The admin will see additional menu items in the header navigation:
- Admin Dashboard
- Users Management
- Analytics
- Support
- Settings
- Activity Logs

## Security Notes

- **Change the default password** after first login
- The admin user has full access to all platform features
- Admin actions are logged for audit purposes
- Consider setting up two-factor authentication for production

## Troubleshooting

If you can't access admin features:

1. **Check user role in database:**
   ```sql
   SELECT email, role FROM users WHERE email = 'admin@sneatsnags.com';
   ```

2. **Verify authentication:**
   - Make sure you're logged in
   - Check that JWT token includes admin role
   - Clear browser cache/localStorage if needed

3. **Check backend logs:**
   - Look for authentication errors
   - Verify role-based access control is working

---

**Ready to use!** Your admin account provides full control over the SneatSnags platform.