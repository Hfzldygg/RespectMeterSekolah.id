import React, { useState } from 'react';
import { Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AppreciationFormProps {
  users: User[];
  currentUser: User;
  onSubmit: (targetStudentId: string, description: string) => Promise<boolean>;
}

export default function AppreciationForm({ users, currentUser, onSubmit }: AppreciationFormProps) {
  const [selectedPeerId, setSelectedPeerId] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeerId || !description.trim()) {
      setErrorMsg('Harap pilih teman dan berikan deskripsi kebaikan!');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const success = await onSubmit(selectedPeerId, description);
      if (success) {
        setSuccessMsg('Apresiasi berhasil dikirim! Menunggu persetujuan Guru BK.');
        setDescription('');
        setSelectedPeerId('');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg('Gagal mengirim apresiasi.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const classmates = users.filter(u => u.id !== currentUser.id && u.role === 'siswa');

  return (
    <div id="apresiasi-form-card" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-pink-100 text-pink-600 rounded-2xl">
          <Heart className="w-5 h-5 fill-pink-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Apresiasi Karakter Teman</h3>
          <p className="text-xs text-slate-500 leading-tight">Ajukan penambahan poin (+10 Poin) atas perilaku baik temanmu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2 border border-rose-100">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
            Pilih Teman Sekelas
          </label>
          <select
            value={selectedPeerId}
            onChange={(e) => setSelectedPeerId(e.target.value)}
            className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
          >
            <option value="">-- Hubungkan Nama Siswa --</option>
            {classmates.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} (Kelas {u.kelasId.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">
            Deskripsi Tindakan Terpuji
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Merapikan barisan meja piket, mengembalikan barang hilang, melerai pertengkaran teman..."
            rows={3}
            maxLength={300}
            className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-sans leading-relaxed"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] text-slate-400">Poin diberikan setelah diverifikasi oleh Guru BK</span>
            <span className="text-[10px] text-slate-400 font-mono">{description.length}/300</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-350 text-white font-bold py-3 px-4 rounded-xl transition duration-150 text-xs shadow-md shadow-pink-100 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>{isSubmitting ? 'Mengirim...' : 'Kirim Apresiasi Sekarang'}</span>
        </button>
      </form>
    </div>
  );
}
