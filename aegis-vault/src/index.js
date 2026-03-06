export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    const url = new URL(request.url);

    if (request.method === "OPTIONS")
      return new Response(null, { headers: corsHeaders });

    // --- 1. CREATE LINK (POST) ---
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const { id, cipherText } = await request.json();

        // The New Hexadecimal WAF Rules
        const isValidId = /^[a-f0-9]{6}$/i.test(id);
        const isValidCipher = /^[a-f0-9]+:[a-f0-9]+$/i.test(cipherText);

        if (!isValidId || !isValidCipher || cipherText.length > 2000) {
          // If you see this specific error, you know the NEW worker is active
          return new Response("Hex WAF Blocked: Invalid format.", {
            status: 400,
            headers: corsHeaders,
          });
        }

        await env.AEGIS_LINKS.put(id, cipherText, { expirationTtl: 2592000 });
        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response("Server Exception", {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // --- 2. REDIRECT LINK (GET) ---
    if (request.method === "GET" && url.pathname !== "/") {
      const id = url.pathname.slice(1);

      if (!/^[a-f0-9]{6}$/i.test(id)) {
        return new Response("Invalid Link Format", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const cipherText = await env.AEGIS_LINKS.get(id);
      if (!cipherText)
        return new Response("AegisKit: Link expired or not found.", {
          status: 404,
          headers: corsHeaders,
        });

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Decrypting Vault Link...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { background: #0c0c0e; color: #fff; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .loader { border: 2px solid #222; border-top: 2px solid #ff3333; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-bottom: 1rem; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .container { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 400px; padding: 20px; }
          #msg { color: #888; font-size: 14px; margin-top: 10px; }
          #errorTrace { color: #ff4444; font-size: 12px; margin-top: 10px; font-family: monospace; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loader" id="loader"></div>
          <div id="msg">Aegis Protocol Active<br>Decrypting payload...</div>
          <div id="errorTrace"></div>
        </div>
        <script>
          async function decrypt() {
            try {
              const passcode = window.location.hash.substring(1);
              if(!passcode) throw new Error("Missing decryption key in URL hash.");

              const hex2buf = (hex) => {
                const bytes = new Uint8Array(hex.length / 2);
                for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
                return bytes.buffer;
              };

              const parts = "${cipherText}".split(':');
              if(parts.length !== 2) throw new Error("Corrupted payload structure.");

              const passBytes = new TextEncoder().encode(passcode);
              const keyHash = await crypto.subtle.digest("SHA-256", passBytes);
              const key = await crypto.subtle.importKey("raw", keyHash, { name: "AES-GCM" }, false, ["decrypt"]);

              const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(hex2buf(parts[0])) }, key, hex2buf(parts[1]));
              const targetUrl = new TextDecoder().decode(decrypted);

              if(!targetUrl.startsWith("http")) throw new Error("Decrypted string is not a valid URL.");

              window.location.replace(targetUrl);
            } catch(e) {
              document.getElementById('loader').style.display = 'none';
              document.getElementById('msg').innerHTML = "<b>Decryption Failed</b><br>The key is invalid or the link is broken.";
              document.getElementById('errorTrace').innerText = "[" + e.name + "] " + e.message;
            }
          }
          decrypt();
        </script>
      </body>
      </html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8", ...corsHeaders },
      });
    }
    return new Response("AegisKit Vault Active", {
      status: 200,
      headers: corsHeaders,
    });
  },
};
