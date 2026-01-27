import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";

const LEAGUE_URL = "https://live.centrosportivoitaliano.it/25/Calcio-a-7/Lombardia/Bergamo/C105/?j=NEU9REZIJjRGPVBOSyY0Rz1FREkmNEg9RCY0ST1RICY0TD1ERkgmNDI9ZQ==";
const TEAM_NAME_CSI = "Uso Sforzatica G";
const TEAM_NAME_DISPLAY = "GALACTICOS VB";

export interface LeagueStanding {
    rank: number;
    team: string;
    logo: string;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    gs: number;
    dr: number;
}

export interface PlayerStats {
    rank: number;
    player: string;
    goals: number;
    team: string;
}

export interface NextMatch {
    date: string;
    time: string;
    opponent: string;
    location: string;
    isHome: boolean;
}

// ... existing interfaces
export interface CalendarMatch {
    id: string; // generated slug: YYYY-MM-DD-opponent
    date: string;
    time: string;
    datetime: Date; // Helper for sorting
    opponent: string;
    location: string;
    isHome: boolean;
    played: boolean;
    result?: string; // e.g., "5 - 3"
    csiUrl: string;
}

export interface LeagueData {
    standings: LeagueStanding[];
    topScorers: PlayerStats[];
    nextMatch: NextMatch | null;
    matches: CalendarMatch[];
}

async function scrapeLeagueDataInternal(): Promise<LeagueData> {
    console.log("🔄 [SCRAPER] Starting to fetch league data from CSI...");
    const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const res = await fetch(LEAGUE_URL, {
            headers,
            next: { revalidate: 3600 },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            console.error(`❌ Failed to fetch league data: HTTP ${res.status} ${res.statusText}`);
            throw new Error(`Failed to fetch league data: ${res.status}`);
        }
        const html = await res.text();
        console.log(`✅ Successfully fetched ${html.length} bytes from CSI`);
        const $ = cheerio.load(html);

        // --- Standings ---
        const standings: LeagueStanding[] = [];
        const standingsTable = $("table").filter((i, el) => {
            return $(el).find("th").text().includes("Pt");
        }).first();

        standingsTable.find("tbody tr").each((i, el) => {
            const tds = $(el).find("td");
            if (tds.length < 10) return;

            const rank = parseInt($(tds[0]).text().trim());
            let team = $(tds[1]).find("span").last().text().trim();
            if (!team) team = $(tds[1]).text().trim();

            // Extract Logo
            let logo = "";
            const img = $(tds[1]).find("img");
            if (img.length > 0) {
                const src = img.attr("src");
                if (src) {
                    logo = src.startsWith("http") ? src : `https://live.centrosportivoitaliano.it${src}`;
                }
            }

            // Rename team
            if (team === TEAM_NAME_CSI) {
                team = TEAM_NAME_DISPLAY;
                logo = "/assets/logo.webp";
            }

            standings.push({
                rank,
                team,
                logo,
                points: parseInt($(tds[2]).text().trim()),
                played: parseInt($(tds[3]).text().trim()),
                won: parseInt($(tds[4]).text().trim()),
                drawn: parseInt($(tds[5]).text().trim()),
                lost: parseInt($(tds[6]).text().trim()),
                gf: parseInt($(tds[7]).text().trim()),
                gs: parseInt($(tds[8]).text().trim()),
                dr: parseInt($(tds[9]).text().trim()),
            });
        });

        // --- Top Scorers ---
        const topScorers: PlayerStats[] = [];
        const scorersTable = $("table").filter((i, el) => {
            return $(el).find("th").text().includes("Giocatore") && $(el).find("th").text().includes("Gol");
        }).first();

        scorersTable.find("tbody tr").slice(0, 50).each((i, el) => {
            const tds = $(el).find("td");
            if (tds.length < 3) return;

            const player = $(tds[0]).text().trim();
            const goals = parseInt($(tds[1]).text().trim());
            let team = $(tds[2]).find("span").last().text().trim();
            if (!team) team = $(tds[2]).text().trim();

            if (team === TEAM_NAME_CSI) team = TEAM_NAME_DISPLAY;

            topScorers.push({ rank: i + 1, player, goals, team });
        });

        // --- CALENDAR (matches) ---
        const matches: CalendarMatch[] = [];
        const now = new Date();

        const matchElements = $(".row-card a.btn-gara");
        matchElements.each((i, el) => {
            const text = $(el).text();
            if (!text.includes(TEAM_NAME_CSI)) return;

            const dateStr = $(el).find("div.d-flex.flex-column").first().find("span").first().text().trim();
            const timeStr = $(el).find("div.d-flex.flex-column").first().find("span").last().text().trim();

            const [day, month, year] = dateStr.split("/").map(Number);
            const [hours, minutes] = timeStr.split(":").map(Number);

            // Adjust year for 2-digit representation (25 -> 2025)
            // Assuming 20s
            const fullYear = year < 100 ? 2000 + year : year;
            const matchDate = new Date(fullYear, month - 1, day, hours, minutes);

            const teams = $(el).find(".nome-squadra");
            const homeTeam = $(teams[0]).text().trim();
            const awayTeam = $(teams[1]).text().trim();

            const isHome = homeTeam === TEAM_NAME_CSI;
            const opponent = isHome ? awayTeam : homeTeam;

            let location = $(el).attr("data-bs-title") || "";
            location = location.replace(/\(\d+.*?\)$/, "").trim();

            // Extract Result
            // New structure: <div class="d-flex flex-column"><span><span class="text-secondary-400">2</span></span>...</div>
            let result = undefined;

            // Method 1: Check for badge (old style or specific matches)
            const resultBadge = $(el).find(".badge.bg-primary, .badge.bg-secondary, .badge.bg-danger, .result");
            if (resultBadge.length > 0) {
                const scoreText = resultBadge.text().trim();
                if (scoreText.includes("-")) {
                    result = scoreText;
                }
            }

            // Method 2: Check for span structure (new style)
            if (!result) {
                const scoreSpans = $(el).find("span.text-secondary-400, span.text-secondary-700, span.text-secondary-500, span.text-primary-700");
                // Filter for direct score numbers (usually 1 or 2 digits)
                const scores = scoreSpans.map((i, s) => $(s).text().trim()).get().filter(t => /^\d+$/.test(t));

                if (scores.length >= 2) {
                    result = `${scores[0]} - ${scores[1]}`;
                    // console.log(`Method 2A success for match ${i}: ${result}`);
                }

                // Fallback: Check the last d-flex flex-column
                if (!result) {
                    const flexCols = $(el).children(".d-flex.flex-column");
                    if (flexCols.length >= 2) {
                        const lastCol = flexCols.last();
                        const spans = lastCol.find("span > span");
                        if (spans.length >= 2) {
                            const s1 = $(spans[0]).text().trim();
                            const s2 = $(spans[1]).text().trim();
                            if (/^\d+$/.test(s1) && /^\d+$/.test(s2)) {
                                result = `${s1} - ${s2}`;
                                // console.log(`Method 2B success for match ${i}: ${result}`);
                            }
                        }
                    }
                }
            }

            if (i < 20 && result) {
                console.log(`Match ${i} [${dateStr}]: FOUND RESULT "${result}"`);
            }

            // Extract URL
            const href = $(el).attr("href");
            const csiUrl = href ? (href.startsWith("http") ? href : `https://live.centrosportivoitaliano.it${href}`) : "";

            // Create ID
            const slugDate = matchDate.toISOString().split('T')[0];
            const slugOpponent = opponent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const id = `${slugDate}-${slugOpponent}`;

            matches.push({
                id,
                date: dateStr,
                time: timeStr,
                datetime: matchDate,
                opponent,
                location,
                isHome,
                played: !!result || matchDate < now,
                result,
                csiUrl
            });
        });

        // Sort matches by date
        matches.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

        // Derive nextMatch
        const nextMatchMatch = matches.find(m => m.datetime > now);
        let nextMatch: NextMatch | null = null;
        if (nextMatchMatch) {
            nextMatch = {
                date: nextMatchMatch.date,
                time: nextMatchMatch.time,
                opponent: nextMatchMatch.opponent,
                location: nextMatchMatch.location,
                isHome: nextMatchMatch.isHome
            };
        }

        return { standings, topScorers, nextMatch, matches };

    } catch (error) {
        console.error("❌ Error scraping league data:", error);
        console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error("Stack trace:", error.stack);
        }
        return { standings: [], topScorers: [], nextMatch: null, matches: [] };
    }
}

// Export a cached version
export const getLeagueData = unstable_cache(
    async () => scrapeLeagueDataInternal(),
    ["league-data-v3"],
    { revalidate: 3600, tags: ["league"] }
);

export interface MatchEvent {
    time: string;
    type: "goal" | "yellow-card" | "red-card" | "sub" | "other";
    player: string;
    team: "home" | "away";
    score?: string;
}

export interface MatchDetails {
    scorers: string[];
    events: MatchEvent[];
}

export async function getMatchDetails(url: string): Promise<MatchDetails | null> {
    console.log("Scraping match details from:", url);
    const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        const res = await fetch(url, { headers, next: { revalidate: 3600 } });
        if (!res.ok) {
            console.error(`Failed to fetch match details: ${res.status}`);
            return null;
        }
        const html = await res.text();
        const $ = cheerio.load(html);

        const scorers: string[] = [];
        const events: MatchEvent[] = [];

        // Parse Timeline Events
        $(".event-row").each((i, el) => {
            const time = $(el).find(".event-time").text().trim();
            const isLeft = $(el).find(".event-left").length > 0;
            const detailsDiv = $(el).find(isLeft ? ".event-left" : ".event-right");

            // Extract Player Name (remove score and other tags)
            let player = detailsDiv.clone().children().remove().end().text().trim();
            // Sometimes player is inside a span or directly text. 
            // Fallback: get text of first text node or span
            if (!player) {
                player = detailsDiv.find("span").first().text().trim() || detailsDiv.text().trim();
            }
            // Clean up numbers like (18)
            player = player.replace(/\(\d+\)/g, "").trim();

            // Extract Score if present (usually in h6)
            const score = detailsDiv.find("h6").text().trim();

            // Determine Icon / Type
            const iconClass = $(el).find(".event-icon i").attr("class") || "";
            let type: MatchEvent["type"] = "other";
            if (iconClass.includes("fa-futbol")) type = "goal";
            else if (iconClass.includes("text-warning")) type = "yellow-card";
            else if (iconClass.includes("text-danger")) type = "red-card";
            else if (iconClass.includes("fa-exchange")) type = "sub";

            if (type === "goal") {
                scorers.push(player); // Compatibility with old simple list
            }

            events.push({
                time,
                type,
                player,
                team: isLeft ? "home" : "away",
                score: score || undefined
            });
        });

        // Try to find scorers table (Legacy fallback or alternative view)
        // ... (Keep existing robust logic just in case timeline is missing)
        if (events.length === 0) {
            const scorersHeader = $("*:contains('Marcatori')").filter((i, el) => {
                const tag = $(el).prop("tagName")?.toLowerCase();
                return !!(tag && ["h4", "h5", "h6", "div", "span", "strong", "b"].includes(tag) && $(el).text().trim() === "Marcatori");
            }).last();

            if (scorersHeader.length > 0) {
                const table = scorersHeader.closest("div").next("table").length ? scorersHeader.closest("div").next("table") : scorersHeader.next("table");
                if (table.length > 0) {
                    table.find("tr").each((i, el) => {
                        const tds = $(el).find("td");
                        if (tds.length > 0) {
                            const name = tds.first().text().trim();
                            if (name && name !== "Giocatore") scorers.push(name);
                        }
                    });
                }
            }
        }

        return { scorers: [...new Set(scorers)], events }; // Dedup scorers

    } catch (error) {
        console.error("Error scraping match details:", error);
        return null;
    }
}


export interface AggregatedPlayerStats {
    name: string;
    goals: number;
    yellowCards: number;
    redCards: number;
    matches: number; // Appearances
}

async function scrapeAggregatedPlayerStatsInternal(): Promise<AggregatedPlayerStats[]> {
    console.log("Starting aggregation of player stats...");
    const leagueData = await getLeagueData();
    const playedMatches = leagueData.matches.filter(m => m.played && m.csiUrl);

    const playerStatsMap = new Map<string, AggregatedPlayerStats>();

    // Helper to normalize names (simple version: uppercase)
    const normalize = (name: string) => name.trim().toUpperCase();

    // Helper to get or create stats
    const getStats = (name: string) => {
        const key = normalize(name);
        if (!playerStatsMap.has(key)) {
            playerStatsMap.set(key, {
                name: name.trim(), // Keep original casing of first occurrence
                goals: 0,
                yellowCards: 0,
                redCards: 0,
                matches: 0
            });
        }
        return playerStatsMap.get(key)!;
    };

    // Parallel fetch matching next.js concurrency limits usually fine, but let's be nice to CSI
    // We'll do batches or just Promise.all if not too many. There are usually ~20 matches.
    const matchDetailsPromises = playedMatches.map(async (match) => {
        if (!match.csiUrl) return null;
        return getMatchDetails(match.csiUrl);
    });

    const results = await Promise.all(matchDetailsPromises);

    results.forEach((details) => {
        if (!details) return;

        // Track players in this match to increment appearances only once per match
        const matchPlayers = new Set<string>();

        // Process Timeline Events
        details.events.forEach(event => {
            // Only count our team? 
            // Logic: We don't verify team in getMatchDetails fully, but usually "home" or "away".
            // We can check if the player is in our known roster list? 
            // Or simpler: We just aggregate everything and filter by known roster names on the frontend.
            // This is safer. The frontend will only show stats for players in players.json.

            // Normalize name
            const stats = getStats(event.player);
            matchPlayers.add(normalize(event.player));

            if (event.type === 'goal') stats.goals++;
            if (event.type === 'yellow-card') stats.yellowCards++;
            if (event.type === 'red-card') stats.redCards++;
        });

        // Process Scorers List (fallback/additional)
        details.scorers.forEach(scorerName => {
            const stats = getStats(scorerName);
            matchPlayers.add(normalize(scorerName));
            // Note: Goals are usually better counted from events if available.
            // If events exist, we might double count if we aren't careful.
            // But getMatchDetails separates them. 
            // Actually, getMatchDetails returns `scorers` as a unique list of names who scored.
            // `events` is the detailed timeline.
            // If events are empty, `scorers` might be populated from the table.
            // If events are present, we should rely on them for goal COUNTS.

            // If we have no events, assume 1 goal per scorer entry? 
            // The simple table usually doesn't show count, just list.
            // Let's rely on Events for counts if possible.
        });

        // Increment matches for everyone seen
        matchPlayers.forEach(key => {
            const stats = playerStatsMap.get(key);
            if (stats) stats.matches++;
        });
    });

    const finalStats = Array.from(playerStatsMap.values());
    console.log(`Aggregated stats for ${finalStats.length} players found in match reports.`);
    // Debug log specific players to see if they are found
    // console.log("Sample found players:", finalStats.slice(0, 5).map(s => s.name));

    return finalStats;
}

export const getAggregatedPlayerStats = unstable_cache(
    async () => scrapeAggregatedPlayerStatsInternal(),
    ["aggregated-player-stats-v2"], // Bump version to force refresh
    { revalidate: 3600, tags: ["player-stats"] }
);
