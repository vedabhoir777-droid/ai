/*
# Seed Super Admin

## Summary
This migration provides instructions for creating the first super admin user.
After running the app and creating a user account via the signup page,
run the following SQL in the Supabase SQL Editor to promote that user to super_admin:

UPDATE profiles SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';

Alternatively, you can insert a profile directly if you've already created the auth user:
*/

-- Note: To create your first super admin, sign up normally through the app,
-- then run this query in Supabase SQL Editor (replace with your actual email):
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';