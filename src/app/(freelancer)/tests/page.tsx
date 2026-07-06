"use client";

import { useEffect, useMemo, useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle2, 
  ChevronRight,
  AlertCircle,
  Globe,
  Zap,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FreelancerTests() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | 'GENERAL' | 'TECHNICAL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const category = filter === 'ALL' ? 'ALL' : filter;
      const res = await fetch(`/api/tests?category=${category}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submissionsByTestId = useMemo(() => {
    const map: Record<string, any> = {};
    for (const s of (data?.submissions || [])) {
      const testId = s.test?._id || s.test;
      if (testId && !map[testId]) map[testId] = s;
    }
    return map;
  }, [data]);

  const tests = useMemo(() => {
    const list: any[] = [];
    for (const t of (data?.generalTests || [])) list.push({ ...t, category: 'GENERAL' });
    for (const t of (data?.technicalTests || [])) list.push({ ...t, category: 'TECHNICAL' });
    return list;
  }, [data]);

  const filteredTests = useMemo(() => {
    if (filter === 'ALL') return tests;
    return tests.filter((t) => t.category === filter);
  }, [filter, tests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ujian & Sertifikasi</h2>
          <p className="text-gray-500 text-sm">Tingkatkan rank Anda dengan menyelesaikan ujian teknis dan non-teknis.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full md:w-fit">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${filter === 'ALL' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Semua
        </button>
        <button 
          onClick={() => setFilter('GENERAL')}
          className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${filter === 'GENERAL' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Globe className="h-3 w-3" /> Umum
        </button>
        <button 
          onClick={() => setFilter('TECHNICAL')}
          className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-2 transition-all ${filter === 'TECHNICAL' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Zap className="h-3 w-3" /> Technical
        </button>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 bg-orange-100 rounded-lg shrink-0">
          <AlertCircle className="h-6 w-6 text-orange-600" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-orange-800 text-lg">Peluang Promosi!</h3>
          <p className="text-sm text-orange-700 leading-relaxed">
            Technical test hanya akan muncul setelah pengajuan kenaikan rank Anda disetujui admin.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTests.map((test: any) => {
          const submission = submissionsByTestId[test._id];
          const status = submission ? 'COMPLETED' : 'AVAILABLE';
          return (
          <div key={test._id} className={`card p-6 border-l-4 transition-all hover:border-primary/40`} style={{ borderLeftColor: status === 'COMPLETED' ? '#059669' : '#14B8A6' }}>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {test.category === 'GENERAL' ? <Globe className="h-4 w-4 text-gray-400" /> : <Zap className="h-4 w-4 text-primary" />}
                    <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                  </div>
                  {status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> SELESAI
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-primary-light text-primary rounded text-[10px] font-bold uppercase tracking-wider">
                      Tersedia
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {test.type} • Passing Score: {test.passingScore} • Target Rank: {test.targetRank}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4" /> {(test.questions || []).length} Pertanyaan</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Rank Target: {test.targetRank}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 shrink-0 lg:w-48 lg:border-l lg:pl-6 lg:border-gray-100">
                {status === 'COMPLETED' ? (
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Skor Anda</p>
                    <p className="text-3xl font-black text-success">{submission.score}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => router.push(`/tests/take?testId=${test._id}`)}
                    className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    Mulai Ujian <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
