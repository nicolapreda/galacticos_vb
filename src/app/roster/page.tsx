import Image from "next/image";
import Link from "next/link";
import playersData from "@/data/players.json";

export default function RosterPage() {
  // Define groups and order
  const roleGroups = [
    { title: "Portieri", role: "Portiere" },
    { title: "Difensori", role: "Difensore" },
    { title: "Centrocampisti", role: "Centrocampista" },
    { title: "Attaccanti", role: "Attaccante" },
  ];

  const staffRoles = ["Staff", "Dirigente Sportivo", "Allenatore", "Presidente", "Vicepresidente"];
  
  const staff = playersData
    .filter(p => staffRoles.includes(p.role) || p.number === 0);

  return (
    <div className="bg-galacticos-dark min-h-screen text-white pb-20">
      {/* Header */}
      <header className="bg-galacticos-dark text-white pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-7xl md:text-9xl font-black mb-4 font-anton uppercase tracking-wide leading-none">
            La Squadra
          </h1>
          <p className="text-xl text-gray-300 uppercase tracking-widest">
            Stagione 2025/2026
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Render Player Groups */}
        {roleGroups.map((group) => {
           const playersInGroup = playersData
             .filter(p => p.role === group.role && p.number !== 0)
             .sort((a, b) => a.number - b.number);
            
           if (playersInGroup.length === 0) return null;

           return (
             <section key={group.title} className="mb-20">
                <div className="flex items-center justify-center mb-8">
                  <div className="h-px bg-white/20 w-16 md:w-32 mr-4 md:mr-8"></div>
                  <h2 className="text-4xl md:text-6xl font-black font-anton uppercase text-center text-flyer-cyan tracking-wide">
                    {group.title}
                  </h2>
                  <div className="h-px bg-white/20 w-16 md:w-32 ml-4 md:ml-8"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {playersInGroup.map((player) => (
                    <PlayerCard
                      key={`${player.number}-${player.name}`}
                      number={player.number}
                      name={player.name}
                      role={player.role}
                      image={player.image}
                    />
                  ))}
                </div>
             </section>
           );
        })}

        {/* Staff Section */}
        {staff.length > 0 && (
          <section>
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-white/20 w-32 mr-8"></div>
              <h2 className="text-5xl md:text-7xl font-black font-anton uppercase text-center tracking-wide">
                Lo Staff
              </h2>
              <div className="h-px bg-white/20 w-32 ml-8"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 shadow-xl relative transform hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center hover:bg-white/10 hover:border-white/20">
      {/* Card Image Container */}
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-800 relative rounded-lg shadow-lg mb-4">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          unoptimized
        />
      </div>

      {/* Info Container */}
      <div className="text-center w-full">
         {!isStaff && (
           <div className="text-galacticos-yellow text-2xl md:text-3xl font-anton mb-1 drop-shadow-md">
              {number}
           </div>
         )}
         <div className={`text-white font-bold font-anton uppercase tracking-wide leading-none ${isStaff ? 'text-lg md:text-xl' : 'text-base md:text-lg mb-1'}`}>
            {name}
         </div>
         <div className="text-gray-400 text-[10px] md:text-xs uppercase tracking-widest font-medium mt-1">
            {role}
         </div>
      </div>
    </div>
  );
}
