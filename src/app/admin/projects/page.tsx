"use client";

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  DollarSign,
  Users,
  Briefcase,
  Target,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Loader2
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import Modal from '@/components/Modal';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function AdminProjects() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [positionOptions, setPositionOptions] = useState<any[]>([]);
  const [skillOptions, setSkillOptions] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [requiredPositions, setRequiredPositions] = useState<any[]>([
    { position: '', count: 1, minRank: 'B', equivalentCount: 1 }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rank: 'B',
    client: '',
    budget: 0,
    feeForFreelancer: 0,
    projectType: '',
    deadline: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [projRes, typeRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/master-data?type=PROJECT_TYPE')
      ]);
      const [posRes, skillRes] = await Promise.all([
        fetch('/api/admin/master-data?type=POSITION'),
        fetch('/api/admin/master-data?type=SKILL')
      ]);
      const projJson = await projRes.json();
      const typeJson = await typeRes.json();
      const posJson = await posRes.json();
      const skillJson = await skillRes.json();
      setProjects(projJson);
      setProjectTypes(typeJson);
      setPositionOptions(posJson);
      setSkillOptions(skillJson);
      if (typeJson.length > 0) {
        setFormData(prev => ({ ...prev, projectType: typeJson[0].name }));
      }
      if (posJson.length > 0) {
        setRequiredPositions([{ position: posJson[0].name, count: 1, minRank: 'B', equivalentCount: 1 }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const json = await res.json();
      setProjects(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('rank', formData.rank);
      form.append('client', formData.client);
      form.append('budget', String(formData.budget));
      form.append('feeForFreelancer', String(formData.feeForFreelancer));
      form.append('projectType', formData.projectType);
      form.append('deadline', formData.deadline);
      form.append('requiredSkills', JSON.stringify(selectedSkills));
      form.append('requiredPositions', JSON.stringify(requiredPositions.filter((item: any) => item.position)));
      files.forEach((file) => form.append('files', file));

      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        body: form,
      });
      if (res.ok) {
        setFormData({
          title: '',
          description: '',
          rank: 'B',
          client: '',
          budget: 0,
          feeForFreelancer: 0,
          projectType: projectTypes.length > 0 ? projectTypes[0].name : '',
          deadline: '',
        });
        setSelectedSkills([]);
        setSkillSearch('');
        setRequiredPositions([
          { position: positionOptions.length > 0 ? positionOptions[0].name : '', count: 1, minRank: 'B', equivalentCount: 1 }
        ]);
        setFiles([]);
        setIsModalOpen(false);
        fetchProjects();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSkillOptions = skillOptions.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.includes(skill.name)
  );

  const addSkill = (skillName: string) => {
    if (!selectedSkills.includes(skillName)) {
      setSelectedSkills((prev) => [...prev, skillName]);
    }
    setSkillSearch("");
  };

  const removeSkill = (skillName: string) => {
    setSelectedSkills((prev) => prev.filter((skill) => skill !== skillName));
  };

  const addRequiredPositionRow = () => {
    setRequiredPositions((prev) => [
      ...prev,
      { position: positionOptions[0]?.name || '', count: 1, minRank: formData.rank, equivalentCount: 1 }
    ]);
  };

  const updateRequiredPositionRow = (index: number, key: string, value: any) => {
    setRequiredPositions((prev) => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const removeRequiredPositionRow = (index: number) => {
    setRequiredPositions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Proyek</h2>
          <p className="text-gray-500 text-sm">Kelola semua proyek dan pembentukan tim STMS.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Proyek
        </button>
      </div>

      {/* Add Project Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Buat Proyek Baru"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Proyek</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                placeholder="e.g. Website E-commerce" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Proyek</label>
              <textarea 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                rows={3} 
                placeholder="Detail pengerjaan proyek..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rank Proyek</label>
              <select 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                value={formData.rank}
                onChange={(e) => {
                  const nextRank = e.target.value;
                  setFormData({ ...formData, rank: nextRank });
                  setRequiredPositions((prev) => prev.map((item: any) => ({ ...item, minRank: item.minRank || nextRank })));
                }}
              >
                <option value="SS">Rank SS (Enterprise Critical)</option>
                <option value="S">Rank S (High Complexity)</option>
                <option value="A">Rank A (Medium)</option>
                <option value="B">Rank B (Basic)</option>
                <option value="C">Rank C (Support)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Proyek</label>
              <select 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              >
                {projectTypes.map((type) => (
                  <option key={type._id} value={type.name}>{type.name}</option>
                ))}
                {projectTypes.length === 0 && (
                  <option disabled>Tambahkan jenis di Master Data</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                placeholder="Nama Perusahaan/Client" 
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Total</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
                <input 
                  type="number" 
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  placeholder="0" 
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Freelancer (Pool)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">Rp</span>
                <input 
                  type="number" 
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  placeholder="0" 
                  value={formData.feeForFreelancer}
                  onChange={(e) => setFormData({ ...formData, feeForFreelancer: parseInt(e.target.value) || 0 })}
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill yang Dibutuhkan</label>
              <div className="space-y-3">
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" 
                  placeholder="Ketik untuk cari skill master data..." 
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
                {skillSearch && filteredSkillOptions.length > 0 && (
                  <div className="max-h-32 overflow-auto border rounded-md bg-white">
                    {filteredSkillOptions.slice(0, 8).map((skill) => (
                      <button
                        key={skill._id}
                        type="button"
                        onClick={() => addSkill(skill.name)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-light text-primary rounded-full text-xs font-bold">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-primary/70 hover:text-primary">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {selectedSkills.length === 0 && <span className="text-xs text-gray-400">Belum ada skill dipilih.</span>}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Kebutuhan Posisi / Formasi</label>
                <button type="button" onClick={addRequiredPositionRow} className="text-primary text-xs font-bold hover:underline">
                  + Tambah Posisi
                </button>
              </div>
              <div className="space-y-3">
                {requiredPositions.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg bg-gray-50">
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      value={item.position}
                      onChange={(e) => updateRequiredPositionRow(index, 'position', e.target.value)}
                    >
                      {positionOptions.map((pos) => (
                        <option key={pos._id} value={pos.name}>{pos.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      value={item.count}
                      onChange={(e) => updateRequiredPositionRow(index, 'count', parseInt(e.target.value) || 1)}
                      placeholder="Jumlah orang"
                    />
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                      value={item.minRank}
                      onChange={(e) => updateRequiredPositionRow(index, 'minRank', e.target.value)}
                    >
                      <option value="S">Rank S</option>
                      <option value="A">Rank A</option>
                      <option value="B">Rank B</option>
                      <option value="C">Rank C</option>
                      <option value="D">Rank D</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                        value={item.equivalentCount}
                        onChange={(e) => updateRequiredPositionRow(index, 'equivalentCount', parseInt(e.target.value) || 1)}
                        placeholder="Ekuivalen"
                      />
                      {requiredPositions.length > 1 && (
                        <button type="button" onClick={() => removeRequiredPositionRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-gray-400">
                  Contoh: Frontend 1 orang Rank S dapat diekuivalenkan dengan 2 orang Rank B sesuai formasi tim.
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran File (PDF, Word, Image)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer group relative">
                <div className="space-y-1 text-center">
                  <Paperclip className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
              
              {/* File List Preview */}
              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border text-xs">
                      <div className="flex items-center gap-2 truncate">
                        {file.type.includes('image') ? <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> : <FileText className="h-3.5 w-3.5 text-orange-500" />}
                        <span className="truncate max-w-[120px]">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6" disabled={submitting}>Batal</button>
            <button type="submit" className="btn btn-primary px-6 flex items-center gap-2" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan Proyek
            </button>
          </div>
        </form>
      </Modal>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari judul proyek atau client..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="border rounded-md px-3 py-2 text-sm focus:outline-none">
            <option>Semua Status</option>
            <option>Open</option>
            <option>On Progress</option>
            <option>Revision</option>
            <option>Done</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm focus:outline-none">
            <option>Semua Rank</option>
            <option>Rank SS</option>
            <option>Rank S</option>
            <option>Rank A</option>
            <option>Rank B</option>
          </select>
          <button className="btn btn-secondary flex items-center gap-2 px-3">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4">Proyek & Client</th>
              <th className="px-6 py-4 text-center">Rank</th>
              <th className="px-6 py-4">Budget</th>
              <th className="px-6 py-4">Tim</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Belum ada proyek</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{project.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{project.client}</span>
                      {project.projectType && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                          {project.projectType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                      <Calendar className="h-3 w-3" /> Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RankBadge rank={project.rank} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{formatCurrency(project.totalBudget || project.budget)}</div>
                    <div className="text-[10px] text-primary font-bold">Fee: {formatCurrency(project.feeForFreelancer || 0)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {project.team && project.team.length > 0 ? (
                          project.team.slice(0, 3).map((member: any, i: number) => (
                            <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">
                              U{i+1}
                            </div>
                          ))
                        ) : null}
                        {project.team && project.team.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-primary-light text-primary border-2 border-white flex items-center justify-center text-[8px] font-bold">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                      {!project.team || project.team.length === 0 ? (
                        <span className="text-xs text-orange-500 font-medium">Belum ada tim</span>
                      ) : (
                        <span className="text-xs text-gray-500">{project.capabilityPoint || 0} CP</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      project.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 
                      project.status === 'ON_PROGRESS' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/admin/projects/${project._id}`)}
                      className="btn btn-secondary px-3 py-1.5 text-xs font-bold"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
