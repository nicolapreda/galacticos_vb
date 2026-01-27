const fs = require('fs');

async function testFetch() {
  const url = "https://live.centrosportivoitaliano.it/25/Calcio-a-7/Lombardia/Bergamo/C105/?j=NEU9REZIJjRGPVBOSyY0Rz1FREkmNEg9RCY0ST1RICY0TD1ERkgmNDI9ZQ==";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Length:", text.length);
    fs.writeFileSync('node_page_dump.html', text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testFetch();
