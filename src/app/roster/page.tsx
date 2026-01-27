import Image from "next/image";
import Link from "next/link";
import playersData from "@/data/players.json";

export default function RosterPage() {
  // Split players and staff
  const staffRoles = ["Staff", "Dirigente Sportivo", "Allenatore", "Presidente", "Vicepresidente"];
  
  const roster = playersData
    .filter(p => !staffRoles.includes(p.role) && p.number !== 0)
    .sort((a, b) => a.number - b.number);

  const staff = playersData
    .filter(p => staffRoles.includes(p.role) || p.number === 0);

  return (
    <div className="bg-galacticos-dark min-h-screen text-white pb-20">
      {/* Header */}
      <header className="bg-galacticos-dark text-white pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-9xl font-black mb-4 font-anton uppercase">
            La Squadra
          </h1>
          <p className="text-xl text-gray-300 uppercase tracking-widest">
            Stagione 2025/2026
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Roster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {roster.length > 0 ? (
            roster.map((player) => (
              <PlayerCard
                key={`${player.number}-${player.name}`}
                number={player.number}
                name={player.name}
                role={player.role}
                image={player.image}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              Nessun giocatore trovato.
            </div>
          )}
        </div>

        {/* Staff Section */}
        {staff.length > 0 && (
          <section>
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-white/20 w-32 mr-8"></div>
              <h2 className="text-4xl md:text-6xl font-black font-anton uppercase text-center">
                Lo Staff
              </h2>
              <div className="h-px bg-white/20 w-32 ml-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {staff.map((member) => (
                <PlayerCard
                  key={`staff-${member.name}`}
                  number={member.number}
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  isStaff={true}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function PlayerCard({
  number,
  name,
  role,
  image,
  isStaff = false,
}: {
  number: number;
  name: string;
  role: string;
  image: string;
  isStaff?: boolean;
}) {
  const CardContent = (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl relative transform hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center hover:bg-white/10 hover:border-white/20">
      {/* Card Image Container */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-800 relative rounded-xl shadow-lg">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          unoptimized
        />
      </div>

      {/* Info Container */}
      <div className="pt-6 pb-4 text-center w-full">
         {!isStaff && (
           <div className="text-galacticos-yellow text-4xl font-anton mb-3 drop-shadow-md">
              {number}
           </div>
         )}
         <div className={`text-white font-bold font-anton uppercase tracking-wide leading-snug ${isStaff ? 'text-2xl' : 'text-xl'}`}>
            {name}
         </div>
         <div className="text-gray-400 text-xs uppercase tracking-widest mt-4 font-medium">
            {role}
         </div>
      </div>
    </div>
  );

  // Link only for players, simple div for staff (Staff usually don't have stats on CSI)
  // Reverting to static display as per user request
  return CardContent;
}
