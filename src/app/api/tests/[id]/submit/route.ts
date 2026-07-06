import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Test from '@/models/Test';
import Submission from '@/models/Submission';

const rankScoreOrder: Record<string, number> = {
  D: 1,
  C: 2,
  B: 3,
  A: 4,
  S: 5,
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    const { id } = await params;
    const test = await Test.findById(id);
    if (!test) return NextResponse.json({ message: 'Test tidak ditemukan' }, { status: 404 });

    const body = await req.json();
    const answersMap: Record<string, number> = body.answers || {};

    const answers = (test.questions || []).map((q: any, idx: number) => {
      const answerIndex = typeof answersMap[idx] === 'number' ? answersMap[idx] : -1;
      const isCorrect = answerIndex >= 0 && answerIndex === q.correctIndex;
      return { questionIndex: idx, answerIndex, isCorrect };
    });

    const totalWeight = (test.questions || []).reduce((acc: number, q: any) => acc + (q.weight || 1), 0) || 1;
    const correctWeight = (test.questions || []).reduce((acc: number, q: any, idx: number) => {
      const answerIndex = typeof answersMap[idx] === 'number' ? answersMap[idx] : -1;
      const isCorrect = answerIndex >= 0 && answerIndex === q.correctIndex;
      return acc + (isCorrect ? (q.weight || 1) : 0);
    }, 0);

    const score = Math.round((correctWeight / totalWeight) * 1000) / 10;
    const status = score >= (test.passingScore || 70) ? 'PASSED' : 'FAILED';

    const submission = await Submission.create({
      user: user._id,
      test: test._id,
      answers,
      score,
      status,
    });

    if (status === 'PASSED' && test.category === 'TECHNICAL' && test.targetPosition) {
      const positions = Array.isArray(user.positions) ? [...user.positions] : [];
      const targetRank = test.targetRank && test.targetRank !== 'ALL' ? test.targetRank : user.rank || 'C';
      const existingIndex = positions.findIndex((item: any) => item.name === test.targetPosition);

      if (existingIndex >= 0) {
        const currentRank = positions[existingIndex].rank || 'D';
        if ((rankScoreOrder[targetRank] || 0) > (rankScoreOrder[currentRank] || 0)) {
          positions[existingIndex].rank = targetRank;
        }
      } else {
        positions.push({
          name: test.targetPosition,
          rank: targetRank,
          isPrimary: positions.length === 0,
        });
      }

      user.positions = positions;
      if (!user.position) {
        user.position = test.targetPosition;
      }
      await user.save();
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal submit jawaban' }, { status: 500 });
  }
}
