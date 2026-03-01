export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test
    if (url.pathname === "/") {
      return new Response("Decap OAuth Proxy OK", { status: 200 });
    }

    // Start OAuth
    if (url.pathname === "/auth") {
      const provider = url.searchParams.get("provider");
      if (provider && provider !== "github") {
        return new Response("Invalid provider", { status: 400 });
      }

      const redirect = new URL("https://github.com/login/oauth/authorize");
      redirect.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      redirect.searchParams.set("redirect_uri", env.OAUTH_CALLBACK_URL);
      redirect.searchParams.set("scope", "repo");

      return Response.redirect(redirect.toString(), 302);
    }

    function callbackScriptResponse(status, token) {
      return new Response(
        `
<html>
  <head>
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify({ token: token || "" })}',
          '*'
        );
        window.removeEventListener("message", receiveMessage, false);
      };
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
  </head>
  <body>
    <p>Authorizing Decap...</p>
  </body>
</html>
`,
        {
          headers: {
            "Content-Type": "text/html",
            // Keep opener relation for Decap popup callback handoff.
            "Cross-Origin-Opener-Policy": "unsafe-none",
            "Cross-Origin-Embedder-Policy": "unsafe-none"
          }
        }
      );
    }

    // OAuth callback -> token exchange
    if (url.pathname === "/callback") {
      const provider = url.searchParams.get("provider");
      if (provider && provider !== "github") {
        return new Response("Invalid provider", { status: 400 });
      }

      const code = url.searchParams.get("code");
      if (!code) return callbackScriptResponse("error", "");

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
      if (!tokenJson.access_token) return callbackScriptResponse("error", "");

      return callbackScriptResponse("success", tokenJson.access_token);
    }

    return new Response("Not found", { status: 404 });
  }
};
