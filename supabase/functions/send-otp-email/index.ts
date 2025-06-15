
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function generateOtp(length = 6) {
  return Array.from({ length })
    .map(() => Math.floor(Math.random() * 10))
    .join("");
}

const corsOrigin = Deno.env.get("CORS_ORIGIN") || "";
const corsHeaders = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const otp = generateOtp();

    // Store OTP in pending_otps (upsert so re-registering overwrites prior OTP)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const { createClient } = await import("npm:@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from("pending_otps")
      .upsert([
        {
          email,
          otp,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
      ]);

    // Send email with OTP
    const result = await resend.emails.send({
      from: "Library <onboarding@resend.dev>",
      to: [email],
      subject: "Your OTP for Library Registration",
      html: `<h2>Your OTP code is: <strong>${otp}</strong></h2>
      <p>This OTP is valid for 10 minutes.</p>`,
    });

    return new Response(
      JSON.stringify({ message: "OTP sent", result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      { status: 500, headers: corsHeaders }
    );
  }
});
