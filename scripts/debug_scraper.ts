
import * as cheerio from "cheerio";

const LEAGUE_URL = "https://live.centrosportivoitaliano.it/25/Calcio-a-7/Lombardia/Bergamo/C105/?j=NEU9REZIJjRGPVBOSyY0Rz1FREkmNEg9RCY0ST1RICY0TD1ERkgmNDI9ZQ==";
const TEAM_NAME_CSI = "Uso Sforzatica G";

async function debugScraper() {
    console.log("Fetching URL:", LEAGUE_URL);
    const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        const res = await fetch(LEAGUE_URL, { headers });
        const html = await res.text();
        const $ = cheerio.load(html);

        console.log("Page Title:", $("title").text());

        const matchElements = $(".row-card a.btn-gara");
        console.log(`Found ${matchElements.length} match elements.`);

        let targetMatchUrl = "";

        matchElements.each((i, el) => {
            const text = $(el).text();
            if (!text.includes(TEAM_NAME_CSI)) return;

            console.log(`\n--- Match ${i} ---`);
            const dateStr = $(el).find("div.d-flex.flex-column").first().find("span").first().text().trim();
            console.log("Date:", dateStr);

            // Log structure for inspection
            const rowCard = $(el).closest(".row-card");
            if (i < 3) {
                console.log(`\n!!! MATCH ${i} Structure !!!`);
                console.log("Text content:", rowCard.text().replace(/\s+/g, ' ').trim());
            }

            // Check if there is ANY element with a number-number pattern
            const cardText = rowCard.text();
            const scoreMatch = cardText.match(/\d+\s*-\s*\d+/);
            if (scoreMatch) {
                console.log(`POSSIBLE SCORE FOUND in Text (Match ${i}): "${scoreMatch[0]}"`);
            }

            if (i === 45) { // 29/11/25 Match
                console.log(`\n!!! MATCH ${i} Found (Target for Deep Dive) !!!`);
                const href = $(el).attr("href");
                if (href) {
                    targetMatchUrl = href.startsWith("http") ? href : `https://live.centrosportivoitaliano.it${href}`;
                }
            }
        });

        if (targetMatchUrl) {
            console.log("\n!!! FETCHING DETAIL URL:", targetMatchUrl);

            const detailRes = await fetch(targetMatchUrl, { headers });
            const detailHtml = await detailRes.text();
            const $d = cheerio.load(detailHtml);

            console.log("Detail Page Title:", $d("title").text());

            // 1. Inspect Stats Table Container
            console.log("\n--- STATS CONTAINER INSPECTION ---");
            const matchesGiocati = $d("*:contains('Matches giocati')").last();
            if (matchesGiocati.length) {
                // Go up 3-4 levels to find the container
                const container = matchesGiocati.parent().parent().parent().parent();
                console.log("Stats Container HTML (approx):");
                console.log(container.html()?.substring(0, 1500));
            }

            // 2. Inspect Timeline Container
            console.log("\n--- TIMELINE CONTAINER INSPECTION ---");
            const endHeader = $d("*:contains('Fine 7 - 3')").last();
            if (endHeader.length) {
                const timelineContainer = endHeader.parent().parent().parent(); // Go upwards
                console.log("Timeline Container HTML (approx):");
                console.log(timelineContainer.html()?.substring(0, 2000));
            } else {
                // Try finding "Fine primo tempo"
                const halfTime = $d("*:contains('Fine primo tempo')").last();
                if (halfTime.length) {
                    console.log("Found 'Fine primo tempo'. dumping context:");
                    console.log(halfTime.parent().parent().parent().html()?.substring(0, 1000));
                }
            }
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debugScraper();
