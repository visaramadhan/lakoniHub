import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const test = await Test.findById(id);
    if (!test) return NextResponse.json({ message: 'Test tidak ditemukan' }, { status: 404 });
    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil test' }, { status: 500 });
  }
}
