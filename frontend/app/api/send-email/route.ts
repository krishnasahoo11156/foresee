import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, subject, text, userName } = await request.json();

    // Print styled email output to Next.js server console terminal
    console.log("\n==================================================");
    console.log("📨 FORESEE EMAIL DISPATCHER ENGINE");
    console.log("==================================================");
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`To:        ${to}`);
    console.log(`Recipient: ${userName}`);
    console.log(`Subject:   ${subject}`);
    console.log("------------------ MESSAGE BODY ------------------");
    console.log(text);
    console.log("==================================================\n");

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      // Call Resend REST API
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "ForeSee Risk Alert <onboarding@resend.dev>",
          to,
          subject,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #ef4444; margin-top: 0;">⚠️ ForeSee Critical Risk Alert</h2>
              <p>Hello <strong>${userName}</strong>,</p>
              <p>Our agent pipeline has identified a critical timeline threat in your active workspace schedule.</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155;">
                  <strong>Alert Details:</strong><br/>
                  ${text}
                </p>
              </div>
              <p><strong>Recommended Intervention:</strong></p>
              <p style="font-size: 13.5px; color: #475569;">
                Smart Scheduler suggests shifting lower-priority tasks to tomorrow morning and activating Quiet Hours immediately.
              </p>
              <p style="margin-top: 24px; font-size: 12.5px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                This alert was dispatched automatically from the ForeSee Orchestration engine.
              </p>
            </div>
          `
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Resend API failed:", errorText);
        return NextResponse.json({ success: false, error: "Resend API error", details: errorText });
      }

      const resData = await res.json();
      return NextResponse.json({ success: true, mode: "real", data: resData });
    }

    return NextResponse.json({ 
      success: true, 
      mode: "mock", 
      message: "Email successfully logged to console. Set RESEND_API_KEY env variable to send real emails." 
    });

  } catch (error: any) {
    console.error("Email API Handler Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
