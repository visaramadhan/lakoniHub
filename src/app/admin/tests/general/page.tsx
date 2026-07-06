"use client";

import { useEffect, useMemo, useState } from 'react';
import { Plus, Globe, Loader2, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';

export default function AdminGeneralTests() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'SOP', targetRank: 'ALL', passingScore: 70 });
  const [submitting, setSubmitting] = useState(false);
  const [rankFilter, setRankFilter] = useState<'ALL' | 'S' | 'A' | 'B' | 'C' | 'D'>('ALL');

  useEffect(() => {
    fetchTests();
  }, [rankFilter]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tests?category=GENERAL&targetRank=${rankFilter}`);
      const json = await res.json();
      setTests(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
          category: 'GENERAL',
          type: form.type,
          targetRank: form.targetRank,
          passingScore: form.passingScore,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ title: '', type: 'SOP', targetRank: 'ALL', passingScore: 70 });
        fetchTests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => tests, [tests]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Tes Umum
          </h2>
          <p className="text-gray-500 text-sm">Ujian umum berlaku untuk semua posisi dan kebutuhan seleksi.</p>
        </div>
        <div className="flex gap-2">
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
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> + Test Umum
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((t) => (
            <div key={t._id} className="card p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{t.title}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                    {t.targetRank === 'ALL' ? 'Semua Rank' : `Target Rank: ${t.targetRank}`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{t.type} • Passing: {t.passingScore}</p>
              </div>
              <button className="p-2 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-gray-400">Belum ada test umum.</div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Tes Umum">
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
                <option value="SOP">SOP</option>
                <option value="SCREENING">Screening</option>
                <option value="INTERVIEW">Interview</option>
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

