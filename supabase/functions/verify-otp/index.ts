
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // TODO: Integrate Twilio OTP verify here.
    // const verifyResult = await verifyTwilioOtp(mobile, otp);
    // For demo, assume OTP 123456 or 1234 is always valid
    if (otp === "123456" || otp === "1234") {
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: false, error: "Invalid OTP" }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: `${err}` }), { status: 500, headers: corsHeaders });
  }
});
