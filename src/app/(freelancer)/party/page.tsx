"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, Plus, Users } from 'lucide-react';
import RankBadge from '@/components/RankBadge';

export default function MyPartyPage() {
  const [loading, setLoading] = useState(true);
  const [parties, setParties] = useState<any[]>([]);

  useEffect(() => {
    const fetchParties = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/freelancer/parties');
        const json = await res.json();
        setParties(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Party Saya</h2>
          <p className="text-sm text-gray-500">Kelola party yang Anda buat untuk apply project bersama tim.</p>
        </div>
        <Link href="/party/create" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Buat Party
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {parties.map((party) => (
          <div key={party._id} className="card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{party.name}</h3>
                <p className="text-sm text-gray-500">{party.description || 'Tanpa deskripsi party.'}</p>
              </div>
              <div className="px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-bold">
                {party.members?.length || 0} member
              </div>
            </div>

            {party.sourceProject?.title && (
              <div className="text-xs text-gray-500">
                Dibuat dari project: <span className="font-semibold text-gray-900">{party.sourceProject.title}</span>
              </div>
            )}

            <div className="space-y-3">
              {(party.members || []).map((member: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{member.user?.name || 'Member'}</p>
                    <p className="text-xs text-gray-500">
                      {member.position} • {member.role === 'OWNER' ? 'Owner Party' : 'Member'}
                    </p>
                  </div>
                  <RankBadge rank={member.rank || 'C'} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {parties.length === 0 && (
        <div className="card p-8 text-center text-gray-400 space-y-3">
          <Users className="h-10 w-10 mx-auto text-gray-300" />
          <div>Belum ada party yang Anda buat.</div>
          <Link href="/party/create" className="btn btn-secondary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Mulai Buat Party
          </Link>
        </div>
      )}
    </div>
  );
}
