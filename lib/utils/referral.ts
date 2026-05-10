import User from '@/lib/models/User';

export function generateReferralCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X');
  // 36^5 = ~60 million combinations, independent of name
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `NAAS-${prefix}${random}`;
}

// Keeps generating until it finds a code not already in the database
export async function generateUniqueReferralCode(name: string): Promise<string> {
  let code: string;
  let attempts = 0;
  do {
    code = generateReferralCode(name);
    attempts++;
    if (attempts > 10) throw new Error('Could not generate unique referral code');
  } while (await User.exists({ referralCode: code }));
  return code;
}

export function calculateReward(
  rewardType: 'none' | 'fixed' | 'percentage' | undefined,
  rewardValue: number | undefined,
  bookingTotal: number
): number {
  if (!rewardType || rewardType === 'none') return 0;
  if (!rewardValue || rewardValue <= 0) return 0;

  if (rewardType === 'fixed') {
    return rewardValue;
  }
  if (rewardType === 'percentage') {
    return Math.round((bookingTotal * rewardValue) / 100 * 100) / 100;
  }
  return 0;
}
