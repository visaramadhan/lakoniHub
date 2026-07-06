"use client";

import { 
  History, 
  User, 
  FolderKanban, 
  FileCheck, 
  ShieldCheck,
  Search,
  Filter,
  Download
} from 'lucide-react';

export default function AdminActivity() {
  const activities = [
    { id: 1, type: 'USER', user: 'Admin', action: 'Menyetujui pendaftaran user baru', target: 'Rahmat Hidayat', time: '5 menit yang lalu', icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 2, type: 'PROJECT', user: 'Admin', action: 'Memperbarui status proyek', target: 'Mobile App FinTech', time: '2 jam yang lalu', icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 3, type: 'TEST', user: 'Budi Santoso', action: 'Menyelesaikan Technical Test Rank S', target: 'Score: 92/100', time: '3 jam yang lalu', icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 4, type: 'USER', user: 'Siska Putri', action: 'Mendaftar sebagai Client baru', target: 'PT Sejahtera', time: '5 jam yang lalu', icon: User, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 5, type: 'PROJECT', user: 'Admin', action: 'Menjalankan STMS Engine untuk proyek', target: 'Enterprise POS', time: '1 hari yang lalu', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Log Aktivitas</h2>
          <p className="text-gray-500 text-sm">Riwayat lengkap aktivitas user dan perubahan sistem.</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <Download className="h-4 w-4" /> Download Log
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari aktivitas, user, atau target..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary flex items-center gap-2 px-3 py-2 text-sm">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {activities.map((item) => (
              <div key={item.id} className="relative flex items-start gap-6 group">
                <div className={`absolute left-0 h-10 w-10 rounded-full ${item.bg} flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 ml-12 pt-0.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <div className="text-sm">
                      <span className="font-bold text-gray-900">{item.user}</span>
                      <span className="text-gray-500 mx-1.5">{item.action}</span>
                      <span className="font-semibold text-primary">{item.target}</span>
                    </div>
                    <time className="text-xs text-gray-400 font-medium whitespace-nowrap">{item.time}</time>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
                    ID Transaksi: #ACT-{(2000 + item.id).toString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <button className="text-sm font-bold text-primary hover:underline">
              Muat Aktivitas Lainnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
