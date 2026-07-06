"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Plus, Trash2, Users } from 'lucide-react';

const getUserPositions = (user: any) => {
  if (Array.isArray(user?.positions) && user.positions.length > 0) {
    return user.positions;
  }

  if (user?.position) {
    return [{ name: user.position, rank: user.rank || 'C', isPrimary: true }];
  }

  return [];
};

function CreatePartyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitedUserId = searchParams.get('invite') || '';
  const projectId = searchParams.get('projectId') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    ownerPosition: '',
    members: invitedUserId ? [{ userId: invitedUserId, position: '' }] : [{ userId: '', position: '' }]
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userRes, friendsRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch('/api/freelancer/friends')
        ]);
        const userJson = await userRes.json();
        const friendsJson = await friendsRes.json();
        const ownerPosition = getUserPositions(userJson)[0]?.name || '';

        setUser(userJson);
        setFriends(Array.isArray(friendsJson) ? friendsJson : []);
        setForm((prev) => ({
          ...prev,
          ownerPosition,
          name: prev.name || (projectId ? 'Party untuk project baru' : '')
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const ownerPositions = useMemo(() => getUserPositions(user), [user]);

  const addMemberRow = () => {
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, { userId: '', position: '' }]
    }));
  };

  const updateMemberRow = (index: number, key: 'userId' | 'position', value: string) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.map((member, memberIndex) =>
        memberIndex === index
          ? { ...member, [key]: value, ...(key === 'userId' ? { position: '' } : {}) }
          : member
      )
    }));
  };

  const removeMemberRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, memberIndex) => memberIndex !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/freelancer/parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          ownerPosition: form.ownerPosition,
          sourceProject: projectId || undefined,
          members: form.members.filter((member) => member.userId && member.position)
        })
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.message || 'Gagal membuat party');
        return;
      }

      alert('Party berhasil dibuat');
      router.push('/party');
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat membuat party');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Buat Party</h2>
        <p className="text-sm text-gray-500">Susun tim kecil Anda untuk apply project bersama atau undang teman freelancer.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Party</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Party Frontend Mobile"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Posisi Anda di Party</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={form.ownerPosition}
              onChange={(e) => setForm((prev) => ({ ...prev, ownerPosition: e.target.value }))}
              required
            >
              <option value="">Pilih posisi Anda</option>
              {ownerPositions.map((position: any, index: number) => (
                <option key={`${position.name}-${index}`} value={position.name}>
                  {position.name} • Rank {position.rank || user?.rank || 'C'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md min-h-[100px]"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Jelaskan fokus tim atau role masing-masing."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Invite Member</h3>
              <p className="text-xs text-gray-500">Pilih freelancer lain dan sesuaikan posisi mereka di party.</p>
            </div>
            <button type="button" onClick={addMemberRow} className="btn btn-secondary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Tambah Member
            </button>
          </div>

          {form.members.map((member, index) => {
            const selectedFriend = friends.find((friend) => friend._id === member.userId);
            const positions = getUserPositions(selectedFriend);

            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 border rounded-xl p-4">
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={member.userId}
                  onChange={(e) => updateMemberRow(index, 'userId', e.target.value)}
                >
                  <option value="">Pilih freelancer</option>
                  {friends.map((friend) => (
                    <option key={friend._id} value={friend._id}>
                      {friend.name} • WL {friend.currentWorkload || 0}%
                    </option>
                  ))}
                </select>

                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={member.position}
                  onChange={(e) => updateMemberRow(index, 'position', e.target.value)}
                  disabled={!member.userId}
                >
                  <option value="">Pilih posisi</option>
                  {positions.map((position: any, positionIndex: number) => (
                    <option key={`${position.name}-${positionIndex}`} value={position.name}>
                      {position.name} • Rank {position.rank || selectedFriend?.rank || 'C'}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removeMemberRow(index)}
                  className="btn btn-secondary text-red-600 border-red-100 hover:bg-red-50"
                  disabled={form.members.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={() => router.push('/party')} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary flex items-center gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Users className="h-4 w-4" />
            Simpan Party
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePartyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreatePartyPageContent />
    </Suspense>
  );
}
