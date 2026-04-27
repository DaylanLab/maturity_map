// CMMI tier-transition guidance.
// Each transition gives a headline and a short list of concrete actions
// the team can take to climb to the next maturity level.

export const TIER_TRANSITION_TIPS = {
  '1->2': {
    headline: 'Establish basic discipline',
    actions: [
      'Document the current process — even if informal today',
      'Assign clear ownership and accountability',
      'Track baseline metrics (completion rates, cycle times)',
      'Train staff on the documented procedure',
    ],
  },
  '2->3': {
    headline: 'Standardize across the organization',
    actions: [
      'Create reusable templates and reference architectures',
      'Establish governance and recurring review cadences',
      'Cross-train teams to reduce key-person dependencies',
      'Align local process to enterprise standards',
    ],
  },
  '3->4': {
    headline: 'Drive with quantitative data',
    actions: [
      'Define quantitative performance baselines',
      'Apply statistical process control to detect drift early',
      'Use predictive analytics to anticipate failures',
      'Tie KPIs directly to business outcomes',
    ],
  },
  '4->5': {
    headline: 'Innovate and continuously improve',
    actions: [
      'Run causal analysis on systemic issues',
      'Pilot emerging technologies and methods',
      'Benchmark against industry leaders',
      'Stand up a formal continuous-improvement program',
    ],
  },
}

// Per-function contextual focus — used for high-level guidance cards.
export const FUNCTION_TIPS = {
  GV: 'Strengthen risk governance, leadership accountability, and policy enforcement across the enterprise.',
  ID: 'Improve asset visibility, supplier risk understanding, and ongoing risk-assessment cadence.',
  PR: 'Enhance access controls, data protection, platform hardening, and resilience design.',
  DE: 'Expand monitoring coverage, anomaly detection, and adverse-event analysis capability.',
  RS: 'Mature incident response playbooks, communications, and mitigation execution.',
  RC: 'Build resilient recovery plans, RTO/RPO discipline, and stakeholder communications.',
}

// CMMI level descriptors (used in tooltips/legends).
export const CMMI_LEVELS = {
  1: { name: 'Initial', summary: 'Processes are unpredictable, reactive, and often ad hoc.' },
  2: { name: 'Managed', summary: 'Processes are planned, performed, measured, and controlled at the project level.' },
  3: { name: 'Defined', summary: 'Processes are standardized across the organization, proactive, and tailored for projects.' },
  4: { name: 'Quantitatively Managed', summary: 'Data-driven processes are measured and controlled, leading to predictable outcomes.' },
  5: { name: 'Optimizing', summary: 'Stable and flexible processes focus on continuous improvement and innovation.' },
}

// Returns the next-tier transition tip for the given current score.
export function getTransitionTip(currentScore, targetScore) {
  const fromTier = Math.max(1, Math.min(5, Math.ceil(currentScore)))
  const toTier = Math.max(1, Math.min(5, Math.ceil(targetScore)))
  if (fromTier >= toTier) return null
  const key = `${fromTier}->${fromTier + 1}`
  return TIER_TRANSITION_TIPS[key] ?? null
}

export function levelInfo(score) {
  const lvl = Math.max(1, Math.min(5, Math.ceil(score)))
  return CMMI_LEVELS[lvl]
}
