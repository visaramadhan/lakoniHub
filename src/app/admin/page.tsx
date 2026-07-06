"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  FolderKanban, 
  FileCheck, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  Zap,
  Loader2
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: { totalFreelancers: 0, activeProjects: 0, pendingReview: 0, totalEarnings: 0 },
    pendingUsers: [],
    recentProjects: [],
    topFreelancers: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    if (!confirm(`Apakah Anda yakin ingin ${action === 'APPROVE' ? 'menyetujui' : 'menolak'} user ini?`)) return;
    
    try {
      const res = await fetch('/api/admin/users/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        fetchDashboardData();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stats = [
    { name: 'Total Freelancer', value: data.stats.totalFreelancers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Proyek Aktif', value: data.stats.activeProjects.toString(), icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Menunggu Review', value: data.stats.pendingReview.toString(), icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Total Earning', value: formatCurrency(data.stats.totalEarnings), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approval Section */}
      <div className="card">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold">Persetujuan User Baru</h2>
          </div>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold">
            {data.pendingUsers.length} Menunggu
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Tanggal Daftar</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {data.pendingUsers.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === 'FREELANCER' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleAction(user._id, 'REJECT')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      <UserX className="h-3.5 w-3.5" /> Tolak
                    </button>
                    <button 
                      onClick={() => handleAction(user._id, 'APPROVE')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-success hover:bg-success-light px-2 py-1 rounded transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Setujui
                    </button>
                  </td>
                </tr>
              ))}
              {data.pendingUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    Tidak ada persetujuan user baru saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="card">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Proyek Terbaru</h2>
            <button onClick={() => router.push('/admin/projects')} className="text-primary text-sm font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y">
            {data.recentProjects.map((project: any) => (
              <div key={project._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/projects/${project._id}`)}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{project.title}</p>
                    <RankBadge rank={project.rank} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="font-medium text-success">{formatCurrency(project.budget)}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    project.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 
                    project.status === 'ON_PROGRESS' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {project.status}
                  </span>
                  <p className="text-[10px] text-gray-400 font-medium">{project.team?.length || 0} Members</p>
                </div>
              </div>
            ))}
            {data.recentProjects.length === 0 && (
              <div className="p-8 text-center text-gray-400">Belum ada proyek.</div>
            )}
          </div>
        </div>

        {/* Top Freelancers */}
        <div className="card">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Freelancer Unggulan</h2>
            <button onClick={() => router.push('/admin/freelancers')} className="text-primary text-sm font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="divide-y">
            {data.topFreelancers.map((freelancer: any) => (
              <div key={freelancer._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {freelancer.name.split(' ').map((n: any) => n[0]).join('')}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{freelancer.name}</p>
                      <RankBadge rank={freelancer.rank} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills?.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{freelancer.stats?.initialScore || 0}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Reputation: {freelancer.reputation || 0}</p>
                </div>
              </div>
            ))}
            {data.topFreelancers.length === 0 && (
              <div className="p-8 text-center text-gray-400">Belum ada freelancer aktif.</div>
            )}
          </div>
        </div>
      </div>

      {/* STMS Alert Section */}
      <div className="bg-primary-light border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-primary-dark">Smart Team Matching System (STMS)</h3>
          <p className="text-sm text-gray-600">Ada {data.stats.activeProjects} proyek berjalan yang sedang dipantau. Biarkan AI kami merekomendasikan komposisi freelancer terbaik berdasarkan skill dan rank.</p>
        </div>
        <button className="btn btn-primary whitespace-nowrap">Jalankan STMS Engine</button>
      </div>
    </div>
  );
}
