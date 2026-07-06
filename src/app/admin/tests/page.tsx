"use client";

import { 
  Users,
  Globe,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminTests() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ujian & Seleksi</h2>
          <p className="text-gray-500 text-sm">Kelola materi ujian, bobot penilaian, dan proses seleksi.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/admin/tests/participants')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Users className="h-4 w-4" /> Detail Peserta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push('/admin/tests/general')}
          className="card p-6 text-left hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sub Halaman</p>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Tes Umum
              </h3>
              <p className="text-sm text-gray-500">Kelola ujian umum yang berlaku untuk semua posisi.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </button>

        <button
          onClick={() => router.push('/admin/tests/technical')}
          className="card p-6 text-left hover:border-primary/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sub Halaman</p>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" /> Tes Teknis
              </h3>
              <p className="text-sm text-gray-500">Kelola ujian teknis per posisi (Master Data) dan target rank.</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </button>
      </div>
    </div>
  );
}
