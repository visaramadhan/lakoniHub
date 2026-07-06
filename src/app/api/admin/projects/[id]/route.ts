import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import { calculateTeamCapability } from '@/lib/stms';

const MAX_WORKLOAD_FOR_ASSIGNMENT = 85;

const normalizeUserPositions = (user: any) => {
  if (Array.isArray(user?.positions) && user.positions.length > 0) return user.positions;
  if (user?.position) return [{ name: user.position, rank: user.rank || 'C', isPrimary: true }];
  return [];
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const project = await Project.findById(id).populate('team.user', 'name email position positions rank');
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching project' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (Array.isArray(body.team)) {
      const userIds = body.team.map((member: any) => member.user).filter(Boolean);
      const users = await User.find({ _id: { $in: userIds } });
      const userMap = new Map(users.map((user: any) => [String(user._id), user]));

      for (const member of body.team) {
        const user = userMap.get(String(member.user));
        if (!user) {
          return NextResponse.json({ message: 'Ada freelancer yang tidak ditemukan saat assign team' }, { status: 400 });
        }
        if (Number(user.currentWorkload || 0) >= MAX_WORKLOAD_FOR_ASSIGNMENT) {
          return NextResponse.json({ message: `${user.name} sedang overload dan tidak bisa di-assign` }, { status: 400 });
        }
        const hasPosition = normalizeUserPositions(user).some((pos: any) => pos.name === member.position);
        if (!hasPosition) {
          return NextResponse.json({ message: `${user.name} tidak memiliki posisi ${member.position}` }, { status: 400 });
        }
      }

      body.capabilityPoint = calculateTeamCapability(
        body.team.map((member: any) => ({ rank: member.rankAtAssignment || 'D' }))
      );
    }

    if (body.status === 'ON_PROGRESS' && existingProject.status !== 'ON_PROGRESS') {
      const teamMembers = Array.isArray(body.team) ? body.team : existingProject.team || [];
      const userIds = teamMembers.map((member: any) => member.user).filter(Boolean);
      const incrementBy = teamMembers.length > 0 ? Math.max(10, Math.min(30, Math.round(60 / teamMembers.length))) : 0;
      if (userIds.length > 0 && incrementBy > 0) {
        await User.updateMany(
          { _id: { $in: userIds } },
          [{ $set: { currentWorkload: { $min: [100, { $add: ['$currentWorkload', incrementBy] }] } } }]
        );
      }
    }

    const project = await Project.findByIdAndUpdate(id, body, { new: true }).populate('team.user', 'name email position positions rank currentWorkload');
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating project' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    await Project.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Project deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting project' }, { status: 500 });
  }
}
