/**
 * Reading Plans — Local plan data for onboarding and offline access.
 *
 * These plans can be seeded into Supabase or used directly in the UI
 * when recommending content to new users before they hit the network.
 */

export type { ReadingPlanData, PlanDay } from './startHere';

export { startHerePlan } from './startHere';
export { psalmsForHardDaysPlan } from './psalmsForHardDays';
export { foundationsOfFaithPlan } from './foundationsOfFaith';

import { startHerePlan } from './startHere';
import { psalmsForHardDaysPlan } from './psalmsForHardDays';
import { foundationsOfFaithPlan } from './foundationsOfFaith';
import { ReadingPlanData } from './startHere';

/** All starter plans, ordered by recommended priority */
export const allStarterPlans: ReadingPlanData[] = [
  startHerePlan,
  psalmsForHardDaysPlan,
  foundationsOfFaithPlan,
];

/** Quick lookup by slug */
export const planBySlug = (slug: string): ReadingPlanData | undefined =>
  allStarterPlans.find((p) => p.slug === slug);

/** The default plan for brand-new users */
export const defaultOnboardingPlan = startHerePlan;
