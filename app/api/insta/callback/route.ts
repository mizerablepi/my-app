import { NextRequest, NextResponse } from "next/server";

const FB_APP_ID = process.env.FB_APP_ID!;
const FB_APP_SECRET = process.env.FB_APP_SECRET!;
// e.g. "https://yourdomain.com/api/insta/callback"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json(
      { success: false, error: "Missing code" },
      { status: 400 }
    );
  }

  try {
    // 1️⃣ Exchange code for short-lived access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: "2654704444876350",
          client_secret: "bd9ee66fb075944241df30120120d00d",
          redirect_uri: "https://api-accounts.afbex.com/stage/",
          code,
        }),
      { method: "GET" }
    );

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { success: false, error: tokenData },
        { status: 400 }
      );
    }

    const shortLivedToken = tokenData.access_token;

    // 2️⃣ Exchange for long-lived token
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        }),
      { method: "GET" }
    );

    const longTokenData = await longTokenRes.json();

    if (!longTokenRes.ok) {
      return NextResponse.json(
        { success: false, error: longTokenData },
        { status: 400 }
      );
    }

    const longLivedToken = longTokenData.access_token;

    // 3️⃣ (Optional) Get Instagram Business Account ID
    // First, get user’s Facebook Pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${longLivedToken}`,
      { method: "GET" }
    );
    const pagesData = await pagesRes.json();

    // Each page may have an instagram_business_account field
    // You’d store longLivedToken + page/IG IDs in DB

    return NextResponse.json({
      success: true,
      token: longLivedToken,
      pages: pagesData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
