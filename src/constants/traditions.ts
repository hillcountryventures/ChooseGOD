/**
 * Christian tradition options surfaced in onboarding + Settings.
 *
 * Per Decision #13 (Option D). Users pick a tradition at onboarding;
 * ChooseGOD respects it across AI system prompts, content recommendations,
 * and tone. No other Bible app does this \u2014 this is a moat.
 *
 * Values are stable (DB-persisted). Labels are surfaced only in the UI.
 */

export type Tradition =
  | 'catholic'
  | 'protestant_conservative'
  | 'protestant_progressive'
  | 'orthodox'
  | 'non_denominational'
  | 'exploring';

export interface TraditionOption {
  id: Tradition;
  label: string;
  shortLabel: string;
  description: string;
}

export const TRADITION_OPTIONS: TraditionOption[] = [
  {
    id: 'non_denominational',
    label: 'Non-denominational',
    shortLabel: 'Non-denom',
    description: 'Broadly evangelical, Scripture-centered, no particular denominational home.',
  },
  {
    id: 'protestant_conservative',
    label: 'Conservative Protestant',
    shortLabel: 'Conservative',
    description: 'Baptist, PCA, Lutheran (LCMS), Assemblies of God, Reformed, and similar.',
  },
  {
    id: 'protestant_progressive',
    label: 'Progressive Protestant',
    shortLabel: 'Progressive',
    description: 'Mainline, affirming, Methodist, ELCA, PCUSA, Episcopal, UCC and similar.',
  },
  {
    id: 'catholic',
    label: 'Catholic',
    shortLabel: 'Catholic',
    description: 'Roman Catholic \u2014 respects sacraments, Marian theology, the Magisterium.',
  },
  {
    id: 'orthodox',
    label: 'Orthodox',
    shortLabel: 'Orthodox',
    description: 'Eastern or Oriental Orthodox \u2014 respects theosis, icons, liturgical tradition.',
  },
  {
    id: 'exploring',
    label: 'Just exploring',
    shortLabel: 'Exploring',
    description:
      'Seeking, rebuilding faith, or still figuring it out. No pressure \u2014 come as you are.',
  },
];

export const DEFAULT_TRADITION: Tradition = 'non_denominational';

export function getTraditionLabel(t?: Tradition): string {
  return TRADITION_OPTIONS.find((o) => o.id === (t ?? DEFAULT_TRADITION))?.label ??
    'Non-denominational';
}
