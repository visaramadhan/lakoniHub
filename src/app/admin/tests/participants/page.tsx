"use client";

import { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  ChevronRight,
  Loader2,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TestParticipants() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'PARTICIPANTS'>('REQUESTS');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'PARTICIPANTS') {
      fetchParticipants();
    } else {
      fetchRequests();
    }
  }, [activeTab]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      // Fetch users who are approved (passed CV screening)
      const res = await fetch('/api/admin/users/approve?approved=true');
      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rank-upgrade?status=PENDING');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'APPROVE' ? 'menyetujui' : 'menolak'} pengajuan ini?`)) return;
    try {
      const res = await fetch('/api/admin/rank-upgrade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Detail Peserta Tes</h2>
          <p className="text-gray-500 text-sm">Monitor progres dan hasil ujian kandidat.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'REQUESTS' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Pengajuan Kenaikan Rank
        </button>
        <button 
          onClick={() => setActiveTab('PARTICIPANTS')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'PARTICIPANTS' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Peserta Tes
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari nama atau email peserta..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        activeTab === 'REQUESTS' ? (
          <div className="card overflow-hidden">
            <div className="p-6 border-b bg-primary-light/30">
              <h3 className="font-bold text-primary-dark flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Pengajuan Test Kenaikan Rank (Pending)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Freelancer</th>
                    <th className="px-6 py-4">Target</th>
                    <th className="px-6 py-4">Pencapaian</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {requests.filter((r: any) =>
                    r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((r: any) => (
                    <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{r.user?.name}</div>
                        <div className="text-gray-500 text-xs">{r.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                          {r.fromRank} → {r.toRank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          Score: <span className="font-bold text-primary">{r.snapshot?.rankScore || 0}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Project DONE: <span className="font-bold">{r.snapshot?.projectsDone || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => router.push(`/admin/freelancers/${r.user?._id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" /> Detail
                        </button>
                        <button
                          onClick={() => handleRequestAction(r._id, 'REJECT')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Tolak
                        </button>
                        <button
                          onClick={() => handleRequestAction(r._id, 'APPROVE')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-bold hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Setujui
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada pengajuan pending.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {participants.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              p.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((participant) => (
              <div key={participant._id} className="card p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary/40 transition-all group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {participant.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{participant.name}</h3>
                    <p className="text-xs text-gray-500">{participant.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                        {participant.position || 'N/A'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Diterima pada: {new Date(participant.updatedAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 px-8 border-x hidden md:flex">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Tes Umum</p>
                    <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Belum Selesai</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Tes Technical</p>
                    <div className="flex items-center gap-1.5 text-gray-400 font-bold">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Pending</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-secondary py-2 px-4 text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Detail
                  </button>
                  <button className="btn btn-primary py-2 px-4 text-sm flex items-center gap-2">
                    Lihat Hasil <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                Tidak ada peserta dalam tahap tes.
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
