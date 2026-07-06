"use client";

import { 
  FolderKanban, 
  Clock, 
  MessageSquare, 
  Paperclip, 
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';

export default function MyProjects() {
  const myProjects = [
    { 
      id: '1', 
      title: 'Aplikasi Mobile E-commerce', 
      rank: 'S', 
      status: 'ON_PROGRESS',
      deadline: '12 Juni 2026',
      reviewStatus: 'WAITING',
      files: 2,
      progress: 65
    },
    { 
      id: '2', 
      title: 'Dashboard Analytics Admin', 
      rank: 'A', 
      status: 'REVISION',
      deadline: '10 Juni 2026',
      reviewStatus: 'REVISION',
      files: 1,
      progress: 80
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Proyek Saya</h2>
          <p className="text-gray-500 text-sm">Kelola pengerjaan dan upload hasil kerja Anda.</p>
        </div>
      </div>

      <div className="space-y-4">
        {myProjects.map((p) => (
          <div key={p.id} className="card p-6 border-l-4 hover:shadow-md transition-all group" style={{ borderLeftColor: p.status === 'REVISION' ? '#DC2626' : '#14B8A6' }}>
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <RankBadge rank={p.rank} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Deadline: {p.deadline}</span>
                      <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> {p.files} File Uploaded</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    p.status === 'REVISION' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Progress Pengerjaan</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`rounded-full h-2 transition-all ${p.status === 'REVISION' ? 'bg-red-500' : 'bg-primary'}`} 
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                {p.reviewStatus === 'REVISION' && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-800">Perlu Revisi!</p>
                      <p className="text-xs text-red-700 mt-0.5">Admin: "Tolong perbaiki validasi pada halaman checkout, masih ada bug saat input promo."</p>
                    </div>
                  </div>
                )}

                {p.reviewStatus === 'WAITING' && (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-3">
                    <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-orange-800">Menunggu Review</p>
                      <p className="text-xs text-orange-700 mt-0.5">File terakhir diunggah 2 jam yang lalu. Admin akan mereview segera.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex lg:flex-col justify-end gap-2 shrink-0">
                <button className="btn btn-secondary flex items-center justify-center gap-2 px-4 py-2 text-sm">
                  <MessageSquare className="h-4 w-4" /> Diskusi Tim
                </button>
                <button className="btn btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm bg-success hover:bg-success-dark border-none">
                  <Paperclip className="h-4 w-4" /> Upload Hasil Kerja
                </button>
                <button className="text-xs font-bold text-gray-400 hover:text-primary mt-2">
                  Detail Proyek
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
