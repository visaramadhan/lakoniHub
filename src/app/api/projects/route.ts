import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find({
      status: { $in: ['OPEN', 'ON_PROGRESS'] }
    }).sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data proyek' }, { status: 500 });
  }
}

