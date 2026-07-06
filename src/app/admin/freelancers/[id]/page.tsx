"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Loader2, Mail, User } from 'lucide-react';
import RankBadge from '@/components/RankBadge';

export default function AdminFreelancerDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const freelancerId = params?.id;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!freelancerId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${freelancerId}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [freelancerId]);

  const rankScore = useMemo(() => {
    const u = data?.user;
    if (!u) return 0;
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
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <div className="card p-6 text-gray-500">Data freelancer tidak ditemukan.</div>
      </div>
    );
  }

  const u = data.user;
  const submissions = data.submissions || [];

  const statsRows = [
    { label: 'Initial Score', key: 'initialScore' },
    { label: 'Client Satisfaction', key: 'clientSatisfaction' },
    { label: 'Project Success', key: 'projectSuccess' },
    { label: 'Deadline Accuracy', key: 'deadlineAccuracy' },
    { label: 'Activity', key: 'activity' },
    { label: 'Peer Review', key: 'peerReview' },
    { label: 'Admin Review', key: 'adminReview' },
    { label: 'Complaint Rate', key: 'complaintRate' },
    { label: 'Collaboration', key: 'collaboration' },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="card p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{u.name}</h2>
              <RankBadge rank={u.rank} />
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-bold">Rank - {u.rank || '-'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" /> {u.email}</span>
              <span className="inline-flex items-center gap-1"><User className="h-4 w-4" /> {u.position || 'N/A'}</span>
              <span className="text-primary font-bold">Scoring: {rankScore}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {u.cvUrl ? (
              <a href={u.cvUrl} target="_blank" rel="noreferrer" className="btn btn-secondary flex items-center gap-2">
                <FileText className="h-4 w-4" /> Buka CV
              </a>
            ) : (
              <button className="btn btn-secondary flex items-center gap-2" disabled>
                <FileText className="h-4 w-4" /> CV Belum Ada
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(u.skills || []).map((s: string) => (
            <span key={s} className="px-2 py-1 bg-primary-light text-primary rounded-full text-xs font-bold border border-primary/10">
              {s}
            </span>
          ))}
          {(u.skills || []).length === 0 && (
            <span className="text-sm text-gray-400 italic">Belum ada skill</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Parameter Nilai (0-100)</h3>
          <div className="space-y-3">
            {statsRows.map((row) => {
              const val = Number(u.stats?.[row.key] || 0);
              return (
                <div key={row.key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{row.label}</span>
                    <span className="font-bold text-gray-900">{val}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary rounded-full h-1.5" style={{ width: `${Math.min(100, Math.max(0, val))}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Riwayat Hasil Test</h3>
          <div className="space-y-3">
            {submissions.map((s: any) => (
              <div key={s._id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{s.test?.title || 'Test'}</p>
                    <p className="text-xs text-gray-500">
                      {s.test?.category} • {s.test?.type} {s.test?.targetPosition ? `• ${s.test.targetPosition}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{s.score || 0}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{s.status}</p>
                  </div>
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <div className="text-sm text-gray-400 italic">Belum ada riwayat test.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
