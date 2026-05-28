import React, { useState } from 'react';
import { Users, CheckCircle2, AlertCircle, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { User, Class, UserRole } from '../types';

interface AdminControlsProps {
  users: User[];
  classes: Class[];
  currentUser: User;
  onAddClass: (name: string, waliKelasName: string) => Promise<boolean>;
  onAddStudent: (username: string, name: string, role: UserRole, kelasId: string, password?: string, bio?: string) => Promise<boolean>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export default function AdminControls({ users, classes, currentUser, onAddClass, onAddStudent, onDeleteUser }: AdminControlsProps) {
  const [subView, setSubView] = useState<'dashboard' | 'siswa_panel' | 'kelas_panel'>('dashboard');

  // Add Class States
  const [newClassName, setNewClassName] = useState('');
  const [newClassWali, setNewClassWali] = useState('');
  const [classSuccess, setClassSuccess] = useState('');
  const [classError, setClassError] = useState('');
  const [isClassSubmitting, setIsClassSubmitting] = useState(false);

  // Add Student/Staff States
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('siswa');
  const [newClassId, setNewClassId] = useState('VII_A');
  const [newPass, setNewPass] = useState('123');
  const [newBio, setNewBio] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');
  const [studentError, setStudentError] = useState('');
  const [isStudentSubmitting, setIsStudentSubmitting] = useState(false);

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassWali.trim()) {
      setClassError('Wajib melengkapi nama kelas dan nama guru!');
      return;
    }

    setClassError('');
    setClassSuccess('');
    setIsClassSubmitting(true);

    try {
      const ok = await onAddClass(newClassName, newClassWali);
      if (ok) {
        setClassSuccess(`Berhasil mengaktifkan Kompetisi Kelas: ${newClassName}!`);
        setNewClassName('');
        setNewClassWali('');
        setTimeout(() => setClassSuccess(''), 4000);
      } else {
        setClassError('Gagal mendaftarkan kelas.');
      }
    } catch (err) {
      setClassError('Koneksi terganggu.');
    } finally {
      setIsClassSubmitting(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      setStudentError('Nama Lengkap dan Username wajib diisi!');
      return;
    }

    setStudentError('');
    setStudentSuccess('');
    setIsStudentSubmitting(true);

    try {
      const ok = await onAddStudent(newUsername, newName, newRole, newClassId, newPass, newBio);
      if (ok) {
        setStudentSuccess(`Akun ${newName} (${newRole}) berhasil dibuat!`);
        setNewUsername('');
        setNewName('');
        setNewBio('');
        setNewPass('123');
        setTimeout(() => setStudentSuccess(''), 4500);
      } else {
        setStudentError('Username sudah terpakai.');
      }
    } catch (err) {
      setStudentError('Koneksi terganggu.');
    } finally {
      setIsStudentSubmitting(false);
    }
  };

  return (
    <div id="admin-controls" className="flex flex-col gap-6">
      
      {/* Tab Navigation Menu */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm gap-1 self-start">
        <button
          onClick={() => setSubView('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subView === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-650 hover:bg-slate-50'
          }`}
        >
          Data Operator & Pengguna
        </button>
        <button
          onClick={() => setSubView('siswa_panel')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subView === 'siswa_panel' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-650 hover:bg-slate-50'
          }`}
        >
          Registrasi Akun Siswa/Guru
        </button>
        <button
          onClick={() => setSubView('kelas_panel')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            subView === 'kelas_panel' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-650 hover:bg-slate-50'
          }`}
        >
          Kelas & Kompetisi Baru
        </button>
      </div>

      {subView === 'dashboard' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Dashboard Manajemen Operator</h3>
            <p className="text-xs text-slate-500">Pantau dan verifikasi hak akses Guru BK, Wali Kelas dan Siswa secara keseluruhan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50/70 border border-indigo-100/50 rounded-2xl">
              <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider font-mono">Daftar Akun</span>
              <span className="text-xl font-bold font-mono text-indigo-950 block mt-1">{users.length} Akun Terdaftar</span>
            </div>
            <div className="p-4 bg-emerald-50/70 border border-emerald-100/50 rounded-2xl">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider font-mono">Pilar Kelas</span>
              <span className="text-xl font-bold font-mono text-emerald-950 block mt-1">{classes.length} Kelas Aktif</span>
            </div>
            <div className="p-4 bg-purple-50/70 border border-purple-100/50 rounded-2xl">
              <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider font-mono">Super Administrator</span>
              <span className="text-xl font-bold font-mono text-purple-950 block mt-1">1 Operator</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">Log Otoritas Akun Terdaftar</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-2">Nama Lengkap</th>
                    <th className="py-2.5 px-2">Hak Akses Role</th>
                    <th className="py-2.5 px-2">Username</th>
                    <th className="py-2.5 px-2">ID Pengguna</th>
                    <th className="py-2.5 px-2 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition">
                      <td className="py-3 px-2 font-bold text-slate-800">{u.name}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          u.role === 'admin' ? 'bg-orange-100 text-orange-850' :
                          u.role === 'guru_bk' ? 'bg-purple-100 text-purple-850' :
                          u.role === 'wali_kelas' ? 'bg-emerald-100 text-emerald-850' : 'bg-blue-100 text-blue-850'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-600">{u.username}</td>
                      <td className="py-3 px-2 font-mono text-slate-400">{u.id}</td>
                      <td className="py-3 px-2 text-center">
                        {u.id !== currentUser.id ? (
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                            title="Hapus akun secara permanen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Akun Aktif</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subView === 'siswa_panel' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-w-2xl">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Registrasi Pengguna Baru</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftarkan akun siswa, wali kelas, atau guru BK pendamping ke database</p>
            </div>
            <button onClick={() => setSubView('dashboard')} className="text-indigo-600 text-xs font-bold hover:underline">
              Kembali
            </button>
          </div>

          <form onSubmit={handleStudentSubmit} className="flex flex-col gap-4">
            {studentSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-150 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{studentSuccess}</span>
              </div>
            )}
            {studentError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-150 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-605 shrink-0" />
                <span>{studentError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Aurelia Putri Prasetya"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Username Akun</label>
                <input
                  type="text"
                  placeholder="Contoh: aurelia"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Hak Akses Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50"
                >
                  <option value="siswa">Siswa</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="guru_bk">Guru BK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Koneksi Kelas</label>
                <select
                  disabled={newRole !== 'siswa'}
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500 rounded-xl bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>Kelas {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Kata Sandi (Password)</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-200 focus:outline-none rounded-xl bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Biodata Motivasi / Status Singkat</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                placeholder="Disiplin dan menghormati bimbingan adalah kunci karakter utama..."
                rows={2}
                className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isStudentSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md shadow-indigo-100 self-start transition active:scale-95"
            >
              Daftarkan Pengguna
            </button>
          </form>
        </div>
      )}

      {subView === 'kelas_panel' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm max-w-2xl">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">Inisialisasi Kelas Baru</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aktifkan pilar kompetisi kedisiplinan dan piket kebersihan kelas baru</p>
            </div>
            <button onClick={() => setSubView('dashboard')} className="text-indigo-600 text-xs font-bold hover:underline">
              Kembali
            </button>
          </div>

          <form onSubmit={handleClassSubmit} className="flex flex-col gap-4">
            {classSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-150 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{classSuccess}</span>
              </div>
            )}
            {classError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-150 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{classError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Nama Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: VIII D atau IX A"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-sans">Nama Guru Wali Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: Ibu Rina, S.Pd."
                  value={newClassWali}
                  onChange={(e) => setNewClassWali(e.target.value)}
                  className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isClassSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md shadow-indigo-100 self-start transition active:scale-95"
            >
              Aktifkan Kompetisi Kelas
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
