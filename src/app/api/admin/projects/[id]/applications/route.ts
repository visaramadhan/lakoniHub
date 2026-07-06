import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProjectApplication from '@/models/ProjectApplication';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const applications = await ProjectApplication.find({ project: id })
      .populate('applicant', 'name email position positions rank skills')
      .populate('party', 'name description members')
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil application project' }, { status: 500 });
  }
}
