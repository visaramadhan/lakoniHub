import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PartyTemplate from '@/models/PartyTemplate';

export async function GET() {
  try {
    await dbConnect();
    const parties = await PartyTemplate.find({})
      .populate('members.user', 'name email position positions skills')
      .sort({ createdAt: -1 });
    return NextResponse.json(parties);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil party template' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const party = await PartyTemplate.create({
      name: body.name,
      description: body.description,
      members: body.members || [],
    });
    return NextResponse.json(party, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat party template' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'ID party wajib diisi' }, { status: 400 });
    }
    await PartyTemplate.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Party template dihapus' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus party template' }, { status: 500 });
  }
}
