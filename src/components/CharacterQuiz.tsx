import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, AlertCircle, Sparkle } from 'lucide-react';
import { QuizQuestion, User } from '../types';

interface CharacterQuizProps {
  quizList: QuizQuestion[];
  currentUser: User;
  onQuizSuccess: () => void;
  apiCall: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export default function CharacterQuiz({ quizList, currentUser, onQuizSuccess, apiCall }: CharacterQuizProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (quizList.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-100">
        <p className="text-slate-400 text-sm">Tidak ada pertanyaan kuis yang tersedia dalam pangkalan data.</p>
      </div>
    );
  }

  const activeQuiz = quizList[activeIndex];

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    setIsSubmitting(true);

    const checkCorrect = selectedOption === activeQuiz.correctAnswerIndex;
    try {
      const res = await apiCall('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quizId: activeQuiz.id,
          isCorrect: checkCorrect,
        }),
      });

      const data = await res.json();
      setIsCorrect(checkCorrect);
      setFeedback(activeQuiz.explanation);
      setStatus('submitted');
      onQuizSuccess(); // Refresh point statistics on top parent
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setStatus('idle');
    setFeedback('');
    setActiveIndex((prev) => (prev + 1) % quizList.length);
  };

  return (
    <div id="character-quiz" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="bg-amber-100 text-amber-700 p-2.5 rounded-2xl">
          <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Asah Karakter & Sopan Santun</h3>
          <p className="text-xs text-slate-500">Kumpulkan poin karakter dengan melatih respons etis terbaikmu</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/55">
        <span>Soal Ke-{activeIndex + 1} dari {quizList.length}</span>
        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">+{activeQuiz.pointsReward} Poin</span>
      </div>

      <div className="p-4 bg-indigo-50/50 border border-indigo-100/30 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-800 leading-relaxed font-sans">
          {activeQuiz.question}
        </h4>
      </div>

      <div className="flex flex-col gap-2">
        {activeQuiz.options.map((option, idx) => (
          <button
            key={idx}
            disabled={status === 'submitted'}
            onClick={() => setSelectedOption(idx)}
            className={`w-full text-left p-4 rounded-2xl text-xs transition-all border flex items-start gap-3.5 ${
              selectedOption === idx
                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold'
                : 'bg-white border-slate-150 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold border ${
              selectedOption === idx
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 border-slate-350 text-slate-500'
            }`}>
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="leading-tight">{option}</span>
          </button>
        ))}
      </div>

      {status === 'submitted' ? (
        <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-150 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                🎉 Jawaban Benar!
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                💔 Kurang Tepat
              </span>
            )}
            <span className="text-[11px] text-indigo-700 font-bold">
              {isCorrect ? `+${activeQuiz.pointsReward} Poin ditambahkan!` : 'Yuk, coba lagi di soal berikutnya!'}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
            <span className="font-bold">Penjelasan:</span> {feedback}
          </p>
          <button
            onClick={handleNext}
            className="mt-1 self-start bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition shadow-md shadow-indigo-100"
          >
            Pertanyaan Selanjutnya
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-3 rounded-xl transition shadow-md self-start"
        >
          {isSubmitting ? 'Memproses jawaban...' : 'Kirim Jawaban'}
        </button>
      )}
    </div>
  );
}
