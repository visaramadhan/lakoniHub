"use client";

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  MessageSquare, 
  ChevronRight,
  Users,
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import Modal from '@/components/Modal';

export default function ClientProjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projects = [
    { 
      id: '1', 
      title: 'Aplikasi Mobile E-commerce', 
      rank: 'S', 
      progress: 65, 
      status: 'ON_PROGRESS',
      dueDate: '12 Juni 2026',
      teamSize: 3,
      milestone: 'Sprint 3 - Integrasi Payment'
    },
    { 
      id: '2', 
      title: 'Website Company Profile', 
      rank: 'B', 
      progress: 100, 
      status: 'DONE',
      dueDate: '20 Mei 2026',
      teamSize: 1,
      milestone: 'Final Handoff'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proyek Saya</h2>
          <p className="text-gray-500 text-sm">Monitor semua proyek yang sedang berjalan atau sudah selesai.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajukan Proyek Baru
        </button>
      </div>

      {/* Client Add Project Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajukan Proyek Baru"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Proyek</label>
              <input type="text" className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" placeholder="e.g. Redesign Mobile App" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kebutuhan Utama (Deskripsi)</label>
              <textarea className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" rows={4} placeholder="Jelaskan secara singkat apa yang ingin Anda bangun..." required></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Budget (IDR)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" placeholder="e.g. 10000000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Selesai</label>
                <input type="date" className="w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary" required />
              </div>
            </div>
            <div className="p-4 bg-primary-light/30 border border-primary/10 rounded-lg">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-primary-dark uppercase">Catatan Penting</p>
                  <p className="text-[11px] text-primary/80 mt-1">
                    Setelah Anda mengajukan proyek, Admin akan mereview dan menentukan Rank Proyek serta merekomendasikan tim terbaik melalui STMS Engine.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary px-6">Batal</button>
            <button type="submit" className="btn btn-primary px-6">Kirim Pengajuan</button>
          </div>
        </form>
      </Modal>

      <div className="card p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari proyek..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="card p-6 hover:border-primary/40 transition-all group cursor-pointer">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${project.status === 'DONE' ? 'bg-green-100' : 'bg-primary-light'}`}>
                    <FolderKanban className={`h-6 w-6 ${project.status === 'DONE' ? 'text-green-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <RankBadge rank={project.rank} />
                    </div>
                    <p className="text-sm text-gray-500">Milestone: {project.milestone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      project.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tim</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <Users className="h-3.5 w-3.5" /> {project.teamSize} Freelancer
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Target Selesai</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <Calendar className="h-3.5 w-3.5" /> {project.dueDate}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Progress</p>
                    <p className="text-xs font-bold text-gray-900">{project.progress}%</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className={`rounded-full h-1.5 transition-all ${project.status === 'DONE' ? 'bg-green-500' : 'bg-primary'}`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex lg:flex-col justify-end gap-2 shrink-0">
                <button className="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2 text-sm">
                  <MessageSquare className="h-4 w-4" /> Chat Tim
                </button>
                <button className="btn btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm">
                  Detail Proyek <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
