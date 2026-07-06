import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MasterData from '@/models/MasterData';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    const query = type ? { type } : {};
    const data = await MasterData.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching master data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newItem = await MasterData.create(body);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating master data' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await MasterData.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting data' }, { status: 500 });
  }
}
