"use client";

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Zap } from 'lucide-react';
import Modal from '@/components/Modal';

export default function AdminTechnicalTests() {
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [rankFilter, setRankFilter] = useState<'ALL' | 'S' | 'A' | 'B' | 'C' | 'D'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePosition, setActivePosition] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'TECHNICAL', targetRank: 'ALL', passingScore: 70 });

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchTests();
  }, [rankFilter, positions]);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/master-data?type=POSITION');
      const json = await res.json();
      setPositions(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await fetch(`/api/admin/tests?category=TECHNICAL&targetRank=${rankFilter}`);
      const json = await res.json();
      setTests(json);
    } catch (e) {
      console.error(e);
    }
  };

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const pos of positions) {
      map[pos.name] = [];
    }
    for (const t of tests) {
      const key = t.targetPosition || 'Lainnya';
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [positions, tests]);

  const openCreate = (posName: string) => {
    setActivePosition(posName);
    setForm({ title: '', type: 'TECHNICAL', targetRank: 'ALL', passingScore: 70 });
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: 'TECHNICAL',
          targetPosition: activePosition,
          type: form.type,
          targetRank: form.targetRank,
          passingScore: form.passingScore,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchTests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" /> Tes Teknis (Per Posisi)
          </h2>
          <p className="text-gray-500 text-sm">Pilih posisi, kelola test, dan filter berdasarkan target rank.</p>
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm focus:outline-none"
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value as any)}
        >
          <option value="ALL">Semua Rank</option>
          <option value="S">Rank S</option>
          <option value="A">Rank A</option>
          <option value="B">Rank B</option>
          <option value="C">Rank C</option>
          <option value="D">Rank D</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(grouped).map(([posName, list]) => (
            <div key={posName} className="card overflow-hidden">
              <div className="p-4 border-b bg-orange-50/40 flex items-center justify-between">
                <div className="font-bold text-gray-900">{posName}</div>
                <button onClick={() => openCreate(posName)} className="btn btn-primary py-1.5 px-3 text-xs flex items-center gap-2">
                  <Plus className="h-4 w-4" /> + Test
                </button>
              </div>
              <div className="divide-y">
                {list.map((t) => (
                  <div key={t._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{t.title}</p>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                          {t.targetRank === 'ALL' ? 'Semua Rank' : `Target Rank: ${t.targetRank}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{t.type} • Passing: {t.passingScore}</p>
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">Belum ada test untuk posisi ini.</div>
                )}
              </div>
            </div>
          ))}
          {positions.length === 0 && (
            <div className="card p-8 text-center text-gray-400">Tambahkan POSITION di Master Data untuk menampilkan kartu tes teknis.</div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Buat Tes Teknis: ${activePosition}`}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
            <input
              className="w-full px-3 py-2 border rounded-md"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="TECHNICAL">Technical (MCQ)</option>
                <option value="MINI_PROJECT">Mini Project</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Rank</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={form.targetRank}
                onChange={(e) => setForm({ ...form, targetRank: e.target.value })}
              >
                <option value="ALL">Semua Rank</option>
                <option value="S">Rank S</option>
                <option value="A">Rank A</option>
                <option value="B">Rank B</option>
                <option value="C">Rank C</option>
                <option value="D">Rank D</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score</label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-md"
                value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value || 0) })}
                required
              />
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-6 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

