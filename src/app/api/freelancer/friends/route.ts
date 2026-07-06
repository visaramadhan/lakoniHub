import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const friends = await User.find({
      _id: { $ne: currentUserId },
      role: 'FREELANCER',
      status: 'APPROVED',
      isApproved: true
    })
      .select('name email position positions rank skills currentWorkload availability reputation')
      .sort({ name: 1 });

    return NextResponse.json(friends);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data teman freelancer' }, { status: 500 });
  }
}
