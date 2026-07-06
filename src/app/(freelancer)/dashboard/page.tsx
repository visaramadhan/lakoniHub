"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Briefcase,
  DollarSign,
  Loader2,
  Target,
  TrendingUp,
  Wrench
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import { formatCurrency } from '@/lib/utils';

export default function FreelancerDashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/user/me');
        const json = await res.json();
        if (res.ok) {
          setUser(json);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const currentRank = useMemo(() => {
    const primaryPosition = (user?.positions || []).find((item: any) => item?.isPrimary);
    return primaryPosition?.rank || user?.rank || 'D';
  }, [user]);

  const nextRank = useMemo(() => {
    const order: Record<string, string> = { D: 'C', C: 'B', B: 'A', A: 'S', S: 'S' };
    return order[currentRank] || currentRank;
  }, [currentRank]);

  const rankScore = useMemo(() => {
    const stats = user?.stats || {};
    const weights = [
      { key: 'initialScore', weight: 0.2 },
      { key: 'clientSatisfaction', weight: 0.3 },
      { key: 'projectSuccess', weight: 0.2 },
      { key: 'deadlineAccuracy', weight: 0.1 },
      { key: 'activity', weight: 0.05 },
      { key: 'peerReview', weight: 0.05 },
      { key: 'adminReview', weight: 0.1 }
    ];
    const total = weights.reduce((acc, item) => acc + (Number(stats[item.key] || 0) * item.weight), 0);
    return Math.round(total * 10) / 10;
  }, [user]);

  const minScoreMap: Record<string, number> = { D: 0, C: 50, B: 65, A: 75, S: 85 };
  const targetScore = minScoreMap[nextRank] ?? 0;
  const progress = targetScore > 0 ? Math.min(100, Math.round((rankScore / targetScore) * 100)) : 100;
  const primaryPosition = (user?.positions || []).find((item: any) => item?.isPrimary)?.name || user?.position || '-';

  const stats = [
    { name: 'Rank Saat Ini', value: `Rank ${currentRank}`, icon: Award, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Posisi Utama', value: primaryPosition, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Saldo Wallet', value: formatCurrency(user?.wallet || 0), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Workload', value: `${Number(user?.currentWorkload || 0)}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card p-6 bg-gradient-to-r from-primary to-accent-dark text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <p className="text-primary-light text-sm font-medium">Profil Freelancer Aktif</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold">{user?.name || 'Freelancer'}</h2>
              <RankBadge rank={currentRank} className="bg-white/20 border-white/30 text-white" />
            </div>
            <p className="text-white/80 text-sm max-w-2xl">
              {user?.email || '-'} • Posisi utama {primaryPosition} • {Array.isArray(user?.skills) ? user.skills.length : 0} skill terdaftar.
            </p>
          </div>
          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Progress ke Rank {nextRank}</span>
              <span>{rankScore} / {targetScore || rankScore}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-white rounded-full h-3 transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-xl font-bold truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Posisi & Skill Saya</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(user?.positions || []).map((position: any, index: number) => (
              <div key={`${position.name}-${index}`} className="border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900">{position.name}</p>
                  <RankBadge rank={position.rank || user?.rank || 'D'} />
                </div>
                <p className="text-xs text-gray-500">{position.isPrimary ? 'Posisi utama akun Anda' : 'Posisi tambahan'}</p>
              </div>
            ))}
            {(!user?.positions || user.positions.length === 0) && (
              <div className="border rounded-xl p-4 text-sm text-gray-500">
                Belum ada posisi detail tersimpan. Posisi akun saat ini: {primaryPosition}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Skill</h3>
            <div className="flex flex-wrap gap-2">
              {(user?.skills || []).map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-bold border border-primary/10">
                  {skill}
                </span>
              ))}
              {(!user?.skills || user.skills.length === 0) && (
                <span className="text-sm text-gray-400">Belum ada skill tersimpan.</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="text-md font-bold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Target Promosi
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rank sekarang</span>
                <span className="font-bold">Rank {currentRank}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Target berikutnya</span>
                <span className="font-bold">Rank {nextRank}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Skor rank</span>
                <span className="font-bold">{rankScore}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="text-md font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" /> Ringkasan Akun
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Email: <span className="font-semibold text-gray-900">{user?.email || '-'}</span></p>
              <p>Status akun: <span className="font-semibold text-gray-900">{user?.status || '-'}</span></p>
              <p>Availability: <span className="font-semibold text-gray-900">{Number(user?.availability || 0)}%</span></p>
              <p>Reputation: <span className="font-semibold text-gray-900">{Number(user?.reputation || 0)}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
