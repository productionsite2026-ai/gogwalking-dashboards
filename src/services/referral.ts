/**
 * Service Parrainage - Système de codes de parrainage et récompenses
 */

export interface ReferralCode {
  id: string;
  code: string;
  referrerId: string;
  referrerName: string;
  createdAt: Date;
  expiresAt?: Date;
  active: boolean;
  usageCount: number;
  maxUsages?: number;
  rewardAmount: number; // en euros
  rewardType: 'credit' | 'discount' | 'commission';
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referralCodeId: string;
  referredUserId: string;
  referredUserName: string;
  rewardAmount: number;
  rewardType: 'credit' | 'discount' | 'commission';
  status: 'pending' | 'earned' | 'paid';
  earnedAt: Date;
  paidAt?: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewardsEarned: number;
  totalRewardsPaid: number;
  pendingRewards: number;
}

/**
 * Générer un code de parrainage unique
 */
export function generateReferralCode(referrerId: string, referrerName: string): ReferralCode {
  const code = `GOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  return {
    id: `ref-${Date.now()}`,
    code,
    referrerId,
    referrerName,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
    active: true,
    usageCount: 0,
    maxUsages: undefined,
    rewardAmount: 10, // 10€ par parrainage
    rewardType: 'credit',
  };
}

/**
 * Créer un code de parrainage
 */
export async function createReferralCode(
  referrerId: string,
  referrerName: string
): Promise<ReferralCode> {
  const referralCode = generateReferralCode(referrerId, referrerName);

  try {
    const response = await fetch('/api/referrals/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referralCode),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du code');
    }

    return referralCode;
  } catch (error) {
    console.error('Erreur création code parrainage:', error);
    throw error;
  }
}

/**
 * Valider et utiliser un code de parrainage
 */
export async function useReferralCode(
  code: string,
  referredUserId: string,
  referredUserName: string
): Promise<ReferralReward | null> {
  try {
    const response = await fetch('/api/referrals/use-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        referredUserId,
        referredUserName,
      }),
    });

    if (!response.ok) {
      throw new Error('Code de parrainage invalide ou expiré');
    }

    return response.json();
  } catch (error) {
    console.error('Erreur utilisation code parrainage:', error);
    return null;
  }
}

/**
 * Récupérer les statistiques de parrainage d'un utilisateur
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const response = await fetch(`/api/referrals/stats/${userId}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalRewardsEarned: 0,
      totalRewardsPaid: 0,
      pendingRewards: 0,
    };
  }
}

/**
 * Récupérer les récompenses de parrainage d'un utilisateur
 */
export async function getReferralRewards(userId: string): Promise<ReferralReward[]> {
  try {
    const response = await fetch(`/api/referrals/rewards/${userId}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des récompenses');
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération récompenses:', error);
    return [];
  }
}

/**
 * Récupérer le code de parrainage d'un utilisateur
 */
export async function getUserReferralCode(userId: string): Promise<ReferralCode | null> {
  try {
    const response = await fetch(`/api/referrals/codes/${userId}`);

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération code parrainage:', error);
    return null;
  }
}

/**
 * Convertir les crédits de parrainage en réduction
 */
export async function convertCreditsToDiscount(
  userId: string,
  creditAmount: number
): Promise<boolean> {
  try {
    const response = await fetch('/api/referrals/convert-credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        creditAmount,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur conversion crédits:', error);
    return false;
  }
}

/**
 * Obtenir le leaderboard des parrainages
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<Array<{
  userId: string;
  userName: string;
  totalReferrals: number;
  totalRewardsEarned: number;
}>> {
  try {
    const response = await fetch(`/api/referrals/leaderboard?limit=${limit}`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du leaderboard');
    }

    return response.json();
  } catch (error) {
    console.error('Erreur récupération leaderboard:', error);
    return [];
  }
}

export default {
  generateReferralCode,
  createReferralCode,
  useReferralCode,
  getReferralStats,
  getReferralRewards,
  getUserReferralCode,
  convertCreditsToDiscount,
  getReferralLeaderboard,
};
