import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import ProjectApplication from '@/models/ProjectApplication';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const query: Record<string, any> = { applicant: currentUserId };

    if (projectId) {
      query.project = projectId;
    }

    const applications = await ProjectApplication.find(query)
      .populate('project', 'title status deadline projectType')
      .populate('party', 'name description')
      .sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil project application' }, { status: 500 });
  }
}
