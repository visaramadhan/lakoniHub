import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
import PartyTemplate from '@/models/PartyTemplate';
import {
  calculateAvailability,
  calculateDynamicRankScore,
  calculateFinalTeamScore,
  calculateReputation,
  calculateSkillMatch,
  RANK_POINTS,
} from '@/lib/stms';

const rankOrder: Record<string, number> = { D: 1, C: 2, B: 3, A: 4, S: 5 };

const normalizeUserPositions = (user: any) => {
  if (Array.isArray(user?.positions) && user.positions.length > 0) return user.positions;
  if (user?.position) return [{ name: user.position, rank: user.rank || 'C', isPrimary: true }];
  return [];
};

const buildRequiredSkills = (skills: string[] = []) =>
  skills.map((skill) => ({ skill, weight: 1 }));

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const project = await Project.findById(id).populate('team.user', 'name');
    if (!project) {
      return NextResponse.json({ message: 'Project tidak ditemukan' }, { status: 404 });
    }

    const freelancers = await User.find({
      role: 'FREELANCER',
      status: 'APPROVED',
      isApproved: true,
    }).select('-password');

    const parties = await PartyTemplate.find({})
      .populate('members.user', 'name email position positions skills currentWorkload stats');

    const assignedIds = new Set((project.team || []).map((member: any) => String(member.user?._id || member.user)));
    const requiredSkills = buildRequiredSkills(project.requiredSkills || []);

    const directRecommendations = (project.requiredPositions || []).map((requirement: any) => {
      const candidates = freelancers
        .filter((user: any) => !assignedIds.has(String(user._id)))
        .map((user: any) => {
          const matchedPosition = normalizeUserPositions(user).find((pos: any) => pos.name === requirement.position);
          if (!matchedPosition) return null;
          if ((rankOrder[matchedPosition.rank || 'D'] || 0) < (rankOrder[requirement.minRank || 'D'] || 0)) return null;

          const workload = Number(user.currentWorkload || 0);
          const availability = calculateAvailability(workload);
          const skill = calculateSkillMatch(user.skills || [], requiredSkills);
          const reputation = calculateReputation(user.stats || {
            clientSatisfaction: 0,
            deadlineAccuracy: 0,
            complaintRate: 0,
            collaboration: 0,
            adminReview: 0,
          });
          const dynamic = calculateDynamicRankScore(user.stats || {
            initialScore: 0,
            clientSatisfaction: 0,
            projectSuccess: 0,
            deadlineAccuracy: 0,
            activity: 0,
            peerReview: 0,
            adminReview: 0,
          });
          const score = calculateFinalTeamScore({
            skill,
            capability: RANK_POINTS[matchedPosition.rank as keyof typeof RANK_POINTS] || 0,
            availability,
            reputation,
            synergy: 80,
            budget: 80,
            risk: Math.max(0, workload - 20),
          });

          return {
            userId: user._id,
            name: user.name,
            position: matchedPosition.name,
            rank: matchedPosition.rank,
            workload,
            availability,
            skillScore: Math.round(skill * 10) / 10,
            dynamicScore: Math.round(dynamic * 10) / 10,
            finalScore: Math.round(score * 10) / 10,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.finalScore - a.finalScore)
        .slice(0, 5);

      return {
        requirement,
        candidates,
      };
    });

    const partyRecommendations = parties
      .map((party: any) => {
        const validMembers = (party.members || []).filter((member: any) => {
          const requirement = (project.requiredPositions || []).find((item: any) => item.position === member.position);
          if (!requirement) return false;
          if ((rankOrder[member.rank || 'D'] || 0) < (rankOrder[requirement.minRank || 'D'] || 0)) return false;
          if ((member.user?.currentWorkload || 0) >= 85) return false;
          return true;
        });

        if (validMembers.length === 0) return null;

        const matchedPositions = new Set(validMembers.map((member: any) => member.position));
        const coverage = matchedPositions.size / Math.max(1, (project.requiredPositions || []).length);
        const avgWorkload = validMembers.reduce((acc: number, member: any) => acc + Number(member.user?.currentWorkload || 0), 0) / validMembers.length;
        const avgSkill = validMembers.reduce((acc: number, member: any) => acc + calculateSkillMatch(member.user?.skills || [], requiredSkills), 0) / validMembers.length;
        const avgRep = validMembers.reduce((acc: number, member: any) => acc + calculateReputation(member.user?.stats || {
          clientSatisfaction: 0,
          deadlineAccuracy: 0,
          complaintRate: 0,
          collaboration: 0,
          adminReview: 0,
        }), 0) / validMembers.length;
        const avgCapability = validMembers.reduce((acc: number, member: any) => acc + (RANK_POINTS[member.rank as keyof typeof RANK_POINTS] || 0), 0) / validMembers.length;

        const score = calculateFinalTeamScore({
          skill: avgSkill,
          capability: avgCapability,
          availability: 100 - avgWorkload,
          reputation: avgRep,
          synergy: 85,
          budget: 80,
          risk: Math.max(0, avgWorkload - 20),
        }) + (coverage * 10);

        return {
          partyId: party._id,
          name: party.name,
          description: party.description,
          coverage: Math.round(coverage * 100),
          memberCount: validMembers.length,
          avgWorkload: Math.round(avgWorkload * 10) / 10,
          finalScore: Math.round(score * 10) / 10,
          members: validMembers.map((member: any) => ({
            userId: member.user?._id,
            name: member.user?.name,
            position: member.position,
            rank: member.rank,
          })),
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.finalScore - a.finalScore)
      .slice(0, 5);

    return NextResponse.json({
      directRecommendations,
      partyRecommendations,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil rekomendasi tim' }, { status: 500 });
  }
}
