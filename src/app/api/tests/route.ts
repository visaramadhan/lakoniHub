import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Test from '@/models/Test';
import Submission from '@/models/Submission';
import RankUpgradeRequest from '@/models/RankUpgradeRequest';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category'); // ALL | GENERAL | TECHNICAL

    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select('-password');
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    const latestApproved = await RankUpgradeRequest.findOne({ user: user._id, status: 'APPROVED' }).sort({ createdAt: -1 });
    const approvedTargetRank = latestApproved?.toRank || null;

    const generalQuery: any = { category: 'GENERAL' };
    const technicalQuery: any = { category: 'TECHNICAL', targetPosition: user.position };

    if (approvedTargetRank) {
      technicalQuery.$or = [{ targetRank: 'ALL' }, { targetRank: approvedTargetRank }];
    } else {
      technicalQuery._id = { $exists: false };
    }

    const [generalTests, technicalTests, submissions] = await Promise.all([
      Test.find(generalQuery).sort({ createdAt: -1 }),
      Test.find(technicalQuery).sort({ createdAt: -1 }),
      Submission.find({ user: user._id }).populate('test', 'title category type targetPosition targetRank passingScore').sort({ createdAt: -1 })
    ]);

    const payload = {
      approvedTargetRank,
      generalTests,
      technicalTests,
      submissions,
      user: { id: user._id, rank: user.rank, position: user.position }
    };

    if (category === 'GENERAL') {
      return NextResponse.json({ ...payload, technicalTests: [] });
    }
    if (category === 'TECHNICAL') {
      return NextResponse.json({ ...payload, generalTests: [] });
    }
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil daftar test' }, { status: 500 });
  }
}

