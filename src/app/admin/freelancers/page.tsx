"use client";

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  UserCheck, 
  Award,
  Star,
  Activity,
  MoreVertical,
  Plus,
  Lock,
  User,
  FileText,
  XCircle,
  CheckCircle2,
  Eye,
  Loader2,
  Upload,
  Calendar
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import Modal from '@/components/Modal';
import { useRouter } from 'next/navigation';

export default function AdminFreelancers() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [rankFilter, setRankFilter] = useState<'ALL' | 'S' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'NEW' | 'REJECTED' | 'PARTY'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [pendingFreelancers, setPendingFreelancers] = useState<any[]>([]);
  const [rejectedFreelancers, setRejectedFreelancers] = useState<any[]>([]);
  const [partyTemplates, setPartyTemplates] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [isRecruitmentModalOpen, setIsRecruitmentModalOpen] = useState(false);
  const [recruitmentPeriod, setRecruitmentPeriod] = useState({ startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    skills: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [partyForm, setPartyForm] = useState({
    name: '',
    description: '',
    members: [{ userId: '', position: '', rank: 'C' }]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [activeTab, rankFilter]);

  const fetchInitialData = async () => {
    try {
      const [pendingRes, posRes, settingRes, activeRes, partyRes] = await Promise.all([
        fetch('/api/admin/users/approve?approved=false'),
        fetch('/api/admin/master-data?type=POSITION'),
        fetch('/api/admin/settings?key=RECRUITMENT_PERIOD'),
        fetch('/api/admin/users/approve?approved=true&rank=ALL'),
        fetch('/api/admin/party-templates')
      ]);
      const pendingData = await pendingRes.json();
      const posData = await posRes.json();
      const settingData = await settingRes.json();
      const activeData = await activeRes.json();
      const partyData = await partyRes.json();
      
      setPendingFreelancers(pendingData);
      setPositions(posData);
      setFreelancers(activeData);
      setPartyTemplates(partyData);
      if (settingData?.value) {
        setRecruitmentPeriod(settingData.value);
      }
      
      if (posData.length > 0) {
        setFormData(prev => ({ ...prev, position: posData[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRecruitment = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'RECRUITMENT_PERIOD',
          value: recruitmentPeriod,
          description: 'Periode pendaftaran freelancer'
        }),
      });
      if (res.ok) {
        alert('Periode rekrutmen berhasil disimpan');
        setIsRecruitmentModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFreelancers = async () => {
    if (activeTab === 'PARTY') {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/party-templates');
        const data = await res.json();
        setPartyTemplates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      let statusParam = 'APPROVED';
      if (activeTab === 'NEW') statusParam = 'PENDING';
      if (activeTab === 'REJECTED') statusParam = 'REJECTED';

      const res = await fetch(`/api/admin/users/approve?approved=${activeTab === 'ACTIVE'}&status=${statusParam}&rank=${rankFilter}`);
      const data = await res.json();
      
      if (activeTab === 'ACTIVE') {
        setFreelancers(data);
      } else if (activeTab === 'NEW') {
        setPendingFreelancers(data);
      } else {
        setRejectedFreelancers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateRankScore = (u: any) => {
    const stats = u?.stats || {};
    const weights = [
      { key: 'initialScore', w: 0.2 },
      { key: 'clientSatisfaction', w: 0.3 },
      { key: 'projectSuccess', w: 0.2 },
      { key: 'deadlineAccuracy', w: 0.1 },
      { key: 'activity', w: 0.05 },
      { key: 'peerReview', w: 0.05 },
      { key: 'adminReview', w: 0.1 },
    ];
    const value = weights.reduce((acc, it) => acc + (Number(stats[it.key] || 0) * it.w), 0);
    return Math.round(value * 10) / 10;
  };

  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'APPROVE' ? 'menerima' : 'menolak'} freelancer ini?`)) return;
    
    try {
      const res = await fetch('/api/admin/users/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        fetchFreelancers();
        fetchInitialData(); // Refresh pending count
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.message || 'Gagal memproses aksi');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Simulate file upload or handle actual if needed
      // For now, we'll just send the metadata
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          role: 'FREELANCER', 
          cvName: cvFile?.name || 'CV_Admin_Added.pdf' 
        }),
      });
      
      if (res.ok) {
        setFormData({ 
          name: '', 
          email: '', 
          password: '', 
          position: positions.length > 0 ? positions[0].name : '',
          skills: '' 
        });
        setCvFile(null);
        setIsModalOpen(false);
        fetchFreelancers();
        router.refresh();
        alert('Freelancer berhasil didaftarkan');
      } else {
        const error = await res.json();
        alert(error.message || 'Gagal mendaftarkan freelancer');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setSubmitting(false);
    }
  };

  const addPartyMemberRow = () => {
    setPartyForm((prev) => ({
      ...prev,
      members: [...prev.members, { userId: '', position: '', rank: 'C' }]
    }));
  };

  const updatePartyMemberRow = (index: number, key: string, value: string) => {
    setPartyForm((prev) => ({
      ...prev,
      members: prev.members.map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const removePartyMemberRow = (index: number) => {
    setPartyForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const members = partyForm.members
        .filter((item) => item.userId && item.position)
        .map((item) => ({ user: item.userId, position: item.position, rank: item.rank }));
      const res = await fetch('/api/admin/party-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partyForm.name,
          description: partyForm.description,
          members,
        }),
      });
      if (res.ok) {
        setPartyForm({ name: '', description: '', members: [{ userId: '', position: '', rank: 'C' }] });
        setIsPartyModalOpen(false);
        fetchFreelancers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParty = async (id: string) => {
    if (!confirm('Hapus party template ini?')) return;
    try {
      await fetch(`/api/admin/party-templates?id=${id}`, { method: 'DELETE' });
      fetchFreelancers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Freelancer</h2>
          <p className="text-gray-500 text-sm">Monitor performa, rank, dan beban kerja tim.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsRecruitmentModalOpen(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" /> Atur Recruitment
          </button>
          <button 
            onClick={() => activeTab === 'PARTY' ? setIsPartyModalOpen(true) : setIsModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> {activeTab === 'PARTY' ? 'Tambah Party' : 'Tambah Freelancer'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'ACTIVE' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Daftar Freelancer
        </button>
        <button 
          onClick={() => setActiveTab('NEW')}
          className={`px-6 py-2 text-sm font-bold rounded-md flex items-center gap-2 transition-all ${activeTab === 'NEW' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          New Freelance
          <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-[10px]">
            {pendingFreelancers.length}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('REJECTED')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'REJECTED' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Ditolak
        </button>
        <button 
          onClick={() => setActiveTab('PARTY')}
          className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'PARTY' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Party Template
        </button>
      </div>

      {activeTab === 'ACTIVE' ? (
        <>
          {/* Filters */}
          <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Cari nama, email, atau skill..."
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <select
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none"
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
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {freelancers.filter(f => 
                f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                f.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((f) => (
                <div
                  key={f._id}
                  className="card p-6 space-y-4 hover:border-primary/40 transition-all group cursor-pointer"
                  onClick={() => router.push(`/admin/freelancers/${f._id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg shadow-inner">
                        {f.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{f.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" /> {f.email}
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">
                      Rank - {f.rank || '-'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-gray-50">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Rank</span>
                      <RankBadge rank={f.rank} className="mt-1" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Scoring</span>
                      <span className="text-sm font-bold text-primary mt-1">{calculateRankScore(f)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Workload</span>
                      <span className="text-sm font-bold text-success mt-1">{f.currentWorkload || 0}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">Posisi</span>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                          {f.position || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/admin/freelancers/${f._id}`)}
                      className="flex-1 btn btn-secondary py-1.5 text-xs"
                    >
                      Lihat Detail
                    </button>
                    <button 
                      onClick={() => handleAction(f._id, 'REJECT')}
                      className="flex-1 btn bg-red-50 text-red-600 border-red-100 hover:bg-red-100 py-1.5 text-xs font-bold"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
              {freelancers.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  Tidak ada freelancer aktif.
                </div>
              )}
            </div>
          )}
        </>
      ) : activeTab === 'NEW' ? (
        <div className="card overflow-hidden">
          <div className="p-6 border-b bg-orange-50/50">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Review Pendaftaran Freelancer
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Kandidat</th>
                    <th className="px-6 py-4">Posisi Dilamar</th>
                    <th className="px-6 py-4">Dokumen CV</th>
                    <th className="px-6 py-4">Tanggal Daftar</th>
                    <th className="px-6 py-4 text-right">Aksi Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {pendingFreelancers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                          {user.position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.cvUrl ? (
                          <a
                            href={user.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline font-medium"
                          >
                            <FileText className="h-4 w-4" /> {user.cvName || 'cv.pdf'}
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 text-gray-400 font-medium">
                            <FileText className="h-4 w-4" /> {user.cvName || 'cv.pdf'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleAction(user._id, 'REJECT')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Tolak
                        </button>
                        <button 
                          onClick={() => handleAction(user._id, 'APPROVE')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-bold hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Accept ke Tes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingFreelancers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada pendaftaran baru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'REJECTED' ? (
        <div className="card overflow-hidden">
          <div className="p-6 border-b bg-red-50/50">
            <h3 className="font-bold text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Freelancer yang Ditolak
            </h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                  <tr>
                    <th className="px-6 py-4">Kandidat</th>
                    <th className="px-6 py-4">Posisi</th>
                    <th className="px-6 py-4">Alasan (Status)</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {rejectedFreelancers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                          {user.position}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">
                          Ditolak
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-md text-xs font-bold">
                          <XCircle className="h-4 w-4" /> Tidak dapat dipulihkan
                        </span>
                      </td>
                    </tr>
                  ))}
                  {rejectedFreelancers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Tidak ada data freelancer yang ditolak.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {partyTemplates.map((party) => (
                <div key={party._id} className="card p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{party.name}</h3>
                      <p className="text-xs text-gray-500">{party.description || 'Tanpa deskripsi'}</p>
                    </div>
                    <button onClick={() => handleDeleteParty(party._id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(party.members || []).map((member: any, index: number) => (
                      <div key={index} className="p-2 border rounded-lg">
                        <p className="text-sm font-semibold text-gray-900">{member.user?.name || 'Freelancer'}</p>
                        <p className="text-[11px] text-gray-500">{member.position} • Rank {member.rank}</p>
                      </div>
                    ))}
                    {(party.members || []).length === 0 && (
                      <div className="text-sm text-gray-400">Belum ada member di party ini.</div>
                    )}
                  </div>
                </div>
              ))}
              {partyTemplates.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                  Belum ada party template.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Freelancer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Daftarkan Freelancer Baru"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400"><User className="h-4 w-4" /></span>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  placeholder="Budi Santoso" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400"><Mail className="h-4 w-4" /></span>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  placeholder="budi@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400"><Lock className="h-4 w-4" /></span>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  placeholder="********" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
              <select 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              >
                {positions.map((pos) => (
                  <option key={pos._id} value={pos.name}>{pos.name}</option>
                ))}
                {positions.length === 0 && (
                  <option disabled>Tambahkan posisi di Master Data</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keahlian / Skills</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                placeholder="e.g. React, Node.js, UI/UX (Pisahkan dengan koma)" 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload CV (PDF/DOCX)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById('cv-upload')?.click()}>
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none">
                      {cvFile ? cvFile.name : 'Klik untuk upload CV'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                </div>
                <input 
                  id="cv-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6">Batal</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-6 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Daftarkan
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isPartyModalOpen} 
        onClose={() => setIsPartyModalOpen(false)} 
        title="Buat Party Template"
      >
        <form className="space-y-4" onSubmit={handleSaveParty}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Party</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={partyForm.name}
              onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
              placeholder="Contoh: Party Frontend Alpha"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              value={partyForm.description}
              onChange={(e) => setPartyForm({ ...partyForm, description: e.target.value })}
              placeholder="Kombinasi tim reusable untuk kebutuhan proyek."
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Member Party</label>
              <button type="button" onClick={addPartyMemberRow} className="text-primary text-xs font-bold hover:underline">
                + Tambah Member
              </button>
            </div>
            {partyForm.members.map((member, index) => {
              const selectedUser = freelancers.find((item) => item._id === member.userId);
              const availablePositions = Array.isArray(selectedUser?.positions) && selectedUser.positions.length > 0
                ? selectedUser.positions
                : selectedUser?.position
                  ? [{ name: selectedUser.position, rank: selectedUser.rank || 'C' }]
                  : [];
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-lg bg-gray-50">
                  <select className="w-full px-3 py-2 border rounded-md" value={member.userId} onChange={(e) => updatePartyMemberRow(index, 'userId', e.target.value)}>
                    <option value="">Pilih freelancer</option>
                    {freelancers.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                  <select className="w-full px-3 py-2 border rounded-md" value={member.position} onChange={(e) => {
                    updatePartyMemberRow(index, 'position', e.target.value);
                    const matched = availablePositions.find((pos: any) => pos.name === e.target.value);
                    if (matched?.rank) updatePartyMemberRow(index, 'rank', matched.rank);
                  }}>
                    <option value="">Pilih jobdesk</option>
                    {availablePositions.map((pos: any, posIndex: number) => (
                      <option key={`${pos.name}-${posIndex}`} value={pos.name}>{pos.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <select className="w-full px-3 py-2 border rounded-md" value={member.rank} onChange={(e) => updatePartyMemberRow(index, 'rank', e.target.value)}>
                      <option value="S">Rank S</option>
                      <option value="A">Rank A</option>
                      <option value="B">Rank B</option>
                      <option value="C">Rank C</option>
                      <option value="D">Rank D</option>
                    </select>
                    {partyForm.members.length > 1 && (
                      <button type="button" onClick={() => removePartyMemberRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsPartyModalOpen(false)} className="btn btn-secondary px-6">Batal</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-6 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Party
            </button>
          </div>
        </form>
      </Modal>

      {/* Recruitment Setting Modal */}
      <Modal 
        isOpen={isRecruitmentModalOpen} 
        onClose={() => setIsRecruitmentModalOpen(false)} 
        title="Atur Periode Rekrutmen"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">Tentukan periode di mana halaman registrasi dapat diakses oleh publik.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                value={recruitmentPeriod.startDate}
                onChange={(e) => setRecruitmentPeriod({ ...recruitmentPeriod, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                value={recruitmentPeriod.endDate}
                onChange={(e) => setRecruitmentPeriod({ ...recruitmentPeriod, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsRecruitmentModalOpen(false)} className="btn btn-secondary px-6">Batal</button>
            <button 
              onClick={handleSaveRecruitment} 
              disabled={submitting} 
              className="btn btn-primary px-6 flex items-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Periode
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
