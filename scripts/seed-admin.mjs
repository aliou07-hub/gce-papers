// Creates (or updates the password of) the admin account from
// ADMIN_USERNAME / ADMIN_PASSWORD in .env.local.
// Run with: npm run seed:admin
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
if (!username || !password) {
  console.error("Missing ADMIN_USERNAME / ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);
const password_hash = await bcrypt.hash(password, 10);

const { data: existing } = await supabase
  .from("admins")
  .select("id")
  .eq("username", username)
  .maybeSingle();

if (existing) {
  const { error } = await supabase
    .from("admins")
    .update({ password_hash })
    .eq("id", existing.id);
  if (error) throw error;
  console.log(`Updated password for admin "${username}".`);
} else {
  const { error } = await supabase.from("admins").insert({ username, password_hash });
  if (error) throw error;
  console.log(`Created admin "${username}".`);
}
