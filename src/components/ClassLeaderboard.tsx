import React, { useState } from 'react';
import { Trophy, Sparkles, Star, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Class } from '../types';

interface ClassLeaderboardProps {
  classes: Class[];
}

export default function ClassLeaderboard({ classes }: ClassLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'kebersihan' | 'perilaku'>('kebersihan');
  const [timeframe, setTimeframe] = useState<'mingguan' | 'bulanan'>('mingguan');

  // Sort classes accordingly
  const sortedByCleanliness = [...classes].sort((a, b) => b.pointKebersihan - a.pointKebersihan);
  const sortedByBehavior = [...classes].sort((a, b) => b.pointPerilaku - a.pointPerilaku);

  const displayList = activeTab === 'kebersihan' ? sortedByCleanliness : sortedByBehavior;

  // Podium Positions (1st, 2nd, 3rd)
  const firstPlace = displayList[0];
  const secondPlace = displayList[1];
  const thirdPlace = displayList[2];
  const trailingPlaces = displayList.slice(3);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-sans text-slate-800 tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Papan Peringkat Kompetisi Kelas
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Bersaing mendapat apresiasi, mengukir disiplin dan kebersihan sejati.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center self-start sm:self-center bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('kebersihan')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all duration-150 ${
              activeTab === 'kebersihan'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Peringkat Kebersihan
          </button>
          <button
            onClick={() => setActiveTab('perilaku')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all duration-150 ${
              activeTab === 'perilaku'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Peringkat Perilaku Positif
          </button>
        </div>
      </div>

      {/* Timeframe selector built inside the panel */}
      <div className="flex justify-end gap-1.5 -mt-2">
        <button
          onClick={() => setTimeframe('mingguan')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold font-sans transition-all ${
            timeframe === 'mingguan'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-500 bg-transparent'
          }`}
        >
          Mingguan
        </button>
        <button
          onClick={() => setTimeframe('bulanan')}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold font-sans transition-all ${
            timeframe === 'bulanan'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-500 bg-transparent'
          }`}
        >
          Bulanan
        </button>
      </div>

      {/* Podium Visualization */}
      <div className="grid grid-cols-3 gap-3 items-end pt-12 pb-6 max-w-lg mx-auto w-full relative">
        <div className="absolute top-0 inset-x-0 flex justify-center -mt-6">
          <span className="bg-yellow-100 text-yellow-800 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-600" />
            Kelas Terdisiplin Minggu Ini: {firstPlace?.name || 'VII A'}
          </span>
        </div>

        {/* 2nd Place (Left) */}
        {secondPlace && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-slate-700 text-base font-extrabold shadow-sm">
              2
            </div>
            <div className="text-center mt-2.5">
              <h4 className="text-sm font-extrabold text-slate-800">{secondPlace.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono">
                {activeTab === 'kebersihan' ? `${secondPlace.pointKebersihan} Poin` : `${secondPlace.pointPerilaku} Poin`}
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100/50 rounded-t-xl h-20 flex items-end justify-center pb-2 mt-2">
              <span className="text-xs text-slate-500 font-bold font-mono">VII B</span>
            </div>
          </div>
        )}

        {/* 1st Place (Center) */}
        {firstPlace && (
          <div className="flex flex-col items-center scale-110 -translate-y-2 z-10">
            <div className="w-14 h-14 rounded-full bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center text-yellow-800 text-lg font-extrabold shadow-md relative">
              👑
              <div className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold">
                1
              </div>
            </div>
            <div className="text-center mt-2.5">
              <h4 className="text-sm font-extrabold text-slate-900">{firstPlace.name}</h4>
              <p className="text-[11px] text-blue-700 font-bold font-mono">
                {activeTab === 'kebersihan' ? `${firstPlace.pointKebersihan} Poin` : `${firstPlace.pointPerilaku} Poin`}
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-t-2xl h-28 flex items-end justify-center pb-3 mt-2 shadow-sm border-x border-t border-yellow-200">
              <span className="text-xs text-yellow-900 font-extrabold font-mono">VII A</span>
            </div>
          </div>
        )}

        {/* 3rd Place (Right) */}
        {thirdPlace && (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-800 text-base font-extrabold shadow-sm">
              3
            </div>
            <div className="text-center mt-2.5">
              <h4 className="text-sm font-extrabold text-slate-800">{thirdPlace.name}</h4>
              <p className="text-[11px] text-slate-500 font-mono">
                {activeTab === 'kebersihan' ? `${thirdPlace.pointKebersihan} Poin` : `${thirdPlace.pointPerilaku} Poin`}
              </p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-100 to-amber-50/50 rounded-t-xl h-16 flex items-end justify-center pb-2 mt-2">
              <span className="text-xs text-amber-700 font-bold font-mono">VIII C</span>
            </div>
          </div>
        )}
      </div>

      {/* Row Listings */}
      <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daftar Peringkat Kelas Lengkap</h4>
        
        {displayList.map((cls, idx) => (
          <div
            key={cls.id}
            className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl hover:bg-slate-100/70 transition-all duration-150 border border-slate-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                idx === 1 ? 'bg-slate-100 text-slate-700' :
                idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'
              }`}>
                {idx + 1}
              </div>
              <div>
                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  Kelas {cls.name}
                  {idx === 0 && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                </h5>
                <p className="text-[11px] text-slate-400">Wali Kelas: {cls.waliKelasName}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 font-mono">
                {activeTab === 'kebersihan' 
                  ? `${cls.pointKebersihan.toLocaleString('id-ID')} Poin Kebersihan` 
                  : `${cls.pointPerilaku.toLocaleString('id-ID')} Poin Perilaku`
                }
              </span>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Aktif
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
