import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const targetPosition = searchParams.get('targetPosition');
    const targetRank = searchParams.get('targetRank');

    const query: any = {};
    if (category) query.category = category;
    if (targetPosition) query.targetPosition = targetPosition;
    if (targetRank && targetRank !== 'ALL') query.targetRank = targetRank;

    const tests = await Test.find(query).sort({ createdAt: -1 });
    return NextResponse.json(tests);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data test' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const test = await Test.create({
      title: body.title,
      category: body.category,
      targetPosition: body.targetPosition,
      targetRank: body.targetRank || 'ALL',
      type: body.type,
      passingScore: body.passingScore || 70,
      totalWeight: 0,
      questions: [],
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat test' }, { status: 500 });
  }
}

