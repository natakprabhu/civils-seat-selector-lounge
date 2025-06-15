
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Enable CORS for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mobile, otp } = await req.json();
    if (!mobile || !otp) {
      return new Response(JSON.stringify({ error: "Mobile & OTP required" }), { status: 400, headers: corsHeaders });
    }

    // Get Twilio secrets
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const verifySid = Deno.env.get("TWILIO_VERIFY_SID");

    if (!accountSid || !authToken || !verifySid) {
      return new Response(JSON.stringify({ error: "Twilio secret(s) missing" }), { status: 500, headers: corsHeaders });
    }

    // Send verification check to Twilio
    const payload = new URLSearchParams({
      To: mobile.startsWith('+') ? mobile : `+91${mobile}`,
      Code: otp
    }).toString();

    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`,
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
      return new Response(JSON.stringify({ success: false, error: data.message || "Invalid OTP" }), { headers: corsHeaders });
    }

    // status: "approved" means OTP is valid
    if (data.status === "approved") {
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: false, error: "Invalid OTP" }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: `${err}` }), { status: 500, headers: corsHeaders });
  }
});
