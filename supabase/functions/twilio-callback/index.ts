
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Parse Twilio payload (it can be form-encoded or JSON; handle both for flexibility)
  let payload: Record<string, any> = {};
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await req.json();
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await req.text();
    for (const kv of new URLSearchParams(body)) {
      payload[kv[0]] = kv[1];
    }
  }

  // Log for debugging - you can view from Supabase function logs
  console.log("Received Twilio webhook event:");
  console.log(payload);

  // You can add custom handling here (e.g., update user in DB, track OTP status, etc.)

  return new Response("Webhook received", {
    status: 200,
    headers: corsHeaders,
  });
});
