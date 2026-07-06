import { 
  BarChart3, 
  MessageSquare, 
  CheckCircle2, 
  Clock,
  Users,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import { formatCurrency } from '@/lib/utils';

export default function ClientDashboard() {
  const activeProjects = [
    { 
      id: '1', 
      title: 'Aplikasi Mobile E-commerce', 
      rank: 'S', 
      progress: 65, 
      status: 'ON_PROGRESS',
      team: [
        { name: 'Budi S.', rank: 'S', role: 'Lead' },
        { name: 'Sari D.', rank: 'A', role: 'UI/UX' },
        { name: 'Andi F.', rank: 'B', role: 'Backend' },
      ],
      nextMilestone: 'Sprint 3 - Integrasi Payment',
      dueDate: '12 Juni 2026'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome & Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Halo, PT Maju Mundur</h2>
          <p className="text-gray-500 text-sm">Berikut adalah ringkasan progress proyek Anda.</p>
        </div>
        <button className="btn btn-primary">
          Buat Proyek Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Project Card */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold">Proyek Berjalan</h3>
          {activeProjects.map((project) => (
            <div key={project.id} className="card p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold">{project.title}</h4>
                    <RankBadge rank={project.rank} />
                  </div>
                  <p className="text-sm text-gray-500">Milestone: {project.nextMilestone}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    {project.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-2">Selesai {project.progress}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${project.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                  <span>Start: 01 Mei</span>
                  <span>Target: {project.dueDate}</span>
                </div>
              </div>

              {/* Team View */}
              <div className="pt-6 border-t">
                <p className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" /> Tim Ahli
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.team.map((member) => (
                    <div key={member.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center font-bold text-xs text-primary shadow-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-1.5">
                          <RankBadge rank={member.rank} className="px-1 py-0 text-[8px]" />
                          <span className="text-[9px] text-gray-500">{member.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button className="btn btn-secondary py-1.5 text-xs flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Hubungi Tim
                </button>
                <button className="btn btn-primary py-1.5 text-xs">
                  Lihat Detail Progress
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm uppercase text-gray-400 tracking-wider">Statistik Kualitas</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Task Selesai</span>
                </div>
                <span className="font-bold">24/36</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Ketepatan Waktu</span>
                </div>
                <span className="font-bold">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Skor Kualitas</span>
                </div>
                <span className="font-bold text-success">4.8/5.0</span>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="card">
            <div className="p-5 border-b">
              <h3 className="font-bold text-sm">Update Terbaru</h3>
            </div>
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Budi Santoso mengunggah Mockup UI v2.{i}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">2 jam yang lalu</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="bg-gray-900 rounded-xl p-5 text-white">
            <AlertCircle className="h-6 w-6 text-primary mb-3" />
            <h4 className="font-bold text-sm mb-1">Butuh Bantuan?</h4>
            <p className="text-xs text-gray-400 mb-4">Admin siap membantu jika Anda memiliki kendala dengan tim atau proyek.</p>
            <button className="w-full btn btn-primary py-2 text-xs">
              Hubungi Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
