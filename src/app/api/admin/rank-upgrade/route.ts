import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RankUpgradeRequest from '@/models/RankUpgradeRequest';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const query: any = {};
    if (status !== 'ALL') query.status = status;

    const list = await RankUpgradeRequest.find(query)
      .populate('user', 'name email rank position stats cvUrl cvName')
      .sort({ createdAt: -1 });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil pengajuan' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { requestId, action } = await req.json();
    if (!requestId || !action) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

    if (action === 'APPROVE') {
      const updated = await RankUpgradeRequest.findByIdAndUpdate(
        requestId,
        { status: 'APPROVED', reviewedAt: new Date() },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    if (action === 'REJECT') {
      const updated = await RankUpgradeRequest.findByIdAndUpdate(
        requestId,
        { status: 'REJECTED', reviewedAt: new Date() },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: 'Action tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memproses pengajuan' }, { status: 500 });
  }
}

