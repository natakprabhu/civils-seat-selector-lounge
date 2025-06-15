
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeIndianMobileNumber(mobile: string): string | null {
  // Remove all non-digit chars, except leading +
  let cleaned = mobile.trim().replace(/[\s\-()]/g, "");

  // Allow plain 10-digit Indian numbers only if they start with 6-9
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return "+91" + cleaned;
  }
  // Allow 0-prefixed Indian numbers only if the second digit is 6-9
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return "+91" + cleaned.slice(1);
  }
  // Allow numbers already in +91 E.164 form
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  // Reject any number with a + but not +91
  if (/^\+\d+/.test(cleaned) && !cleaned.startsWith("+91")) {
    return null;
  }
  // Any other pattern is not valid for Indian mobile
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
