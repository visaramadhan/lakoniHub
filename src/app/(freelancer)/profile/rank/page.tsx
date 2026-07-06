"use client";

import { useEffect, useMemo, useState } from 'react';
import { 
  Award, 
  Target, 
  TrendingUp, 
  Zap, 
  Star, 
  UserCheck,
  BarChart3,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';

export default function RankAndSkills() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/freelancer/rank-upgrade')
        ]);
        const uJson = await uRes.json();
        const rJson = await rRes.json();
        setUser(uJson);
        setRequests(Array.isArray(rJson) ? rJson : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentRank = user?.rank || 'D';
  const rankOrder: Record<string, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };
  const nextRank = useMemo(() => {
    const orderToRank: Record<number, string> = { 2: 'C', 3: 'B', 4: 'A', 5: 'S' };
    const next = (rankOrder[currentRank] || 1) + 1;
    return orderToRank[next] || currentRank;
  }, [currentRank]);

  const rankScore = useMemo(() => {
    const statsObj = user?.stats || {};
    const weights = [
      { key: 'initialScore', w: 0.2 },
      { key: 'clientSatisfaction', w: 0.3 },
      { key: 'projectSuccess', w: 0.2 },
      { key: 'deadlineAccuracy', w: 0.1 },
      { key: 'activity', w: 0.05 },
      { key: 'peerReview', w: 0.05 },
      { key: 'adminReview', w: 0.1 },
    ];
    const value = weights.reduce((acc, it) => acc + (Number(statsObj[it.key] || 0) * it.w), 0);
    return Math.round(value * 10) / 10;
  }, [user]);

  const minScoreMap: Record<string, number> = { C: 50, B: 65, A: 75, S: 85, D: 0 };
  const minScore = minScoreMap[nextRank] ?? 0;
  const canRequest = nextRank !== currentRank && rankScore >= minScore && !requests.some(r => r.status === 'PENDING');

  const stats = [
    { label: 'Initial Score', value: user?.stats?.initialScore || 0, weight: '20%' },
    { label: 'Client Satisfaction', value: user?.stats?.clientSatisfaction || 0, weight: '30%' },
    { label: 'Project Success', value: user?.stats?.projectSuccess || 0, weight: '20%' },
    { label: 'Deadline Accuracy', value: user?.stats?.deadlineAccuracy || 0, weight: '10%' },
    { label: 'Activity', value: user?.stats?.activity || 0, weight: '5%' },
    { label: 'Peer Review', value: user?.stats?.peerReview || 0, weight: '5%' },
    { label: 'Admin Review', value: user?.stats?.adminReview || 0, weight: '10%' },
  ];

  const submitRequest = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/freelancer/rank-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toRank: nextRank }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Gagal mengajukan');
        return;
      }
      setRequests([json, ...requests]);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rank & Performa</h2>
          <p className="text-gray-500 text-sm">Lihat statistik performa dan target kenaikan pangkat Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Rank Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8 bg-gradient-to-br from-primary to-accent-dark text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left space-y-2">
                <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest">Current Rank</p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h3 className="text-6xl font-black">{currentRank}</h3>
                  <div>
                    <RankBadge rank={currentRank} className="bg-white/20 border-white/30 text-white" />
                    <p className="text-indigo-200 text-xs mt-1">Senior Professional</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 w-full md:max-w-xs space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-indigo-300">Progress ke Rank {nextRank}</span>
                  <span>{rankScore} / {minScore}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 p-0.5 border border-white/10">
                  <div className="bg-white rounded-full h-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all" style={{ width: `${Math.min(100, Math.max(0, (rankScore / Math.max(1, minScore)) * 100))}%` }}></div>
                </div>
                <p className="text-[10px] text-indigo-300 italic text-center md:text-right">
                  Dibutuhkan skor minimal {minScore} untuk pengajuan kenaikan rank.
                </p>
              </div>
            </div>
            <Award className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 -rotate-12" />
          </div>

          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Rincian Skor Dinamis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{stat.label} <span className="text-[10px] text-gray-400">({stat.weight})</span></span>
                    <span className="text-sm font-bold text-gray-900">{stat.value}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${stat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" /> Skill Set
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Figma', 'React Native'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-bold border border-primary/10">
                  {skill}
                </span>
              ))}
            </div>
            <button className="w-full btn btn-secondary py-2 text-xs mt-2">
              Update Skill & Portofolio
            </button>
          </div>

          <div className="card p-6 bg-success-light border-success/20">
            <h3 className="font-bold text-success-dark flex items-center gap-2 mb-2">
              <Star className="h-5 w-5" /> Keuntungan Rank {currentRank}
            </h3>
            <ul className="space-y-2">
              {['Akses proyek Rank A & B', 'Fee distribution 30%', 'Prioritas Smart Matching', 'Bisa menjadi Team Lead'].map((benefit, i) => (
                <li key={i} className="text-xs text-success-dark/80 flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-success mt-1.5"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Test Kenaikan Rank
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Target: <span className="font-bold">Rank {nextRank}</span></p>
              <p className="text-xs text-gray-500">Syarat minimum score: <span className="font-bold">{minScore}</span>. Score Anda: <span className="font-bold text-primary">{rankScore}</span>.</p>
              {requests.find(r => r.status === 'PENDING') && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded text-xs text-orange-700 font-bold">
                  Pengajuan Anda sedang diproses admin.
                </div>
              )}
              {requests.find(r => r.status === 'REJECTED') && (
                <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700 font-bold">
                  Pengajuan sebelumnya ditolak. Silakan tingkatkan performa dan ajukan kembali.
                </div>
              )}
              {requests.find(r => r.status === 'APPROVED') && (
                <div className="p-3 bg-green-50 border border-green-100 rounded text-xs text-green-700 font-bold">
                  Pengajuan Anda disetujui. Silakan ikuti test yang tersedia.
                </div>
              )}
            </div>
            <button
              onClick={submitRequest}
              disabled={!canRequest || submitting}
              className="w-full btn btn-primary py-2 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Ajukan Test Kenaikan Rank
            </button>
            {!canRequest && (
              <div className="text-[10px] text-gray-400">
                {nextRank === currentRank ? 'Anda sudah di rank tertinggi.' : 'Pengajuan aktif jika tidak ada pengajuan pending dan syarat minimum tercapai.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
