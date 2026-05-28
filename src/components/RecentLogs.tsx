import React from 'react';
import { Clock, CheckSquare, Sparkles } from 'lucide-react';
import { Log } from '../types';

interface RecentLogsProps {
  logs: Log[];
}

export default function RecentLogs({ logs }: RecentLogsProps) {
  return (
    <div id="recent-logs-feed" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-2xl">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Jejak Pembiasaan Karakter</h3>
          <p className="text-xs text-slate-500">Log mutasi poin dan kebiasaan baik penunjang iklim sekolah</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
        {logs.length > 0 ? (
          logs.map((log) => {
            const isNegative = log.points < 0;
            return (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border transition hover:bg-slate-50/50 ${
                  log.isVerified ? 'bg-slate-50 border-slate-100' : 'bg-amber-50/40 border-amber-100'
                } flex flex-col gap-1 text-xs`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800 text-xs">{log.studentName}</span>
                  <span className={`text-[11px] font-bold font-mono ${
                    isNegative ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {log.points > 0 ? `+${log.points} Poin` : `${log.points} Poin`}
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] font-sans leading-relaxed text-pretty mt-0.5">
                  {log.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1.5 border-t border-slate-150/45">
                  <span>Pemberi: {log.giverName}</span>
                  <div className="flex items-center gap-1.5">
                    <span>{log.date}</span>
                    {log.isVerified ? (
                      <span className="text-emerald-700 font-extrabold bg-emerald-100/60 px-1.5 py-0.2 rounded text-[9px] uppercase">Verified</span>
                    ) : (
                      <span className="text-amber-800 font-extrabold bg-amber-100/60 px-1.5 py-0.2 rounded text-[9px] uppercase">BK Antre</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-400 italic text-xs">
            Belum ada rekam jejak akhlak hari ini.
          </div>
        )}
      </div>
    </div>
  );
}
