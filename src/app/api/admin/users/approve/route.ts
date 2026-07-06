import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const approved = searchParams.get('approved');
    const status = searchParams.get('status');
    const rank = searchParams.get('rank');
    
    await dbConnect();
    
    let query: any = { role: 'FREELANCER' };
    
    if (status) {
      if (status === 'PENDING') {
        query.$or = [
          { status: 'PENDING' },
          { status: { $exists: false } },
          { status: '' }
        ];
        query.isApproved = false;
      } else {
        query.status = status;
      }
    } else if (approved === 'true') {
      query.status = 'APPROVED';
    } else if (approved === 'false') {
      query.$or = [
        { status: 'PENDING' },
        { status: { $exists: false } },
        { status: '' }
      ];
      query.isApproved = false;
    }

    if (rank && rank !== 'ALL') {
      query.rank = rank;
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    const rankOrder: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, D: 5 };
    const sorted = users.sort((a: any, b: any) => {
      const ra = rankOrder[a.rank] ?? 999;
      const rb = rankOrder[b.rank] ?? 999;
      if (ra !== rb) return ra - rb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return NextResponse.json(sorted);
  } catch (error: any) {
    return NextResponse.json({ message: 'Gagal mengambil data user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, action } = await req.json();

    await dbConnect();

    if (action === 'APPROVE') {
      await User.findByIdAndUpdate(userId, { 
        isApproved: true,
        status: 'APPROVED'
      });
      return NextResponse.json({ message: 'User berhasil disetujui' });
    } else if (action === 'REJECT') {
      await User.findByIdAndUpdate(userId, { 
        isApproved: false,
        status: 'REJECTED'
      });
      return NextResponse.json({ message: 'User berhasil ditolak' });
    }

    return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
