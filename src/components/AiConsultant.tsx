import React, { useState } from 'react';
import { Sparkles, MessageSquare, ShieldAlert } from 'lucide-react';

interface AiConsultantProps {
  currentUser: { name: string; id: string };
}

export default function AiConsultant({ currentUser }: AiConsultantProps) {
  const [category, setCategory] = useState('Sopan Santun');
  const [topic, setTopic] = useState('');
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConsult = async () => {
    setIsLoading(true);
    setAdvice('');
    try {
      const res = await fetch('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, customTopic: topic }),
      });
      const data = await res.json();
      setAdvice(data.advice || 'Maaf, AI gagal memproses bimbingan.');
    } catch (err) {
      setAdvice('Terjadi kegagalan koneksi dengan BK AI Counselor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-consultant-card" className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-2">
        <span className="bg-indigo-500/35 border border-indigo-500/35 text-[9px] font-mono font-bold text-indigo-200 px-2 py-0.5 rounded-full uppercase tracking-widest">
          Gemini 3.5 Flash
        </span>
        <span className="text-yellow-350 text-xs flex items-center gap-1 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          Virtual BK Counselor
        </span>
      </div>

      <h3 className="text-base font-extrabold text-white">Konseling Karakter Terpadu</h3>
      <p className="text-[11px] text-slate-300 mb-4 font-sans leading-relaxed">
        Butuh saran emosional atau nasihat mempraktikkan tata krama di sekolah? Curahkan keluhanmu pada Bu Hermin BK Virtual.
      </p>

      <div className="flex flex-col gap-3.5 text-slate-905">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
            Pilar Pembinaan Karakter
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs text-white"
          >
            <option value="Sopan Santun">Sopan Santun & Ramah Guru</option>
            <option value="Disiplin & Ketepatan">Disiplin Waktu & Seragam</option>
            <option value="Anti-Bullying">Stop Bullying & Saling Jaga</option>
            <option value="Kebersihan Kelas">Lingkungan Asri & Kerukunan</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
            Keluhan / Masalah Spesifik Anda (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Malu bertegur sapa, atau cara piket damai..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder-slate-500"
          />
        </div>

        <button
          onClick={handleConsult}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-bold py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 mt-2 active:scale-95 disabled:bg-slate-800"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>BK AI Mengolah Nasihat...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>Terbitkan Nasihat Kebaikan</span>
            </>
          )}
        </button>

        {advice && (
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider font-mono flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Nasihat Ibu Hermin (BK):
            </span>
            <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700 text-xs text-slate-200 leading-relaxed font-sans max-h-56 overflow-y-auto whitespace-pre-wrap">
              {advice}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
