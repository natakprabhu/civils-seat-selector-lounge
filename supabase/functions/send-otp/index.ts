
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeIndianMobileNumber(mobile: string): string | null {
  // Remove all non-digit chars, except lead +
  let cleaned = mobile.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+91") && cleaned.length === 13) {
    return cleaned;
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    // e.g. 09220740805 -> +919220740805
    return "+91" + cleaned.slice(1);
  }
  if (/^\d{10}$/.test(cleaned)) {
    // Plain 10-digit mobile
    return "+91" + cleaned;
  }
  if (/^\+91\d{10}$/.test(cleaned)) {
    return cleaned;
  }
  // If they paste a + number that's not +91 (e.g. +92 for Pakistan), reject it
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile } = await req.json();
    if (!mobile) {
      return new Response(JSON.stringify({ error: "Mobile is required" }), { status: 400, headers: corsHeaders });
    }

    const normalized = normalizeIndianMobileNumber(mobile);
    if (!normalized) {
      return new Response(JSON.stringify({ error: "Please enter a valid Indian (+91) 10-digit mobile number." }), { status: 400, headers: corsHeaders });
    }

    // Get Twilio secrets
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const verifySid = Deno.env.get("TWILIO_VERIFY_SID");

    if (!accountSid || !authToken || !verifySid) {
      return new Response(JSON.stringify({ error: "Twilio secret(s) missing" }), { status: 500, headers: corsHeaders });
    }

    // Send verification request to Twilio
    const payload = new URLSearchParams({
      To: normalized,
      Channel: "sms"
    }).toString();

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.message || "Twilio send failed" }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: `${err}` }), { status: 500, headers: corsHeaders });
  }
});
