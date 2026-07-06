"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function TakeTestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/tests/${testId}`);
        const json = await res.json();
        setTest(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  const questions = useMemo(() => test?.questions || [], [test]);

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleSubmit = async () => {
    if (!testId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        setIsFinished(true);
      } else {
        const json = await res.json();
        alert(json.message || 'Gagal submit');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!testId || !test) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Test tidak ditemukan</h2>
        <button onClick={() => router.push('/tests')} className="btn btn-primary px-8">Kembali</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900">Ujian Selesai!</h2>
        <p className="text-gray-600">Jawaban Anda telah berhasil dikirim. Admin akan segera melakukan review terhadap hasil ujian Anda.</p>
        <button 
          onClick={() => router.push('/tests')}
          className="btn btn-primary px-8"
        >
          Kembali ke Daftar Ujian
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Test */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{test.title}</h2>
          <p className="text-sm text-gray-500">Kategori: {test.category} | Tipe: {test.type} | Target Rank: {test.targetRank}</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-mono font-bold">
          <Clock className="h-5 w-5" />
          --
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          Test ini belum memiliki pertanyaan.
          <div className="pt-4">
            <button onClick={() => router.push('/tests')} className="btn btn-primary px-8">Kembali</button>
          </div>
        </div>
      ) : (
      <>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Selesai</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card p-8 space-y-8">
        <h3 className="text-xl font-medium text-gray-900 leading-relaxed">
          {questions[currentQuestion].text}
        </h3>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                answers[currentQuestion] === index 
                  ? 'border-primary bg-primary-light/30 text-primary font-bold' 
                  : 'border-gray-100 hover:border-gray-200 text-gray-600'
              }`}
            >
              <span>{option}</span>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                answers[currentQuestion] === index ? 'border-primary bg-primary' : 'border-gray-300'
              }`}>
                {answers[currentQuestion] === index && <div className="h-2 w-2 bg-white rounded-full"></div>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          className="btn btn-secondary flex items-center gap-2 px-6 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary bg-success hover:bg-success-dark border-none flex items-center gap-2 px-8 shadow-lg shadow-success/20 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Selesaikan Ujian
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            className="btn btn-primary flex items-center gap-2 px-8"
          >
            Selanjutnya <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Pastikan koneksi internet stabil. Jawaban akan disimpan secara otomatis setiap kali Anda menekan tombol selanjutnya. Jangan menutup halaman sebelum menekan tombol "Selesaikan Ujian".
        </p>
      </div>
      </>
      )}
    </div>
  );
}

export default function TakeTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <TakeTestPageContent />
    </Suspense>
  );
}
