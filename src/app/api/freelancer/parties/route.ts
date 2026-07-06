import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import FreelancerParty from '@/models/FreelancerParty';

const normalizeUserPositions = (user: any) => {
  if (Array.isArray(user?.positions) && user.positions.length > 0) {
    return user.positions;
  }

  if (user?.position) {
    return [{ name: user.position, rank: user.rank || 'C', isPrimary: true }];
  }

  return [];
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const parties = await FreelancerParty.find({
      $or: [{ owner: currentUserId }, { 'members.user': currentUserId }]
    })
      .populate('owner', 'name email')
      .populate('sourceProject', 'title')
      .populate('members.user', 'name email position positions skills rank currentWorkload')
      .sort({ createdAt: -1 });

    return NextResponse.json(parties);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil party freelancer' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const memberInputs = Array.isArray(body.members) ? body.members : [];
    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    if (!body.name) {
      return NextResponse.json({ message: 'Nama party wajib diisi' }, { status: 400 });
    }

    const uniqueUserIds = Array.from(
      new Set([
        String(currentUserId),
        ...memberInputs.map((item: any) => String(item.userId || '')).filter(Boolean)
      ])
    );

    const users = await User.find({
      _id: { $in: uniqueUserIds },
      role: 'FREELANCER',
      status: 'APPROVED',
      isApproved: true
    });

    const userMap = new Map(users.map((user: any) => [String(user._id), user]));
    const ownerPosition = body.ownerPosition || normalizeUserPositions(currentUser)[0]?.name;

    if (!ownerPosition) {
      return NextResponse.json({ message: 'Posisi owner party belum tersedia' }, { status: 400 });
    }

    const buildMember = (userId: string, selectedPosition: string, role: 'OWNER' | 'MEMBER') => {
      const user = userMap.get(String(userId));
      if (!user) {
        throw new Error('Ada anggota party yang tidak valid');
      }

      const matchedPosition = normalizeUserPositions(user).find((item: any) => item.name === selectedPosition);
      if (!matchedPosition) {
        throw new Error(`${user.name} tidak memiliki posisi ${selectedPosition}`);
      }

      return {
        user: user._id,
        position: selectedPosition,
        rank: matchedPosition.rank || user.rank || 'C',
        role
      };
    };

    const members = [
      buildMember(String(currentUserId), ownerPosition, 'OWNER'),
      ...memberInputs
        .filter((item: any) => item.userId && String(item.userId) !== String(currentUserId))
        .map((item: any) => buildMember(String(item.userId), item.position, 'MEMBER'))
    ];

    const party = await FreelancerParty.create({
      name: body.name,
      description: body.description,
      owner: currentUserId,
      sourceProject: body.sourceProject || undefined,
      members
    });

    const populatedParty = await FreelancerParty.findById(party._id)
      .populate('owner', 'name email')
      .populate('sourceProject', 'title')
      .populate('members.user', 'name email position positions skills rank currentWorkload');

    return NextResponse.json(populatedParty, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Gagal membuat party freelancer' },
      { status: 500 }
    );
  }
}
