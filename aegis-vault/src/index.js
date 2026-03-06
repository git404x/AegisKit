export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS")
      return new Response(null, { headers: corsHeaders });

    // --- 1. CREATE LINK (POST) ---
    if (request.method === "POST" && url.pathname === "/api/create") {
      try {
        const { id, cipherText } = await request.json();
        const isValidId = /^[a-z0-9]{4,6}$/i.test(id);
        const isValidCipher = /^[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+?$/.test(
          cipherText,
        );

        if (!isValidId || !isValidCipher || cipherText.length > 2000) {
          return new Response("Invalid payload", {
            status: 400,
            headers: corsHeaders,
          });
        }

        await env.AEGIS_LINKS.put(id, cipherText, { expirationTtl: 2592000 });
        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response("Bad Request", {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    // --- 2. REDIRECT LINK (GET) ---
    if (request.method === "GET" && url.pathname !== "/") {
      const id = url.pathname.slice(1);
      if (id.length > 6) return new Response("Invalid Link", { status: 400 });

      const cipherText = await env.AEGIS_LINKS.get(id);
      if (!cipherText)
        return new Response("AegisKit: Link expired or not found.", {
          status: 404,
        });

      // The Hardened Decryption Engine
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
          #errorTrace { color: #ff4444; font-size: 12px; margin-top: 10px; word-break: break-all; font-family: monospace; }
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

              // CRITICAL FIX: Memory-safe binary conversion without Spread Operators
              const base64ToBuffer = (b64) => {
                let padded = b64.replace(/-/g, '+').replace(/_/g, '/');
                while (padded.length % 4 !== 0) padded += '=';
                const bin = atob(padded);
                const bytes = new Uint8Array(bin.length);
                for(let i = 0; i < bin.length; i++) {
                  bytes[i] = bin.charCodeAt(i);
                }
                return bytes.buffer;
              };

              // 1. Extract IV and Ciphertext
              const [ivB64, cipherB64] = "${cipherText}".split('.');
              if(!ivB64 || !cipherB64) throw new Error("Corrupted payload structure.");

              const iv = base64ToBuffer(ivB64);
              const cipher = base64ToBuffer(cipherB64);

              // 2. Mathematically derive the 256-bit AES key from the URL hash
              const passBytes = new TextEncoder().encode(passcode);
              const keyHash = await crypto.subtle.digest("SHA-256", passBytes);
              const key = await crypto.subtle.importKey("raw", keyHash, { name: "AES-GCM" }, false, ["decrypt"]);

              // 3. Decrypt and execute redirect
              const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, cipher);
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
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }
    return new Response("AegisKit Vault Active", { status: 200 });
  },
};
