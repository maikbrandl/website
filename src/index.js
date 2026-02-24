export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test
    if (url.pathname === "/") {
      return new Response("Decap OAuth Proxy OK", { status: 200 });
    }

    // Start OAuth
    if (url.pathname === "/auth") {
      const redirect = new URL("https://github.com/login/oauth/authorize");
      redirect.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      redirect.searchParams.set("redirect_uri", env.OAUTH_CALLBACK_URL);
      redirect.searchParams.set("scope", "repo");

      return Response.redirect(redirect.toString(), 302);
    }

    // OAuth callback -> token exchange
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.OAUTH_CALLBACK_URL
        })
      });

      const tokenJson = await tokenRes.json();
      if (!tokenJson.access_token) return new Response("No access token", { status: 400 });

      return new Response(JSON.stringify({ token: tokenJson.access_token, provider: "github" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
