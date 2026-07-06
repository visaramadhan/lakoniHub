"use client";

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  Users, 
  Video, 
  MoreVertical,
  Loader2,
  Paperclip,
  CheckSquare,
  Square,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import RankBadge from '@/components/RankBadge';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/lib/utils';

export default function ProjectDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '' });
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '' });
  const [assignableFreelancers, setAssignableFreelancers] = useState<any[]>([]);
  const [partyTemplates, setPartyTemplates] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>({ directRecommendations: [], partyRecommendations: [] });
  const [projectApplications, setProjectApplications] = useState<any[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedRequirementIndex, setSelectedRequirementIndex] = useState(0);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState('');
  const [draftTeam, setDraftTeam] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setDraftTeam(data.team || []);
      }
      const [freelancerRes, partyRes, applicationRes] = await Promise.all([
        fetch('/api/admin/users/approve?approved=true'),
        fetch('/api/admin/party-templates'),
        fetch(`/api/admin/projects/${projectId}/applications`)
      ]);
      const recommendationRes = await fetch(`/api/admin/projects/${projectId}/recommendations`);
      const freelancerJson = await freelancerRes.json();
      const partyJson = await partyRes.json();
      const applicationJson = applicationRes.ok ? await applicationRes.json() : [];
      const recommendationJson = recommendationRes.ok ? await recommendationRes.json() : { directRecommendations: [], partyRecommendations: [] };
      setAssignableFreelancers(freelancerJson);
      setPartyTemplates(partyJson);
      setProjectApplications(Array.isArray(applicationJson) ? applicationJson : []);
      setRecommendations(recommendationJson);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!project?.tasks || project.tasks.length === 0) return 0;
    const doneTasks = project.tasks.filter((t: any) => t.status === 'DONE').length;
    return Math.round((doneTasks / project.tasks.length) * 100);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatedTasks = [...(project.tasks || []), { title: newTask.title, status: 'PENDING' }];
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks }),
      });
      if (res.ok) {
        setNewTask({ title: '' });
        setIsTaskModalOpen(false);
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = async (index: number) => {
    const updatedTasks = [...project.tasks];
    updatedTasks[index].status = updatedTasks[index].status === 'DONE' ? 'PENDING' : 'DONE';
    try {
      await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: updatedTasks }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatedMeetings = [...(project.meetings || []), { title: newMeeting.title, date: newMeeting.date, isDone: false }];
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetings: updatedMeetings }),
      });
      if (res.ok) {
        setNewMeeting({ title: '', date: '' });
        setIsMeetingModalOpen(false);
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMeeting = async (index: number) => {
    const updatedMeetings = [...project.meetings];
    updatedMeetings[index].isDone = !updatedMeetings[index].isDone;
    // Simulate MoM upload if marking as done
    if (updatedMeetings[index].isDone) {
      updatedMeetings[index].mom = `MoM_${updatedMeetings[index].title.replace(/\s+/g, '_')}.pdf`;
    } else {
      updatedMeetings[index].mom = null;
    }

    try {
      await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetings: updatedMeetings }),
      });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const saveProjectPatch = async (patch: any) => {
    const res = await fetch(`/api/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Gagal menyimpan project');
    }
    return res;
  };

  const getUserPositions = (user: any) => {
    const positions = Array.isArray(user?.positions) && user.positions.length > 0
      ? user.positions
      : user?.position
        ? [{ name: user.position, rank: user.rank || 'C', isPrimary: true }]
        : [];
    return positions;
  };

  const addDirectMember = () => {
    const requirement = project?.requiredPositions?.[selectedRequirementIndex];
    const user = assignableFreelancers.find((item) => item._id === selectedFreelancerId);
    if (!requirement || !user) return;

    const matchingPosition = getUserPositions(user).find((pos: any) => pos.name === requirement.position);
    if (!matchingPosition) {
      alert('Freelancer tidak memiliki jobdesk/posisi yang sesuai.');
      return;
    }
    if (Number(user.currentWorkload || 0) >= 85) {
      alert('Freelancer sedang overload dan tidak bisa di-assign.');
      return;
    }

    const exists = draftTeam.some((member: any) => String(member.user?._id || member.user) === user._id && member.position === requirement.position);
    if (exists) return;

    setDraftTeam((prev) => [
      ...prev,
      {
        user,
        role: 'MEMBER',
        position: requirement.position,
        rankAtAssignment: matchingPosition.rank || user.rank || 'C',
        source: 'DIRECT',
      }
    ]);
    setSelectedFreelancerId('');
  };

  const applyPartyTemplate = (partyId?: string) => {
    const party = partyTemplates.find((item) => item._id === (partyId || selectedPartyId));
    if (!party) return;
    const allowedPositions = new Set((project?.requiredPositions || []).map((item: any) => item.position));
    const normalizedMembers = (party.members || [])
      .filter((member: any) => allowedPositions.has(member.position) && Number(member.user?.currentWorkload || 0) < 85)
      .map((member: any) => ({
        user: member.user,
        role: 'MEMBER',
        position: member.position,
        rankAtAssignment: member.rank,
        source: 'PARTY',
        partyName: party.name,
      }));

    setDraftTeam((prev) => {
      const next = [...prev];
      for (const member of normalizedMembers) {
        const userId = String(member.user?._id || member.user);
        const exists = next.some((item: any) => String(item.user?._id || item.user) === userId && item.position === member.position);
        if (!exists) next.push(member);
      }
      return next;
    });
  };

  const persistTeam = async () => {
    setSubmitting(true);
    try {
      const payload = draftTeam.map((member: any) => ({
        user: member.user?._id || member.user,
        role: member.role || 'MEMBER',
        position: member.position,
        rankAtAssignment: member.rankAtAssignment,
        source: member.source || 'DIRECT',
        partyName: member.partyName,
      }));
      await saveProjectPatch({ team: payload });
      setIsAssignModalOpen(false);
      fetchProject();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Gagal menyimpan team');
    } finally {
      setSubmitting(false);
    }
  };

  const removeDraftMember = (index: number) => {
    setDraftTeam((prev) => prev.filter((_: any, i: number) => i !== index));
  };

  const addRecommendedCandidate = (candidate: any, requirement: any) => {
    const existing = draftTeam.some((member: any) => String(member.user?._id || member.user) === String(candidate.userId) && member.position === requirement.position);
    if (existing) return;
    const sourceUser = assignableFreelancers.find((item) => String(item._id) === String(candidate.userId));
    if (!sourceUser) return;
    setDraftTeam((prev) => [
      ...prev,
      {
        user: sourceUser,
        role: 'MEMBER',
        position: requirement.position,
        rankAtAssignment: candidate.rank,
        source: 'DIRECT',
      }
    ]);
  };

  const handleStartProject = async () => {
    if (!project?.team || project.team.length === 0) return;
    setSubmitting(true);
    try {
      await saveProjectPatch({ status: 'ON_PROGRESS', startedAt: new Date().toISOString() });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Gagal memulai project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!project) return <div>Project not found</div>;

  const progress = calculateProgress();

  return (
    <div className="space-y-6 pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
      </button>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <RankBadge rank={project.rank} />
          </div>
          <p className="text-gray-600 max-w-3xl">{project.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-gray-600">
              <Calendar className="h-4 w-4" /> {new Date(project.deadline).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full text-blue-600 font-bold">
              <FileText className="h-4 w-4" /> {project.projectType || 'N/A'}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full text-green-600 font-bold">
              {formatCurrency(project.budget)}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 space-y-4">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Progress Proyek</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Selesai</span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={handleStartProject}
              disabled={submitting || !project?.team || project.team.length === 0 || project.status === 'ON_PROGRESS'}
              className="btn btn-primary w-full py-2 disabled:opacity-50"
            >
              {project.status === 'ON_PROGRESS' ? 'Project Sudah Dimulai' : 'Mulai Project'}
            </button>
            <button onClick={() => setIsAssignModalOpen(true)} className="btn btn-secondary w-full py-2">
              Assign Team / Party
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b bg-primary-light/30 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-gray-900">Rekomendasi Tim Otomatis</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                {recommendations.directRecommendations?.map((group: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{group.requirement.position}</p>
                        <p className="text-xs text-gray-500">Kebutuhan {group.requirement.count} • min Rank {group.requirement.minRank}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(group.candidates || []).map((candidate: any) => (
                        <div key={candidate.userId} className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                            <p className="text-[11px] text-gray-500">
                              Rank {candidate.rank} • Workload {candidate.workload}% • Score {candidate.finalScore}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addRecommendedCandidate(candidate, group.requirement)}
                            className="btn btn-secondary py-1.5 px-3 text-xs"
                          >
                            Tambah
                          </button>
                        </div>
                      ))}
                      {(!group.candidates || group.candidates.length === 0) && (
                        <div className="text-xs text-gray-400">Belum ada kandidat cocok.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-900 mb-2">Party Recommendation</h4>
                <div className="space-y-2">
                  {(recommendations.partyRecommendations || []).map((party: any) => (
                    <div key={party.partyId} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{party.name}</p>
                        <p className="text-[11px] text-gray-500">
                          Coverage {party.coverage}% • Member {party.memberCount} • Avg workload {party.avgWorkload}% • Score {party.finalScore}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPartyId(party.partyId);
                          applyPartyTemplate(party.partyId);
                        }}
                        className="btn btn-secondary py-1.5 px-3 text-xs"
                      >
                        Pakai Party
                      </button>
                    </div>
                  ))}
                  {(!recommendations.partyRecommendations || recommendations.partyRecommendations.length === 0) && (
                    <div className="text-xs text-gray-400">Belum ada party yang cocok.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-gray-900">Apply Freelancer / Party</h3>
            </div>
            <div className="p-4 space-y-3">
              {projectApplications.map((application) => (
                <div key={application._id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {application.applicant?.name || 'Freelancer'} • {application.position}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {application.applicationType === 'PARTY'
                          ? `Party: ${application.partyName || application.party?.name || '-'}`
                          : 'Apply langsung'}
                        {application.note ? ` • ${application.note}` : ''}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                      {application.status}
                    </span>
                  </div>
                </div>
              ))}
              {projectApplications.length === 0 && (
                <div className="text-sm text-gray-400">Belum ada pengajuan dari freelancer atau party.</div>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Daftar Tugas (Task List)
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="text-primary hover:bg-primary-light p-1 rounded transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="divide-y">
              {project.tasks?.map((task: any, index: number) => (
                <div key={index} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTask(index)}>
                      {task.status === 'DONE' ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-300 hover:text-primary transition-colors" />
                      )}
                    </button>
                    <span className={task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}>
                      {task.title}
                    </span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!project.tasks || project.tasks.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-sm">Belum ada tugas. Klik tombol + untuk menambah.</div>
              )}
            </div>
          </div>

          {/* Meeting Schedule */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" /> Jadwal Meeting
              </h3>
              <button 
                onClick={() => setIsMeetingModalOpen(true)}
                className="text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="divide-y">
              {project.meetings?.map((meeting: any, index: number) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${meeting.isDone ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`font-bold ${meeting.isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{meeting.title}</p>
                      <p className="text-xs text-gray-500">{new Date(meeting.date).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {meeting.isDone && meeting.mom && (
                      <div className="flex items-center gap-1 text-xs text-primary font-medium bg-primary-light px-2 py-1 rounded">
                        <Paperclip className="h-3 w-3" /> MoM Uploaded
                      </div>
                    )}
                    <button 
                      onClick={() => toggleMeeting(index)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                        meeting.isDone 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {meeting.isDone ? 'Selesai' : 'Tandai Selesai'}
                    </button>
                  </div>
                </div>
              ))}
              {(!project.meetings || project.meetings.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-sm">Belum ada jadwal meeting.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Files */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Tim Proyek</h3>
            <div className="space-y-2 text-xs text-gray-500 border-b pb-3">
              {(project.requiredPositions || []).map((item: any, index: number) => {
                const filled = (project.team || []).filter((member: any) => member.position === item.position).length;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span>{item.position} • min Rank {item.minRank}</span>
                    <span className="font-bold text-primary">{filled}/{item.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-3">
              {project.team?.map((member: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {member.user?.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{member.user?.name || 'User'}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{member.position || member.role} • {member.rankAtAssignment || '-'}</p>
                  </div>
                </div>
              ))}
              {(!project.team || project.team.length === 0) && (
                <p className="text-sm text-gray-400 italic">Belum ada tim yang terbentuk.</p>
              )}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Lampiran Proyek</h3>
              <button className="text-primary hover:bg-primary-light p-1 rounded transition-colors">
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {project.files?.map((file: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded border transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-xs text-gray-600 truncate">{file.name}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {(!project.files || project.files.length === 0) && (
                <div className="py-4 text-center text-gray-400 text-xs border border-dashed rounded">
                  Belum ada file terlampir.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Tambah Tugas Baru">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Tugas</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md" 
              placeholder="e.g. Desain Homepage" 
              value={newTask.title}
              onChange={(e) => setNewTask({ title: e.target.value })}
              required 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn btn-secondary px-4">Batal</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-4 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Tugas
            </button>
          </div>
        </form>
      </Modal>

      {/* Meeting Modal */}
      <Modal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} title="Jadwalkan Meeting">
        <form onSubmit={handleAddMeeting} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topik Meeting</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md" 
              placeholder="e.g. Sprint Planning" 
              value={newMeeting.title}
              onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Waktu & Tanggal</label>
            <input 
              type="datetime-local" 
              className="w-full px-3 py-2 border rounded-md" 
              value={newMeeting.date}
              onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
              required 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsMeetingModalOpen(false)} className="btn btn-secondary px-4">Batal</button>
            <button type="submit" disabled={submitting} className="btn btn-primary px-4 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Jadwalkan
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Team / Party">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Masukkan Party Template</label>
            <div className="flex gap-2">
              <select className="w-full px-3 py-2 border rounded-md" value={selectedPartyId} onChange={(e) => setSelectedPartyId(e.target.value)}>
                <option value="">Pilih party template</option>
                {partyTemplates.map((party) => (
                  <option key={party._id} value={party._id}>{party.name}</option>
                ))}
              </select>
              <button type="button" onClick={applyPartyTemplate} className="btn btn-secondary px-4">Masukkan Party</button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Member party yang posisinya tidak cocok dengan requirement proyek otomatis tidak dimasukkan.</p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <label className="block text-sm font-medium text-gray-700">Tambah Freelancer Langsung</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className="w-full px-3 py-2 border rounded-md" value={selectedRequirementIndex} onChange={(e) => setSelectedRequirementIndex(parseInt(e.target.value, 10))}>
                {(project?.requiredPositions || []).map((item: any, index: number) => (
                  <option key={index} value={index}>{item.position} • kebutuhan {item.count}</option>
                ))}
              </select>
              <select className="w-full px-3 py-2 border rounded-md" value={selectedFreelancerId} onChange={(e) => setSelectedFreelancerId(e.target.value)}>
                <option value="">Pilih freelancer</option>
                {assignableFreelancers
                  .filter((user) => {
                    const requirement = project?.requiredPositions?.[selectedRequirementIndex];
                    if (!requirement) return true;
                    return getUserPositions(user).some((pos: any) => pos.name === requirement.position) && Number(user.currentWorkload || 0) < 85;
                  })
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} • WL {user.currentWorkload || 0}% • {(getUserPositions(user).map((pos: any) => `${pos.name}-${pos.rank}`).join(', '))}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              Freelancer dengan workload 85% ke atas tidak bisa di-assign untuk mencegah overload.
            </div>
            <button type="button" onClick={addDirectMember} className="btn btn-primary px-4 py-2">Tambah ke Tim</button>
          </div>

          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-bold text-gray-900">Draft Team</h4>
            {draftTeam.map((member: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{member.user?.name || 'Member'}</p>
                  <p className="text-[11px] text-gray-500">{member.position} • Rank {member.rankAtAssignment || '-'} • {member.source === 'PARTY' ? `Party: ${member.partyName}` : 'Direct'}</p>
                </div>
                <button type="button" onClick={() => removeDraftMember(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {draftTeam.length === 0 && <div className="text-sm text-gray-400">Belum ada anggota di draft team.</div>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-secondary px-4">Batal</button>
            <button type="button" disabled={submitting} onClick={persistTeam} className="btn btn-primary px-4 flex items-center gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Team
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
