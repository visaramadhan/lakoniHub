import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Project from '@/models/Project';
import RankUpgradeRequest from '@/models/RankUpgradeRequest';

const rankOrder: Record<string, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };

const calcRankScore = (u: any) => {
  const stats = u?.stats || {};
  const weights = [
    { key: 'initialScore', w: 0.2 },
    { key: 'clientSatisfaction', w: 0.3 },
    { key: 'projectSuccess', w: 0.2 },
    { key: 'deadlineAccuracy', w: 0.1 },
    { key: 'activity', w: 0.05 },
    { key: 'peerReview', w: 0.05 },
    { key: 'adminReview', w: 0.1 },
  ];
  const value = weights.reduce((acc, it) => acc + (Number(stats[it.key] || 0) * it.w), 0);
  return Math.round(value * 10) / 10;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    const requests = await RankUpgradeRequest.find({ user: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data pengajuan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const toRank = body.toRank as string;

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    if (user.role !== 'FREELANCER') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const fromRank = user.rank || 'D';
    if (!toRank || !rankOrder[toRank]) {
      return NextResponse.json({ message: 'Target rank tidak valid' }, { status: 400 });
    }
    if (rankOrder[toRank] <= rankOrder[fromRank]) {
      return NextResponse.json({ message: 'Target rank harus lebih tinggi dari rank saat ini' }, { status: 400 });
    }

    const existingPending = await RankUpgradeRequest.findOne({ user: user._id, status: 'PENDING' });
    if (existingPending) {
      return NextResponse.json({ message: 'Anda masih memiliki pengajuan yang menunggu review admin' }, { status: 400 });
    }

    const rankScore = calcRankScore(user);
    const minScoreMap: Record<string, number> = { C: 50, B: 65, A: 75, S: 85, D: 0 };
    const minScore = minScoreMap[toRank] ?? 0;
    if (rankScore < minScore) {
      return NextResponse.json({ message: `Belum memenuhi skor minimum untuk pengajuan Rank ${toRank} (min ${minScore})` }, { status: 400 });
    }

    const projectsDone = await Project.countDocuments({ status: 'DONE', 'team.user': user._id });
    const requestDoc = await RankUpgradeRequest.create({
      user: user._id,
      fromRank,
      toRank,
      status: 'PENDING',
      snapshot: {
        rankScore,
        stats: user.stats,
        projectsDone,
      }
    });

    return NextResponse.json(requestDoc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengajukan test kenaikan rank' }, { status: 500 });
  }
}

