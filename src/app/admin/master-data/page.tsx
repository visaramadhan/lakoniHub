"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Briefcase, 
  Layers, 
  Settings2,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

export default function MasterDataPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'POSITION' | 'PROJECT_TYPE' | 'SKILL'>('POSITION');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/master-data?type=${activeTab}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: activeTab }),
      });
      if (res.ok) {
        setFormData({ name: '', description: '' });
        setIsModalOpen(false);
        fetchData();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      await fetch(`/api/admin/master-data?id=${id}`, { method: 'DELETE' });
      fetchData();
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'POSITION', label: 'Posisi', icon: Briefcase },
    { id: 'PROJECT_TYPE', label: 'Jenis Proyek', icon: Layers },
    { id: 'SKILL', label: 'Keahlian / Skill', icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Data</h2>
          <p className="text-gray-500 text-sm">Kelola variabel dasar sistem seperti posisi, jenis proyek, dan skill.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah {tabs.find(t => t.id === activeTab)?.label}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full md:w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === tab.id 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Cari ${tabs.find(t => t.id === activeTab)?.label}...`}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Deskripsi</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Belum ada data</td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Aktif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button className="p-1.5 hover:bg-primary-light rounded text-gray-400 hover:text-primary transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Tambah ${tabs.find(t => t.id === activeTab)?.label}`}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama {tabs.find(t => t.id === activeTab)?.label}</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
              placeholder="Masukkan nama..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea 
              className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
              rows={3} 
              placeholder="Berikan keterangan singkat..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6" disabled={submitting}>Batal</button>
            <button type="submit" className="btn btn-primary px-6 flex items-center gap-2" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
