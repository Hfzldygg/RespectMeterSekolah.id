import React, { useState } from 'react';
import { Coins, Flame, Ticket, Shield } from 'lucide-react';
import { Reward, User } from '../types';

interface RewardsShopProps {
  rewards: Reward[];
  currentUser: User;
  onRedeem: (rewardId: string) => Promise<boolean>;
}

export default function RewardsShop({ rewards, currentUser, onRedeem }: RewardsShopProps) {
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  const handleClaim = async (rewardId: string) => {
    setIsRedeeming(rewardId);
    try {
      await onRedeem(rewardId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRedeeming(null);
    }
  };

  const totalPoints = currentUser.pointSopan + currentUser.pointBersih;

  return (
    <div id="rewards-shop" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Toko Penukaran Hadiah Karakter</h3>
            <p className="text-xs text-slate-500 leading-tight">Gunakan akumulasi poin baikmu demi mengklaim rewards eksklusif</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-150 px-3 py-1.5 rounded-2xl text-center self-start sm:self-center flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Saldo Poin Kamu:</span>
          <span className="text-sm font-black text-emerald-950 font-mono">{totalPoints} Poin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const isAffordable = totalPoints >= reward.pointsCost;
          const outOfStock = reward.stock <= 0;

          return (
            <div
              key={reward.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between gap-4 hover:shadow-md transition duration-150"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight line-clamp-1">{reward.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                    reward.type === 'siswa' ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {reward.type === 'siswa' ? 'Personal' : 'Kelas'}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-emerald-600 font-extrabold mt-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{reward.pointsCost} Poin Karakter</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed text-pretty">
                  {reward.description}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-150/40 text-xs">
                <span className="text-[10px] text-slate-400">Stok sisa: <span className="font-bold text-slate-600">{reward.stock} pcs</span></span>
                <button
                  disabled={outOfStock || isRedeeming !== null}
                  onClick={() => handleClaim(reward.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    outOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : isAffordable
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-sm'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-not-allowed'
                  }`}
                >
                  {outOfStock ? 'Habis' : isRedeeming === reward.id ? 'Mengklaim...' : 'Klaim'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
