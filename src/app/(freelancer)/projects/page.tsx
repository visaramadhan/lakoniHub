"use client";

import { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  ChevronRight,
  Briefcase,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import RankBadge from '@/components/RankBadge';
import { formatCurrency } from '@/lib/utils';

export default function FindProjects() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [rankFilter, setRankFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/projects');
        const json = await res.json();
        setProjects(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const keyword = `${p.title} ${p.projectType || ''} ${(p.requiredSkills || []).join(' ')}`.toLowerCase();
      const matchesSearch = keyword.includes(searchTerm.toLowerCase());
      const matchesRank = rankFilter === 'ALL' || p.rank === rankFilter;
      return matchesSearch && matchesRank;
    });
  }, [projects, rankFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cari Proyek Baru</h2>
          <p className="text-gray-500 text-sm">Temukan proyek yang sesuai dengan rank dan keahlian Anda.</p>
        </div>
      </div>

      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari skill, judul, atau kategori..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="border rounded-md px-3 py-2 text-sm focus:outline-none" value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
            <option value="ALL">Semua Rank</option>
            <option value="S">Rank S</option>
            <option value="A">Rank A</option>
            <option value="B">Rank B</option>
            <option value="C">Rank C</option>
          </select>
          <button className="btn btn-secondary flex items-center gap-2 px-3">
            <Filter className="h-4 w-4" /> Filter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.map((p) => (
          <div key={p._id} className="card p-6 hover:border-primary/40 transition-all group">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <RankBadge rank={p.rank} />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {(p.requiredSkills || []).map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col justify-between gap-4 lg:text-right shrink-0 lg:border-l lg:pl-6 lg:border-gray-100">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fee Freelancer</p>
                  <p className="text-2xl font-black text-primary">{formatCurrency(p.feeForFreelancer || 0)}</p>
                </div>
                <div className="flex items-center lg:justify-end gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(p.deadline).toLocaleDateString('id-ID')}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {p.projectType || '-'}</span>
                </div>
                <button onClick={() => router.push(`/projects/${p._id}`)} className="btn btn-primary w-full lg:w-auto py-2.5 px-6">
                  Lihat Detail & Apply
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredProjects.length === 0 && (
          <div className="card p-8 text-center text-gray-400">Belum ada proyek yang sesuai filter.</div>
        )}
      </div>
    </div>
  );
}
