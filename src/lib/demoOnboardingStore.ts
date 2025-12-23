import type { Company, Profile } from "@/hooks/useAdminData";

const STORAGE_KEY = "demo_onboarding_submissions_v1";
const PROGRESS_KEY_PREFIX = "demo_onboarding_progress_step_";

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export type DemoOnboardingSubmission = {
  submitted_at: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    job_title: string | null;
    user_type: string;
    goals: string[];
    regions_covered: string[];
    upsell_interest: boolean;
  };
  company: {
    id: string;
    name: string;
    website: string | null;
    industry: string | null;
    address: string | null;
    logo_url: string | null;
  };
  invited_team_emails: string[];
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getDemoOnboardingStep(userId: string): number {
  const raw = localStorage.getItem(`${PROGRESS_KEY_PREFIX}${userId}`);
  const step = raw ? Number(raw) : 1;
  return Number.isFinite(step) && step >= 1 && step <= 6 ? step : 1;
}

export function setDemoOnboardingStep(userId: string, step: number) {
  localStorage.setItem(`${PROGRESS_KEY_PREFIX}${userId}`, String(step));
}

export function markDemoOnboardingComplete(userId: string) {
  localStorage.setItem(`${PROGRESS_KEY_PREFIX}${userId}`, "6");
  localStorage.setItem(`demo_onboarding_completed_${userId}`, "true");
}

export function isDemoOnboardingComplete(userId: string): boolean {
  return localStorage.getItem(`demo_onboarding_completed_${userId}`) === "true";
}

export function addDemoOnboardingSubmission(submission: DemoOnboardingSubmission) {
  const existing = safeParse<DemoOnboardingSubmission[]>(localStorage.getItem(STORAGE_KEY), []);
  const next = [submission, ...existing].slice(0, 200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getDemoCompanies(): Company[] {
  const subs = safeParse<DemoOnboardingSubmission[]>(localStorage.getItem(STORAGE_KEY), []);
  const map = new Map<string, Company>();

  for (const s of subs) {
    map.set(s.company.id, {
      id: s.company.id,
      name: s.company.name,
      website: s.company.website,
      industry: s.company.industry,
      address: s.company.address,
      logo_url: s.company.logo_url,
      created_at: s.submitted_at,
      updated_at: s.submitted_at,
      status: "active",
      total_leads: 0,
      total_spend: 0,
      monthly_budget: null,
      notes: null,
    });
  }

  return Array.from(map.values()).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getDemoProfiles(): Array<Profile & { company?: { id: string; name: string } | null }> {
  const subs = safeParse<DemoOnboardingSubmission[]>(localStorage.getItem(STORAGE_KEY), []);

  return subs.map((s) => ({
    id: `demo_profile_${s.user.id}`,
    user_id: s.user.id,
    email: s.user.email,
    full_name: s.user.full_name,
    phone: s.user.phone,
    avatar_url: null,
    company_id: s.company.id,
    user_type: s.user.user_type,
    status: "active",
    created_at: s.submitted_at,
    updated_at: s.submitted_at,
    company: { id: s.company.id, name: s.company.name },
  }));
}
