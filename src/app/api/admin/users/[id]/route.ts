import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Submission from '@/models/Submission';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    const submissions = await Submission.find({ user: user._id })
      .populate('test', 'title category type targetPosition passingScore')
      .sort({ createdAt: -1 });

    return NextResponse.json({ user, submissions });
  } catch (error: any) {
    return NextResponse.json({ message: 'Gagal mengambil detail user' }, { status: 500 });
  }
}
