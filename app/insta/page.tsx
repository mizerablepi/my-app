import React from "react";

const INSTAGRAM_OAUTH_URL =
  "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=2654704444876350&redirect_uri=https://api-accounts.afbex.com/stage/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";

export default function InstaLoginPage() {
  const handleLogin = () => {
    window.location.href = INSTAGRAM_OAUTH_URL;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 40,
      }}
    >
      <h1>Instagram OAuth Login</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#3897f0",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Login with Instagram
      </button>
    </div>
  );
}
