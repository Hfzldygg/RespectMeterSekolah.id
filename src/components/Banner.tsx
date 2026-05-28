import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, BookOpen, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BANNERS = [
  {
    title: "Hormati Guru, Muliakan Ilmu",
    subtitle: "Sopan dalam berbicara berarti menghargai bimbingan yang tulus.",
    tag: "BUDAYA POSITIF",
    accent: "SOPAN SANTUN",
    color: "from-blue-600 to-indigo-700",
  },
  {
    title: "Piket Kelas, Harmoni Bersama",
    subtitle: "Kebersihan kelas adalah cerminan rukunnya kerja sama dan rasa tanggung jawab.",
    tag: "KELAS BERSIH",
    accent: "KERJA SAMA",
    color: "from-emerald-600 to-teal-700",
  },
  {
    title: "Stop Perundungan, Ciptakan Senyuman",
    subtitle: "Berani melindungi teman yang rapuh adalah bukti kepahlawanan sejati diri kita.",
    tag: "ANTI BULLYING",
    accent: "PEDULI SESAMA",
    color: "from-rose-500 to-red-600",
  }
];

export default function Banner() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const b = BANNERS[currentIdx];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 md:p-8 text-white shadow-xl min-h-[180px] md:min-h-[220px] transition-all duration-700 ease-in-out">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${b.color} opacity-95 transition-all duration-700`} />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col justify-between h-full"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-[10px] font-mono tracking-widest font-bold px-2.5 py-1 rounded-full uppercase">
                {b.tag}
              </span>
              <span className="text-yellow-300 text-xs flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {b.accent}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3.5xl font-sans font-bold tracking-tight mb-2 max-w-xl leading-tight">
              {b.title}
            </h2>
            <p className="text-xs md:text-sm text-sky-100 max-w-lg mb-4 text-pretty font-sans leading-relaxed">
              {b.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <button className="bg-white text-blue-900 text-xs font-bold px-5 py-2 rounded-xl shadow-md transition-transform active:scale-95 duration-150 hover:bg-sky-50">
              Budaya Positif, Sekolah Hebat!
            </button>
            
            <div className="flex gap-1.5">
              {BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentIdx ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                  aria-label={`Lihat banner ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
