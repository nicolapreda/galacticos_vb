import Link from "next/link";
import Image from "next/image";
import folders from "@/data/gallery-folders.json";
import { Folder, ExternalLink } from "lucide-react";
import { getLeagueData } from "@/lib/scraper";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const DRIVE_BASE_URL = "https://drive.predanicola.it/s/i4rkc43fwrMEKB5?path=";
  const { matches } = await getLeagueData();

  return (
    <div className="bg-[#001E45] min-h-screen pt-32 pb-20 text-white">
      {/* HERO / HEADER */}
      <section className="bg-[#001E45] text-white py-16 mb-12 relative overflow-hidden">
         <div className="absolute inset-0 opacity-20 bg-[url('/assets/hero-bg.jpg')] bg-cover mix-blend-overlay" />
         <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h1 className="text-6xl md:text-8xl font-black font-anton uppercase mb-4 tracking-wide">
                Media <span className="text-flyer-cyan">Gallery</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Rivivi le emozioni della stagione. Sfoglia gli album fotografici delle nostre partite ed eventi.
            </p>
         </div>
      </section>

      {/* ALBUMS GRID */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders
                .filter(f => f.cover && f.cover.trim() !== "")
                .map((folder, index) => {
                // Match Name Parsing
                let displayName = folder.name;
                
                try {
                    // Start with basic parsing
                    const parts = folder.name.split(" - ");
                    if (parts.length >= 2) {
                        const datePart = parts[0].trim(); // "4.10"
                        const teamPart = parts[1].trim(); // "GHEZZI ANYMORE"

                        const [day, month] = datePart.split(".").map(Number);
                        // Assuming year 2025/2026 based on month? 
                        // Season starts Sept 2025. Jan-Feb 2026.
                        // Simple guessing: if month > 8 -> 2025, else 2026.
                        const year = month > 8 ? 2025 : 2026;
                        
                        const fullDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

                        // Title case
                        const titleCaseTeam = teamPart
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        
                        // Default fallback
                        displayName = `Galacticos VB - ${titleCaseTeam} - ${fullDate}`;

                        // Try to find exact match in scraped data to determine Home/Away
                        if (matches) {
                            // Find match with same day/month/year
                            const match = matches.find(m => {
                                const d = new Date(m.date.split("/").reverse().join("-")); // DD/MM/YYYY -> YYYY-MM-DD
                                // Actually m.date is "DD/MM/YYYY" string
                                const [mDay, mMonth, mYear] = m.date.split("/").map(Number);
                                return mDay === day && mMonth === month && mYear === year;
                            });

                            if (match) {
                                // Found match! Use correct Home - Away format
                                const home = match.isHome ? "GALACTICOS VB" : match.opponent;
                                const away = match.isHome ? match.opponent : "GALACTICOS VB";
                                displayName = `${home} - ${away} - ${fullDate}`;
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing folder name:", folder.name, e);
                }

                // Restore folderUrl definition
                const folderUrl = `${DRIVE_BASE_URL.replace("?path=", "?dir=")}${encodeURIComponent("/" + folder.name)}`;
                
                return (
                    <a 
                        key={index} 
                        href={folderUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group bg-[#001E45] border border-white/10 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-flyer-cyan/20 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                        {/* Cover Area */}
                        <div className="h-48 bg-black/50 relative items-center justify-center flex overflow-hidden">
                             <Image 
                                 src={folder.cover as string} 
                                 alt={folder.name} 
                                 fill 
                                 className="object-cover group-hover:scale-110 transition-transform duration-700"
                                 unoptimized
                             />

                             {/* Overlay on hover */}
                             <div className="absolute inset-0 bg-flyer-blue/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase tracking-widest gap-2 z-20">
                                <Folder className="w-5 h-5" />
                                Apri Album
                             </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black font-anton text-white uppercase mb-2 group-hover:text-flyer-cyan transition-colors leading-tight">
                                    {displayName}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-flyer-cyan inline-block"></span>
                                    Stagione 2025/26
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-flyer-cyan" />
                            </div>
                        </div>
                    </a>
                );
            })}
        </div>
      </main>
    </div>
  );
}
