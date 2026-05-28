import React, { useState } from 'react';
import { Users, CheckCircle2, AlertCircle, Search, Trophy, Compass, Sparkle, Plus } from 'lucide-react';
import { User, Class, Log } from '../types';
import ClassLeaderboard from './ClassLeaderboard';

interface BkControlsProps {
  users: User[];
  classes: Class[];
  logs: Log[];
  currentUser: User;
  onVerifyLog: (logId: string, isApproved: boolean) => Promise<void>;
  onGivePoint: (studentId: string, type: 'sopan' | 'bersih', points: number, description: string) => Promise<boolean>;
}

export default function BkControls({ users, classes, logs, currentUser, onVerifyLog, onGivePoint }: BkControlsProps) {
  const [subView, setSubView] = useState<'dashboard' | 'beri_poin' | 'verifikasi_peer'>('dashboard');
  const [studentSearch, setStudentSearch] = useState('');
  
  // Point give form state
  const [targetStudentId, setTargetStudentId] = useState('');
  const [pointType, setPointType] = useState<'sopan' | 'bersih'>('sopan');
  const [pointsValue, setPointsValue] = useState('15');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const students = users.filter(u => u.role === 'siswa');
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.kelasId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const pendingPeerLogs = logs.filter(l => l.type === 'apresiasi' && !l.isVerified);

  const handleGivePointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !notes.trim()) {
      setErrorMsg('Pilih siswa dan masukkan deskripsi tindakan!');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const parsedPoints = parseInt(pointsValue);
      const success = await onGivePoint(targetStudentId, pointType, parsedPoints, notes);
      if (success) {
        setSuccessMsg('Berhasil mengkreditkan poin karakter kepada siswa!');
        setNotes('');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg('Gagal menambahkan poin.');
      }
    } catch (err) {
      setErrorMsg('Kegagalan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="bk-controls" className="flex flex-col gap-6">
      
      {/* BK Nav Tab bar */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm gap-1 self-start">
        <button
          onClick={() => setSubView('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subView === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Dasbor Siswa & Poin
        </button>
        <button
          onClick={() => setSubView('beri_poin')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subView === 'beri_poin' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Input Poin Manual
        </button>
        <button
          onClick={() => setSubView('verifikasi_peer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            subView === 'verifikasi_peer' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Validasi Apresiasi Teman</span>
          {pendingPeerLogs.length > 0 && (
            <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {pendingPeerLogs.length}
            </span>
          )}
        </button>
      </div>

      {subView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Quick Summary Counts Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-sans">Verifikasi Antre</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block font-mono">{pendingPeerLogs.length} Antrian</span>
              </div>
              <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-sans">Total Siswa</span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block font-mono">{students.length} Orang</span>
              </div>
              <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block font-sans">Kelas Peserta</span>
                <span className="text-2xl font-black text-rose-600 mt-1 block font-mono">{classes.length} Kelas</span>
              </div>
            </div>

            {/* Students Table and Search list */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Rekapitulasi Poin Karakter Murid</h3>
                  <p className="text-xs text-slate-500 leading-none mt-1">Status dan kepemilikan poin pribadi di seluruh kelas terdaftar</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari siswa atau kelas..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 w-full sm:w-52"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-1">Nama Siswa</th>
                      <th className="py-2.5 px-1">Kelas</th>
                      <th className="py-2.5 px-1 text-right">Poin Sopan</th>
                      <th className="py-2.5 px-1 text-right">Poin Bersih</th>
                      <th className="py-2.5 px-1 text-right">Lencana</th>
                      <th className="py-2.5 px-1 text-center font-sans">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                        <td className="py-3 px-1 font-bold text-slate-800">{std.name}</td>
                        <td className="py-3 px-1">{std.kelasId.replace('_', ' ')}</td>
                        <td className="py-3 px-1 text-right font-bold text-blue-700 font-mono">{std.pointSopan}</td>
                        <td className="py-3 px-1 text-right font-bold text-emerald-700 font-mono">{std.pointBersih}</td>
                        <td className="py-3 px-1 text-right">
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {std.badges?.length || 0} Pcs
                          </span>
                        </td>
                        <td className="py-3 px-1 text-center">
                          <button
                            onClick={() => {
                              setTargetStudentId(std.id);
                              setSubView('beri_poin');
                            }}
                            className="bg-indigo-55 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition whitespace-nowrap"
                          >
                            + Input
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-455 italic">Siswa tidak ditemukan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
            <ClassLeaderboard classes={classes} />
          </div>
        </div>
      )}

      {subView === 'beri_poin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-w-2xl">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Kelayakan & Akreditasi Poin BK</h3>
              <p className="text-xs text-slate-500 mt-0.5">Penilaian pembiasaan nyata kesopanan and piket kebersihan murid</p>
            </div>
            <button onClick={() => setSubView('dashboard')} className="text-indigo-600 text-xs font-bold hover:underline">
              Kembali
            </button>
          </div>

          <form onSubmit={handleGivePointsSubmit} className="flex flex-col gap-4">
            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-emerald-100 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Siswa Target</label>
              <select
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full px-4 py-3 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50"
              >
                <option value="">-- Cari Kelas & Nama Murid --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Kelas {s.kelasId.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Kategori Karakter</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPointType('sopan')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      pointType === 'sopan' ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-50' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Sopan & Etika
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointType('bersih')}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      pointType === 'bersih' ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-50' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Piket Bersih
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Bobot Poin</label>
                <select
                  value={pointsValue}
                  onChange={(e) => setPointsValue(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50"
                >
                  <option value="10">+10 Poin (Merespons Baik)</option>
                  <option value="15">+15 Poin (Konsisten Sopan)</option>
                  <option value="25">+25 Poin (Apresiasi Aksi Sekolah)</option>
                  <option value="50">+50 Poin (Siswa Teladan Karakter)</option>
                  <option value="-15">-15 Poin (Kurang Sopan / Melanggar)</option>
                  <option value="-25">-25 Poin (Pelanggaran Tertulis / Bullying)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Catatan Riwayat / Deskripsi BK</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tuliskan keterangan detail tindakan atau apresiasi..."
                rows={3}
                className="w-full px-4 py-3 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50 font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md shadow-indigo-100 self-start transition"
            >
              Kirim & Proses Transaksi Poin
            </button>
          </form>
        </div>
      )}

      {subView === 'verifikasi_peer' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center mb-1 pb-3 border-b border-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Antrean validasi Saling-Apresiasi Teman</h3>
              <p className="text-xs text-slate-500 mt-0.5">Guru BK bertindak mengoreksi keaslian usulan dari siswa demi meminimalkan kecurangan</p>
            </div>
            <button onClick={() => setSubView('dashboard')} className="text-indigo-650 font-bold text-xs hover:underline">
              Kembali
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {pendingPeerLogs.length > 0 ? (
              pendingPeerLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-amber-200 bg-amber-50/20 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-slate-900 text-sm">{log.studentName}</span>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 rounded-full uppercase">
                        Kelas {log.kelasId.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-650 italic text-xs leading-relaxed font-sans">"{log.description}"</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">
                      Diajukan oleh: <span className="font-bold text-indigo-700">{log.giverName}</span> pada {log.date}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => onVerifyLog(log.id, true)}
                      className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
                    >
                      Setujui (+10)
                    </button>
                    <button
                      onClick={() => onVerifyLog(log.id, false)}
                      className="bg-rose-50 text-rose-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-100 transition border border-rose-100"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-slate-650 text-sm">Semua Usulan Selesai Diverifikasi!</p>
                <p className="text-xs text-slate-400 mt-1">Kosong, tidak ada antrean laporan peer-appreciation yang menanti validasi.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
