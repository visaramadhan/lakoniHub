import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import FreelancerParty from '@/models/FreelancerParty';
import ProjectApplication from '@/models/ProjectApplication';

const normalizeUserPositions = (user: any) => {
  if (Array.isArray(user?.positions) && user.positions.length > 0) {
    return user.positions;
  }

  if (user?.position) {
    return [{ name: user.position, rank: user.rank || 'C', isPrimary: true }];
  }

  return [];
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;

    if (!currentUserId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = await params;

    await dbConnect();

    const [project, applicant] = await Promise.all([
      Project.findById(id),
      User.findById(currentUserId)
    ]);

    if (!project) {
      return NextResponse.json({ message: 'Project tidak ditemukan' }, { status: 404 });
    }

    if (!applicant) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json({ message: 'Project ini sudah tidak menerima apply baru' }, { status: 400 });
    }

    const selectedPosition = String(body.position || '');
    if (!selectedPosition) {
      return NextResponse.json({ message: 'Posisi yang dilamar wajib dipilih' }, { status: 400 });
    }

    const projectRequirement = (project.requiredPositions || []).find((item: any) => item.position === selectedPosition);
    if (!projectRequirement) {
      return NextResponse.json({ message: 'Posisi tidak tersedia pada project ini' }, { status: 400 });
    }

    const applicantPosition = normalizeUserPositions(applicant).find((item: any) => item.name === selectedPosition);
    if (!applicantPosition) {
      return NextResponse.json({ message: 'Posisi akun Anda tidak sesuai dengan posisi yang dilamar' }, { status: 400 });
    }

    const existingApplication = await ProjectApplication.findOne({
      project: project._id,
      applicant: currentUserId,
      position: selectedPosition,
      status: 'PENDING'
    });

    if (existingApplication) {
      return NextResponse.json({ message: 'Anda sudah mengajukan posisi ini pada project yang sama' }, { status: 400 });
    }

    const payload: Record<string, any> = {
      project: project._id,
      applicant: currentUserId,
      position: selectedPosition,
      applicationType: body.applicationType === 'PARTY' ? 'PARTY' : 'DIRECT',
      note: body.note || ''
    };

    if (payload.applicationType === 'PARTY') {
      if (!body.partyId) {
        return NextResponse.json({ message: 'Pilih party terlebih dahulu' }, { status: 400 });
      }

      const party = await FreelancerParty.findOne({
        _id: body.partyId,
        owner: currentUserId
      });

      if (!party) {
        return NextResponse.json({ message: 'Party tidak ditemukan atau bukan milik Anda' }, { status: 404 });
      }

      const hasMatchingMember = (party.members || []).some((member: any) =>
        (project.requiredPositions || []).some((requirement: any) => requirement.position === member.position)
      );

      if (!hasMatchingMember) {
        return NextResponse.json({ message: 'Party belum memiliki member yang sesuai kebutuhan posisi project' }, { status: 400 });
      }

      payload.party = party._id;
      payload.partyName = party.name;
    }

    const application = await ProjectApplication.create(payload);
    const populated = await ProjectApplication.findById(application._id)
      .populate('applicant', 'name email position positions rank')
      .populate('party', 'name description');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengirim pengajuan project' }, { status: 500 });
  }
}
