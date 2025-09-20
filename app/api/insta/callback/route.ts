import { NextRequest, NextResponse } from "next/server";

const FB_APP_ID = process.env.FB_APP_ID!;
const FB_APP_SECRET = process.env.FB_APP_SECRET!;
const REDIRECT_URI =
  process.env.INSTAGRAM_REDIRECT_URI ||
  "https://my-app-iota-ecru.vercel.app/api/insta/callback";

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
    // 1️⃣ Exchange code for short-lived access token (Instagram Basic Display)
    const tokenRes = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: FB_APP_ID,
          client_secret: FB_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          code,
        }),
      }
    );

    console.log("tokenRes status:", tokenRes.status);
    const tokenData = await tokenRes.json();
    console.log("tokenData:", tokenData);

    if (!tokenRes.ok) {
      return NextResponse.json(
        { success: false, error: tokenData },
        { status: 400 }
      );
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // 2️⃣ Exchange for long-lived token (Instagram Basic Display)
    const longTokenRes = await fetch(
      `https://graph.instagram.com/access_token?` +
        new URLSearchParams({
          grant_type: "ig_exchange_token",
          client_secret: FB_APP_SECRET,
          access_token: shortLivedToken,
        }),
      { method: "GET" }
    );

    const longTokenData = await longTokenRes.json();
    console.log("longTokenData:", longTokenData);

    if (!longTokenRes.ok) {
      return NextResponse.json(
        { success: false, error: longTokenData },
        { status: 400 }
      );
    }

    const longLivedToken = longTokenData.access_token;
    const expiresIn = longTokenData.expires_in;

    // 3️⃣ Get user's basic profile info
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedToken}`,
      { method: "GET" }
    );

    const profileData = await profileRes.json();
    console.log("profileData:", profileData);

    // Store the token securely in your database here
    // const user = await saveUserToken(userId, longLivedToken, expiresIn);

    return NextResponse.json({
      success: true,
      token: longLivedToken,
      expiresIn,
      user: profileData,
      message: "Successfully authenticated with Instagram",
    });
  } catch (err: any) {
    console.error("OAuth error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
