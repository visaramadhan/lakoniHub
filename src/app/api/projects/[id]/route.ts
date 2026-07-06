import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const project = await Project.findById(id).populate('team.user', 'name email position positions');
    if (!project) {
      return NextResponse.json({ message: 'Project tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil detail proyek' }, { status: 500 });
  }
}
