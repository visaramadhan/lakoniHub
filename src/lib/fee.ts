/**
 * Fee Distribution & Bonus/Penalty System
 */

import { RANK_WEIGHTS } from './stms';

export const BONUS_FACTORS = {
  LEAD_ROLE: 0.20, // +20%
  FAST_DELIVERY: 0.10, // +10%
  ZERO_COMPLAINT: 0.10, // +10%
  ENTERPRISE_PROJECT: 0.15, // +15%
};

export const PENALTY_FACTORS = {
  LATE_DEADLINE: 0.15, // -15%
  GHOSTING: 1.0, // Suspend / 100% loss
  HIGH_COMPLAINT: 0.20, // -20% or rank down
};

/**
 * 18. DISTRIBUSI FEE
 * MemberFee = (Weight_i / Sum(Weight)) * FreelancerPool
 */
export const calculateBaseFee = (members: { rank: string }[], pool: number) => {
  const totalWeight = members.reduce((acc, m) => acc + (RANK_WEIGHTS[m.rank as keyof typeof RANK_WEIGHTS] || 0), 0);
  
  if (totalWeight === 0) return members.map(() => 0);
  
  return members.map(m => {
    const weight = RANK_WEIGHTS[m.rank as keyof typeof RANK_WEIGHTS] || 0;
    return (weight / totalWeight) * pool;
  });
};

/**
 * 19. SISTEM BONUS
 */
export const calculateBonus = (baseFee: number, bonuses: (keyof typeof BONUS_FACTORS)[]) => {
  let totalBonus = 0;
  bonuses.forEach(b => {
    totalBonus += baseFee * BONUS_FACTORS[b];
  });
  return totalBonus;
};

/**
 * 20. SISTEM PENALTI
 */
export const calculatePenalty = (baseFee: number, penalties: (keyof typeof PENALTY_FACTORS)[]) => {
  let totalPenalty = 0;
  penalties.forEach(p => {
    totalPenalty += baseFee * PENALTY_FACTORS[p];
  });
  return totalPenalty;
};

/**
 * Final Fee Calculation
 */
export const calculateFinalFee = (params: {
  rank: string;
  members: { rank: string }[];
  pool: number;
  isLead?: boolean;
  isFast?: boolean;
  isZeroComplaint?: boolean;
  isEnterprise?: boolean;
  isLate?: boolean;
}) => {
  // 1. Calculate base fee share
  const totalWeight = params.members.reduce((acc, m) => acc + (RANK_WEIGHTS[m.rank as keyof typeof RANK_WEIGHTS] || 0), 0);
  const myWeight = RANK_WEIGHTS[params.rank as keyof typeof RANK_WEIGHTS] || 0;
  let fee = (myWeight / totalWeight) * params.pool;
  
  // 2. Apply Bonuses
  if (params.isLead) fee += fee * BONUS_FACTORS.LEAD_ROLE;
  if (params.isFast) fee += fee * BONUS_FACTORS.FAST_DELIVERY;
  if (params.isZeroComplaint) fee += fee * BONUS_FACTORS.ZERO_COMPLAINT;
  if (params.isEnterprise) fee += fee * BONUS_FACTORS.ENTERPRISE_PROJECT;
  
  // 3. Apply Penalties
  if (params.isLate) fee -= fee * PENALTY_FACTORS.LATE_DEADLINE;
  
  return Math.max(fee, 0);
};
