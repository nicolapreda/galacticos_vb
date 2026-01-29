"use client";

import { useEffect, useState } from "react";
import { Anton } from "next/font/google";

const anton = Anton({
    weight: "400",
    subsets: ["latin"],
});

interface CountdownProps {
  targetDate: string; // Format: DD/MM/YYYY HH:mm
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const [datePart, timePart] = targetDate.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      
      const target = new Date(year + 2000, month - 1, day, hours, minutes);
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, "0"),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, "0"),
          minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, "0"),
          seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, "0"),
        });
      } else {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`grid grid-cols-4 gap-4 md:gap-8 text-center text-white ${anton.className}`}>
      <div className="flex flex-col items-center">
        <div className="relative">
             <span className="text-4xl md:text-7xl font-black relative z-10 drop-shadow-lg">{timeLeft.days}</span>
        </div>
        <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-1 text-flyer-cyan">Giorni</span>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative">
             <span className="text-4xl md:text-7xl font-black relative z-10 drop-shadow-lg">{timeLeft.hours}</span>
        </div>
        <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-1 text-flyer-cyan">Ore</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
             <span className="text-4xl md:text-7xl font-black relative z-10 drop-shadow-lg">{timeLeft.minutes}</span>
        </div>
         <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-1 text-flyer-cyan">Minuti</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
             <span className="text-4xl md:text-7xl font-black relative z-10 drop-shadow-lg">{timeLeft.seconds}</span>
        </div>
        <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-1 text-flyer-cyan">Secondi</span>
      </div>
    </div>
  );
}
