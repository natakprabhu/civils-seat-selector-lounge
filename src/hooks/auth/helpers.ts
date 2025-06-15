
// Utility and helper functions for Auth

export function randomPassword(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|";
  let result = '';
  for (let i = 0; i < length; ++i) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

export const SUPABASE_FUNCTIONS_BASE = "https://llvujxdmzuyebkzuutqn.functions.supabase.co";
