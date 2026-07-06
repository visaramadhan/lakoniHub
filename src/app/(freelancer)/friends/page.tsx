"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, UserPlus, Users } from 'lucide-react';
import RankBadge from '@/components/RankBadge';

const getUserPositions = (user: any) => {
  if (Array.isArray(user?.positions) && user.positions.length > 0) {
    return user.positions;
  }

  if (user?.position) {
    return [{ name: user.position, rank: user.rank || 'C', isPrimary: true }];
  }

  return [];
};

export default function FriendsPage() {
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/freelancer/friends');
        const json = await res.json();
        setFriends(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Teman Freelancer</h2>
        <p className="text-sm text-gray-500">Cari rekan untuk diajak membuat party atau berkolaborasi pada project.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {friends.map((friend) => (
          <div key={friend._id} className="card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{friend.name}</h3>
                <p className="text-sm text-gray-500">{friend.email}</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>WL {friend.currentWorkload || 0}%</div>
                <div>Avail {friend.availability || 0}%</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {getUserPositions(friend).map((position: any, index: number) => (
                <div key={`${position.name}-${index}`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border rounded-full">
                  <span className="text-xs font-medium text-gray-700">{position.name}</span>
                  <RankBadge rank={position.rank || friend.rank || 'C'} />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {(friend.skills || []).map((skill: string) => (
                <span key={skill} className="px-2.5 py-1 bg-primary-light text-primary rounded-md text-xs font-medium">
                  {skill}
                </span>
              ))}
              {(!friend.skills || friend.skills.length === 0) && (
                <span className="text-xs text-gray-400">Belum ada skill yang ditampilkan.</span>
              )}
            </div>

            <Link href={`/party/create?invite=${friend._id}`} className="btn btn-primary inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Invite ke Party
            </Link>
          </div>
        ))}
      </div>

      {friends.length === 0 && (
        <div className="card p-8 text-center text-gray-400 space-y-3">
          <Users className="h-10 w-10 mx-auto text-gray-300" />
          <div>Belum ada freelancer aktif lain yang bisa diundang.</div>
        </div>
      )}
    </div>
  );
}
