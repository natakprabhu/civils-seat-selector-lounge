
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
    const { mobile } = await req.json();
    if (!mobile) {
      return new Response(JSON.stringify({ error: "Mobile is required" }), { status: 400, headers: corsHeaders });
    }

    // TODO: Integrate Twilio SMS send here.
    // const sendResult = await sendTwilioOtp(mobile);
    // For demo, mock success
    console.log("Sending OTP to", mobile);

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: `${err}` }), { status: 500, headers: corsHeaders });
  }
});
