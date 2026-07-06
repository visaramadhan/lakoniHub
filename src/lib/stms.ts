/**
 * Smart Team Matching System (STMS) Engine
 * Based on the rules provided for FreelanceHub platform.
 */

export const RANK_POINTS = {
  S: 100,
  A: 70,
  B: 40,
  C: 20,
  D: 0,
};

export const RANK_WEIGHTS = {
  S: 40,
  A: 30,
  B: 20,
  C: 10,
};

/**
 * 12. SKILL ENGINE
 * SkillMatch = (MatchedSkillWeight / TotalRequiredSkillWeight) * 100
 */
export const calculateSkillMatch = (userSkills: string[], requiredSkills: { skill: string; weight: number }[]) => {
  if (requiredSkills.length === 0) return 100;
  
  const totalWeight = requiredSkills.reduce((acc, curr) => acc + curr.weight, 0);
  const matchedWeight = requiredSkills
    .filter(rs => userSkills.includes(rs.skill))
    .reduce((acc, curr) => acc + curr.weight, 0);
    
  return (matchedWeight / totalWeight) * 100;
};

/**
 * 13. AVAILABILITY ENGINE
 * Availability = 100 - (CurrentWorkload * WorkloadFactor)
 * Workload Score: Kosong(100), Ringan(80), Sedang(60), Berat(30), Overload(0)
 */
export const calculateAvailability = (currentWorkload: number) => {
  // Simplified logic: workload is 0-100
  return 100 - currentWorkload;
};

/**
 * 14. REPUTATION ENGINE
 * Reputation = (Client * 0.35) + (Deadline * 0.25) + (Complaint * 0.2) + (Collaboration * 0.1) + (Admin * 0.1)
 */
export const calculateReputation = (stats: any) => {
  const { clientSatisfaction, deadlineAccuracy, complaintRate, collaboration, adminReview } = stats;
  // Complaint rate is inverse (higher is worse)
  const complaintScore = 100 - complaintRate;
  
  return (clientSatisfaction * 0.35) + 
         (deadlineAccuracy * 0.25) + 
         (complaintScore * 0.2) + 
         (collaboration * 0.1) + 
         (adminReview * 0.1);
};

/**
 * 8. DYNAMIC RANKING FORMULA
 * FinalScore = (Initial * 0.2) + (Client * 0.3) + (Project * 0.2) + (Deadline * 0.1) + (Activity * 0.05) + (Peer * 0.05) + (Admin * 0.1)
 */
export const calculateDynamicRankScore = (stats: any) => {
  const { initialScore, clientSatisfaction, projectSuccess, deadlineAccuracy, activity, peerReview, adminReview } = stats;
  
  return (initialScore * 0.2) + 
         (clientSatisfaction * 0.3) + 
         (projectSuccess * 0.2) + 
         (deadlineAccuracy * 0.1) + 
         (activity * 0.05) + 
         (peerReview * 0.05) + 
         (adminReview * 0.1);
};

/**
 * 7. RANK CONVERSION
 */
export const getRankFromScore = (score: number) => {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

/**
 * 10. TEAM CAPABILITY FORMULA
 * TeamCapability = Sum(CapabilityPoint_i)
 */
export const calculateTeamCapability = (members: any[]) => {
  return members.reduce((acc, member) => acc + (RANK_POINTS[member.rank as keyof typeof RANK_POINTS] || 0), 0);
};

/**
 * 15. TEAM COMPATIBILITY ENGINE (Synergy)
 * TeamSynergy = Sum(CompatibilityPair) / TotalPair
 */
export const calculateTeamSynergy = (pairs: number[]) => {
  if (pairs.length === 0) return 100;
  return pairs.reduce((acc, curr) => acc + curr, 0) / pairs.length;
};

/**
 * 16. RISK ENGINE
 * Risk = (DeadlineRisk + SkillMismatch + Overload + ConflictHistory) / 4
 */
export const calculateRisk = (deadlineRisk: number, skillMismatch: number, overload: number, conflictHistory: number) => {
  return (deadlineRisk + skillMismatch + overload + conflictHistory) / 4;
};

/**
 * 17. FINAL TEAM SCORE
 * FinalTeamScore = (Skill * 0.25) + (Capability * 0.2) + (Availability * 0.1) + (Reputation * 0.2) + (Synergy * 0.15) + (Budget * 0.05) + (RiskInverse * 0.05)
 */
export const calculateFinalTeamScore = (params: {
  skill: number;
  capability: number;
  availability: number;
  reputation: number;
  synergy: number;
  budget: number;
  risk: number;
}) => {
  const riskInverse = 100 - params.risk;
  return (params.skill * 0.25) + 
         (params.capability * 0.2) + 
         (params.availability * 0.1) + 
         (params.reputation * 0.2) + 
         (params.synergy * 0.15) + 
         (params.budget * 0.05) + 
         (riskInverse * 0.05);
};

/**
 * 18. FEE DISTRIBUTION
 * MemberFee = (Weight_i / Sum(Weight)) * FreelancerPool
 */
export const calculateFeeDistribution = (members: { rank: string }[], pool: number) => {
  const totalWeight = members.reduce((acc, m) => acc + (RANK_WEIGHTS[m.rank as keyof typeof RANK_WEIGHTS] || 0), 0);
  if (totalWeight === 0) return members.map(() => 0);
  
  return members.map(m => {
    const weight = RANK_WEIGHTS[m.rank as keyof typeof RANK_WEIGHTS] || 0;
    return (weight / totalWeight) * pool;
  });
};
