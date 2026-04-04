// Subscription service - RevenueCat integration placeholder

// For MVP/hackathon, this is a mock implementation.
// Replace with RevenueCat SDK before App Store submission.

export type PlanType = 'monthly' | 'annual' | 'lifetime';

export interface SubscriptionInfo {
  isActive: boolean;
  planType: PlanType | null;
  expiresAt: string | null;
}

// Mock: check subscription status
export async function checkSubscription(): Promise<SubscriptionInfo> {
  // TODO: Replace with RevenueCat Purchases.getCustomerInfo()
  return {
    isActive: false,
    planType: null,
    expiresAt: null,
  };
}

// Mock: purchase subscription
export async function purchaseSubscription(plan: PlanType): Promise<boolean> {
  // TODO: Replace with RevenueCat Purchases.purchasePackage()
  console.log(`[Subscription] Purchase ${plan} - mock implementation`);
  return false;
}

// Mock: restore purchases
export async function restorePurchases(): Promise<boolean> {
  // TODO: Replace with RevenueCat Purchases.restorePurchases()
  console.log('[Subscription] Restore purchases - mock implementation');
  return false;
}
