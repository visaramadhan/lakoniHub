"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, Calendar, FileText, Loader2, Send, Users } from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import { formatCurrency } from '@/lib/utils';

export default function FreelancerProjectDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [parties, setParties] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const [projectRes, userRes, partyRes, applicationRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch('/api/user/me'),
          fetch('/api/freelancer/parties'),
          fetch(`/api/freelancer/project-applications?projectId=${projectId}`)
        ]);

        const [projectJson, userJson, partyJson, applicationJson] = await Promise.all([
          projectRes.json(),
          userRes.json(),
          partyRes.json(),
          applicationRes.json()
        ]);

        setProject(projectJson);
        setUser(userJson);
        setParties(Array.isArray(partyJson) ? partyJson : []);
        setApplications(Array.isArray(applicationJson) ? applicationJson : []);

        const firstPosition = (projectJson?.requiredPositions || [])[0]?.position || '';
        setSelectedPosition(firstPosition);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [projectId]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!project?._id) {
    return <div className="card p-8 text-center text-gray-400">Proyek tidak ditemukan.</div>;
  }

  const getUserPositions = (sourceUser: any) => {
    if (Array.isArray(sourceUser?.positions) && sourceUser.positions.length > 0) {
      return sourceUser.positions;
    }

    if (sourceUser?.position) {
      return [{ name: sourceUser.position, rank: sourceUser.rank || 'C', isPrimary: true }];
    }

    return [];
  };

  const userPositionNames = useMemo(
    () => getUserPositions(user).map((item: any) => item.name),
    [user]
  );

  const applyToProject = async (applicationType: 'DIRECT' | 'PARTY') => {
    if (!selectedPosition) {
      alert('Pilih posisi yang ingin Anda lamar.');
      return;
    }

    if (applicationType === 'PARTY' && !selectedPartyId) {
      alert('Pilih party yang ingin diajukan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: selectedPosition,
          note,
          applicationType,
          partyId: applicationType === 'PARTY' ? selectedPartyId : undefined
        })
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.message || 'Gagal mengirim pengajuan');
        return;
      }

      setApplications((prev) => [json, ...prev]);
      setNote('');
      alert(applicationType === 'PARTY' ? 'Party berhasil diajukan ke project.' : 'Apply posisi berhasil dikirim.');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengirim pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <RankBadge rank={project.rank} />
        </div>
        <p className="text-sm text-gray-600">{project.description}</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-gray-700">
            <Briefcase className="h-4 w-4" /> {project.projectType || '-'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-green-700 font-bold">
            {formatCurrency(project.feeForFreelancer || 0)}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-blue-700">
            <Calendar className="h-4 w-4" /> {new Date(project.deadline).toLocaleDateString('id-ID')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="p-4 bg-primary-light/40 border border-primary/10 rounded-xl space-y-2">
            <h3 className="font-bold text-gray-900">Profil Posisi Akun Anda</h3>
            <div className="flex flex-wrap gap-2">
              {getUserPositions(user).map((position: any, index: number) => (
                <span key={`${position.name}-${index}`} className="px-3 py-1.5 bg-white border rounded-full text-xs font-medium text-gray-700">
                  {position.name} • Rank {position.rank || user?.rank || 'C'}
                </span>
              ))}
              {getUserPositions(user).length === 0 && (
                <span className="text-sm text-gray-400">Posisi akun Anda belum tersimpan.</span>
              )}
            </div>
          </div>

          <h3 className="font-bold text-gray-900">Skill Dibutuhkan</h3>
          <div className="flex flex-wrap gap-2">
            {(project.requiredSkills || []).map((skill: string) => (
              <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">{skill}</span>
            ))}
            {(project.requiredSkills || []).length === 0 && <span className="text-sm text-gray-400">Belum ada skill tercatat.</span>}
          </div>

          <h3 className="font-bold text-gray-900 pt-4">Formasi Posisi</h3>
          <div className="space-y-2">
            {(project.requiredPositions || []).map((item: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{item.position}</p>
                  <p className="text-xs text-gray-500">Minimum Rank {item.minRank} • Ekuivalen {item.equivalentCount}</p>
                </div>
                <div className="text-sm font-bold text-primary">{item.count} orang</div>
              </div>
            ))}
            {(project.requiredPositions || []).length === 0 && <span className="text-sm text-gray-400">Belum ada formasi posisi.</span>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Apply Posisi / Party</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posisi yang dilamar</label>
                <select className="w-full px-3 py-2 border rounded-md" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)}>
                  <option value="">Pilih posisi</option>
                  {(project.requiredPositions || []).map((item: any, index: number) => (
                    <option key={index} value={item.position}>
                      {item.position} • min Rank {item.minRank} • kebutuhan {item.count}
                    </option>
                  ))}
                </select>
                {selectedPosition && !userPositionNames.includes(selectedPosition) && (
                  <p className="text-xs text-red-500 mt-1">Posisi yang dipilih belum ada di profil akun Anda.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[90px]"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tambahkan ringkasan pengalaman atau keterangan party."
                />
              </div>

              <button
                onClick={() => applyToProject('DIRECT')}
                disabled={submitting}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Send className="h-4 w-4" /> Apply Posisi
              </button>

              <div className="border-t pt-3 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Apply dengan Party</label>
                <select className="w-full px-3 py-2 border rounded-md" value={selectedPartyId} onChange={(e) => setSelectedPartyId(e.target.value)}>
                  <option value="">Pilih party saya</option>
                  {parties.map((party) => (
                    <option key={party._id} value={party._id}>
                      {party.name} • {party.members?.length || 0} member
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => applyToProject('PARTY')}
                  disabled={submitting || parties.length === 0}
                  className="btn btn-secondary w-full"
                >
                  Ajukan Party
                </button>
                <Link href={`/party/create?projectId=${projectId}`} className="btn btn-secondary w-full">
                  Buat Party dari Project Ini
                </Link>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Lampiran</h3>
            <div className="space-y-2">
              {(project.files || []).map((file: any, index: number) => (
                <a key={index} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-gray-700 truncate">{file.name}</span>
                </a>
              ))}
              {(project.files || []).length === 0 && <span className="text-sm text-gray-400">Belum ada file.</span>}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4" /> Tim Saat Ini
            </h3>
            {(project.team || []).map((member: any, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                {member.user?.name || 'Member'} • {member.position || member.role || '-'}
              </div>
            ))}
            {(project.team || []).length === 0 && <span className="text-sm text-gray-400">Tim belum dibentuk admin.</span>}
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Status Pengajuan Saya</h3>
            <div className="space-y-3">
              {applications.map((application) => (
                <div key={application._id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {application.position} • {application.applicationType === 'PARTY' ? application.partyName || 'Party' : 'Direct Apply'}
                      </p>
                      <p className="text-xs text-gray-500">{application.note || 'Tanpa catatan tambahan.'}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
              {applications.length === 0 && (
                <span className="text-sm text-gray-400">Belum ada pengajuan untuk project ini.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
