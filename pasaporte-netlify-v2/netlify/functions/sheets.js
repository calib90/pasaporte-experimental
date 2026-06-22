const SHEETS_URL = "https://script.google.com/macros/s/AKfycbyU1YUcVYa7QNTwdSMQPUw6T49j7kubvJVnIqt9-zwm4hURjUgr5sLRGRQL4TaW7d8mSw/exec";

exports.handler = async function(event) {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const targetURL = SHEETS_URL + "?" + params.toString();

    const response = await fetch(targetURL, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const text = await response.text();

    // Strip JSONP wrapper only if response starts with a function call
    // e.g. _cb_123({...}); -> {...}
    // Plain JSON starts with { or [ — leave it alone
    let json = text.trim();
    if (!json.startsWith("{") && !json.startsWith("[")) {
      const parenStart = json.indexOf("(");
      const parenEnd   = json.lastIndexOf(")");
      if (parenStart !== -1 && parenEnd !== -1 && parenStart < parenEnd) {
        json = json.slice(parenStart + 1, parenEnd).trim();
      }
    }

    // Validate it's JSON before returning
    try {
      JSON.parse(json);
    } catch(parseErr) {
      console.error("Could not parse as JSON:", json.slice(0, 200));
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Bad response from Apps Script: " + text.slice(0, 100) }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: json,
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Proxy error: " + err.message }),
    };
  }
};
