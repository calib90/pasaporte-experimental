const SHEETS_URL = "https://script.google.com/macros/s/AKfycbyObGX3kik12Bo3_79WAlYsDXpZ1zfX_43mdrFp8aFYyWxkHUVQYap6Jm573SCnDfnQhA/exec";

exports.handler = async function(event) {
  try {
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch(e) {}

    // Build query string from body params for Apps Script GET
    const params = new URLSearchParams(body);
    const targetURL = SHEETS_URL + "?" + params.toString();

    const response = await fetch(targetURL, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const text = await response.text();
    let json = text.trim();
    if (!json.startsWith("{") && !json.startsWith("[")) {
      const s = json.indexOf("("), e = json.lastIndexOf(")");
      if (s !== -1 && e !== -1 && s < e) json = json.slice(s+1, e).trim();
    }
    try { JSON.parse(json); } catch(e) { json = JSON.stringify({error:"Bad response: "+text.slice(0,100)}); }

    return {
      statusCode: 200,
      headers: {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},
      body: json
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({error:"Proxy error: "+err.message})
    };
  }
};
