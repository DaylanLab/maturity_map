# Data Model — NIST CSF 2.0 Maturity Assessment Web App

This document defines the schema for a web application that measures an organization's cybersecurity maturity score against the NIST CSF 2.0 framework. The model supports Current Profiles, Target Profiles, gap analysis, action planning, and scored rollups at every level of the CSF hierarchy.

---

## Overview

The data is split into two categories:

- **Reference data** — the static CSF framework structure (Functions, Categories, Subcategories). Seeded once, shared across all organizations.
- **Tenant data** — everything scoped to a specific organization: assessments, scores, users, evidence, action plans.

Score rollup flows: `SubcategoryScore → CategoryScore → FunctionScore → OverallMaturityScore`

---

## A Note on NIST CSF 2.0 Weighting

**NIST does not prescribe weights.** The framework explicitly states (Section 2): *"the order and size of Functions, Categories, and Subcategories in the Core does not imply the sequence or importance of achieving them."* Organizations are expected to weight the framework based on their mission, risk appetite, and regulatory environment.

### Weight Design Principle

Weights are applied uniformly at each level of the hierarchy:

1. **All 6 Functions are equally weighted** — each contributes 1/6 (16.67%) to the overall score.
2. **All Categories within a Function are equally weighted** — each category receives an equal share of its function's weight.
3. **All Subcategories within a Category are equally weighted** — each subcategory receives an equal share of its category's weight.

The natural consequence: a subcategory inside a category with fewer subcategories is worth more than a subcategory inside a category with more subcategories. No manual ranking is introduced — the structure of the framework determines the relative impact.

> **Example:** RC.CO has 2 subcategories. RC.RP has 6. Both categories carry the same weight (8.33% of overall). So each RC.CO subcategory is worth 4.17% of the total score, while each RC.RP subcategory is worth 1.39% — making RC.CO's subcategories 3x more impactful individually.

---

### Seed Weights — All Three Levels

**Level 1: Functions** (equal, always 1/6 each)

| Function | # Categories | Function Weight |
|---|---|---|
| GV — Govern | 6 | 16.67% |
| ID — Identify | 3 | 16.67% |
| PR — Protect | 5 | 16.67% |
| DE — Detect | 2 | 16.67% |
| RS — Respond | 4 | 16.67% |
| RC — Recover | 2 | 16.67% |

**Level 2 & 3: Categories and Subcategories**

| Category | Name | Category Weight (Overall) | # Subcats | Each Subcat Weight (Overall) |
|---|---|---|---|---|
| **GV — Govern** | *(16.67% ÷ 6 categories = 2.78% each)* | | | |
| GV.OC | Organizational Context | 2.78% | 5 | 0.56% |
| GV.RM | Risk Management Strategy | 2.78% | 7 | 0.40% |
| GV.RR | Roles, Responsibilities & Authorities | 2.78% | 4 | 0.69% |
| GV.PO | Policy | 2.78% | 2 | 1.39% |
| GV.OV | Oversight | 2.78% | 3 | 0.93% |
| GV.SC | Cybersecurity Supply Chain Risk Mgmt | 2.78% | 10 | 0.28% |
| **ID — Identify** | *(16.67% ÷ 3 categories = 5.56% each)* | | | |
| ID.AM | Asset Management | 5.56% | 7 | 0.79% |
| ID.RA | Risk Assessment | 5.56% | 10 | 0.56% |
| ID.IM | Improvement | 5.56% | 4 | 1.39% |
| **PR — Protect** | *(16.67% ÷ 5 categories = 3.33% each)* | | | |
| PR.AA | Identity Mgmt, Auth & Access Control | 3.33% | 6 | 0.56% |
| PR.AT | Awareness and Training | 3.33% | 2 | 1.67% |
| PR.DS | Data Security | 3.33% | 4 | 0.83% |
| PR.PS | Platform Security | 3.33% | 6 | 0.56% |
| PR.IR | Technology Infrastructure Resilience | 3.33% | 4 | 0.83% |
| **DE — Detect** | *(16.67% ÷ 2 categories = 8.33% each)* | | | |
| DE.CM | Continuous Monitoring | 8.33% | 5 | 1.67% |
| DE.AE | Adverse Event Analysis | 8.33% | 6 | 1.39% |
| **RS — Respond** | *(16.67% ÷ 4 categories = 4.17% each)* | | | |
| RS.MA | Incident Management | 4.17% | 5 | 0.83% |
| RS.AN | Incident Analysis | 4.17% | 4 | 1.04% |
| RS.CO | Incident Response Reporting & Comms | 4.17% | 2 | 2.08% |
| RS.MI | Incident Mitigation | 4.17% | 2 | 2.08% |
| **RC — Recover** | *(16.67% ÷ 2 categories = 8.33% each)* | | | |
| RC.RP | Incident Recovery Plan Execution | 8.33% | 6 | 1.39% |
| RC.CO | Incident Recovery Communication | 8.33% | 2 | **4.17%** |

> RC.CO's subcategories (4.17% each) are the highest-weighted individual subcategories in the framework — each one moves the overall score more than any subcategory in GOVERN, IDENTIFY, or PROTECT. Organizations with weak incident recovery communication should treat each RC.CO subcategory as high-leverage.

---

## Enums

```ts
enum IndustryType {
  FINANCE         = "FINANCE",
  HEALTHCARE      = "HEALTHCARE",
  GOVERNMENT      = "GOVERNMENT",
  EDUCATION       = "EDUCATION",
  TECHNOLOGY      = "TECHNOLOGY",
  MANUFACTURING   = "MANUFACTURING",
  ENERGY          = "ENERGY",
  RETAIL          = "RETAIL",
  NONPROFIT       = "NONPROFIT",
  OTHER           = "OTHER",
}

enum OrganizationSize {
  SMALL   = "SMALL",    // < 50 employees
  MEDIUM  = "MEDIUM",   // 50–499
  LARGE   = "LARGE",    // 500–4999
  ENTERPRISE = "ENTERPRISE", // 5000+
}

// The six CSF 2.0 Functions
enum CSFFunction {
  GOVERN   = "GV",
  IDENTIFY = "ID",
  PROTECT  = "PR",
  DETECT   = "DE",
  RESPOND  = "RS",
  RECOVER  = "RC",
}

// CSF Tier — characterizes rigor of governance and management practices
enum CSFTier {
  TIER_1_PARTIAL      = 1,
  TIER_2_RISK_INFORMED = 2,
  TIER_3_REPEATABLE   = 3,
  TIER_4_ADAPTIVE     = 4,
}

// Implementation status for a subcategory response
enum ImplementationStatus {
  NOT_IMPLEMENTED     = "NOT_IMPLEMENTED",     // 0% — nothing in place
  PARTIALLY_IMPLEMENTED = "PARTIALLY_IMPLEMENTED", // ~25–50%
  LARGELY_IMPLEMENTED = "LARGELY_IMPLEMENTED", // ~51–75%
  FULLY_IMPLEMENTED   = "FULLY_IMPLEMENTED",   // ~76–100%
  NOT_APPLICABLE      = "NOT_APPLICABLE",       // excluded from scoring
}

// Maps to a numeric maturity score (0–4) used in rollups
enum MaturityLevel {
  NONE     = 0,
  INITIAL  = 1,
  DEVELOPING = 2,
  DEFINED  = 3,
  MANAGED  = 4,
}

enum AssessmentStatus {
  DRAFT      = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW  = "IN_REVIEW",
  COMPLETED  = "COMPLETED",
  ARCHIVED   = "ARCHIVED",
}

enum AssessmentType {
  CURRENT = "CURRENT",  // where the org is now
  TARGET  = "TARGET",   // where the org wants to be
}

enum RiskPriority {
  CRITICAL = "CRITICAL",
  HIGH     = "HIGH",
  MEDIUM   = "MEDIUM",
  LOW      = "LOW",
}

enum ActionItemStatus {
  OPEN        = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED     = "BLOCKED",
  COMPLETED   = "COMPLETED",
  DEFERRED    = "DEFERRED",
  CANCELLED   = "CANCELLED",
}

enum EvidenceType {
  DOCUMENT  = "DOCUMENT",   // policy, procedure, report upload
  LINK      = "LINK",       // URL to external resource
  NOTE      = "NOTE",       // freeform text observation
  SCREENSHOT = "SCREENSHOT",
}

enum UserRole {
  ADMIN       = "ADMIN",        // full access, can manage users
  ASSESSOR    = "ASSESSOR",     // can score subcategories, add evidence
  REVIEWER    = "REVIEWER",     // read + comment, approve assessments
  VIEWER      = "VIEWER",       // read-only
}
```

---

## Reference Data (Shared / Seed)

These tables define the CSF 2.0 taxonomy. They are seeded at deploy time and are read-only during normal app operation.

### `CSFFunction`

```ts
interface CSFFunctionRecord {
  id: string;                  // "GV" | "ID" | "PR" | "DE" | "RS" | "RC"
  name: string;                // "Govern"
  description: string;         // "The organization's cybersecurity risk management..."
  order: number;               // Display order (1–6)
  weight: number;              // Always 1/6 ≈ 0.1667 — equal across all functions
}
```

### `CSFCategory`

```ts
interface CSFCategoryRecord {
  id: string;                  // "GV.OC" | "GV.RM" | "ID.AM" | etc.
  functionId: string;          // FK → CSFFunctionRecord.id
  name: string;                // "Organizational Context"
  description: string;         // "The circumstances — mission, stakeholder..."
  order: number;               // Display order within function
  weightWithinFunction: number; // Equal share of function: 1 / (# categories in function)
                                // e.g. GV has 6 categories → each = 0.1667
                                //      RC has 2 categories → each = 0.5000
  weightOverall: number;        // = CSFFunctionRecord.weight × weightWithinFunction
                                // e.g. GV.OC = 0.1667 × 0.1667 = 0.0278
                                //      RC.RP = 0.1667 × 0.5000 = 0.0833
}
```

### `CSFSubcategory`

```ts
interface CSFSubcategoryRecord {
  id: string;                  // "GV.OC-01" | "GV.RM-02" | "ID.AM-01" | etc.
  categoryId: string;          // FK → CSFCategoryRecord.id
  functionId: string;          // Denormalized FK → CSFFunctionRecord.id
  statement: string;           // "The organizational mission is understood and informs..."
  order: number;               // Display order within category
  // Gap in numbering (e.g. PR.DS jumps from -02 to -10) is preserved
  // to stay consistent with the published CSF 2.0 spec.
  weightWithinCategory: number; // Equal share of category: 1 / (# subcategories in category)
                                // e.g. RC.CO has 2 subcats → each = 0.5000
                                //      RC.RP has 6 subcats → each = 0.1667
  weightOverall: number;        // = CSFCategoryRecord.weightOverall × weightWithinCategory
                                // e.g. RC.CO subcat = 0.0833 × 0.5000 = 0.0417
                                //      RC.RP subcat  = 0.0833 × 0.1667 = 0.0139
}
```

**Full CSF 2.0 Subcategory inventory by function:**

| Function | Categories | Subcategory Count |
|---|---|---|
| GV — Govern | OC, RM, RR, PO, OV, SC | 24 |
| ID — Identify | AM, RA, IM | 18 |
| PR — Protect | AA, AT, DS, PS, IR | 20 |
| DE — Detect | CM, AE | 11 |
| RS — Respond | MA, AN, CO, MI | 13 |
| RC — Recover | RP, CO | 8 |
| **Total** | **22 categories** | **~94 subcategories** |

---

## Tenant Data

### `Organization`

The top-level tenant. All other tenant records belong to an organization.

```ts
interface Organization {
  id: string;                   // UUID
  name: string;                 // "Acme Corp"
  industry: IndustryType;
  size: OrganizationSize;
  country: string;              // ISO 3166-1 alpha-2
  sector: string | null;        // Free-text sub-sector (e.g. "Community Banking")
  website: string | null;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### `User`

Application user. Always scoped to one organization.

```ts
interface User {
  id: string;                   // UUID
  organizationId: string;       // FK → Organization.id
  email: string;
  name: string;
  role: UserRole;
  title: string | null;         // "CISO", "Risk Manager", etc.
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}
```

---

### `Assessment`

An Assessment is a versioned snapshot of an organization's posture at a point in time. An organization will typically have a **Current** and a **Target** assessment that together constitute an Organizational Profile.

```ts
interface Assessment {
  id: string;                   // UUID
  organizationId: string;       // FK → Organization.id
  type: AssessmentType;         // CURRENT | TARGET
  status: AssessmentStatus;
  name: string;                 // "Q1 2026 Current State" — user-defined label
  scope: string;                // Free-text scope description (e.g., "Financial systems only")
  csfrVersion: string;          // "2.0" — framework version this assessment maps to
  currentTier: CSFTier | null;  // Self-assessed CSF Tier for this assessment
  targetTier: CSFTier | null;   // Desired tier (relevant for Target assessments)

  // Computed rollup scores — recalculated on save
  overallMaturityScore: number | null;      // 0.00–4.00, weighted average
  overallCompletionPercent: number | null;  // % of subcategories scored

  startedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date | null;
  createdById: string;          // FK → User.id
  lastUpdatedById: string;      // FK → User.id
  createdAt: Date;
  updatedAt: Date;
}
```

> An **Organizational Profile** in CSF terms is represented by pairing one `CURRENT` Assessment with one `TARGET` Assessment. The gap between them drives the `GapAnalysis` and `ActionItem` records.

---

### `AssessmentCollaborator`

Links additional users to an assessment with a scoped role (e.g., a practitioner may be an ASSESSOR on one assessment but VIEWER on another).

```ts
interface AssessmentCollaborator {
  id: string;
  assessmentId: string;         // FK → Assessment.id
  userId: string;               // FK → User.id
  role: UserRole;
  addedAt: Date;
}
```

---

### `SubcategoryResponse`

The core scoring record. One row per subcategory per assessment. This is where maturity scores are entered.

```ts
interface SubcategoryResponse {
  id: string;                     // UUID
  assessmentId: string;           // FK → Assessment.id
  subcategoryId: string;          // FK → CSFSubcategoryRecord.id — e.g. "GV.OC-01"
  categoryId: string;             // Denormalized FK → CSFCategoryRecord.id
  functionId: string;             // Denormalized FK → CSFFunctionRecord.id

  // Scoring
  implementationStatus: ImplementationStatus;
  maturityScore: number;          // 0–4 (derived from implementationStatus or manually set)
  // Mapping:
  //   NOT_IMPLEMENTED      → 0
  //   PARTIALLY_IMPLEMENTED → 1–2
  //   LARGELY_IMPLEMENTED  → 3
  //   FULLY_IMPLEMENTED    → 4
  //   NOT_APPLICABLE       → excluded from rollup

  // Optionally override the default score (e.g., partial credit within a band)
  scoreOverride: number | null;   // 0.0–4.0

  // Context
  notes: string | null;           // Assessor's narrative observations
  isExcluded: boolean;            // Manually exclude from score rollup (treated like N/A)
  priority: RiskPriority | null;  // Assessor-assigned priority for this item

  // Target-specific
  targetMaturityScore: number | null;  // Populated when assessment type = TARGET

  // Ownership
  respondedById: string | null;   // FK → User.id — who scored this
  reviewedById: string | null;    // FK → User.id — who reviewed/approved
  reviewedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
```

---

### `Evidence`

Supporting documentation attached to a subcategory response. Multiple evidence items can back a single response.

```ts
interface Evidence {
  id: string;                    // UUID
  subcategoryResponseId: string; // FK → SubcategoryResponse.id
  assessmentId: string;          // Denormalized FK → Assessment.id
  organizationId: string;        // Denormalized FK → Organization.id

  type: EvidenceType;
  title: string;                 // "Access Control Policy v3.2"
  description: string | null;
  url: string | null;            // For LINK and DOCUMENT types (storage URL or external link)
  fileSize: number | null;       // Bytes, for uploaded documents
  mimeType: string | null;

  uploadedById: string;          // FK → User.id
  uploadedAt: Date;
}
```

---

### Computed Score Rollups

Rollup scores are **computed and cached** — not stored as source-of-truth rows. They are recalculated whenever `SubcategoryResponse` records change. Storing them enables fast dashboard queries.

#### `FunctionScore`

```ts
interface FunctionScore {
  id: string;
  assessmentId: string;          // FK → Assessment.id
  functionId: string;            // FK → CSFFunctionRecord.id — "GV" | "ID" | etc.

  maturityScore: number;         // 0.00–4.00 — weighted avg of CategoryScores
  completionPercent: number;     // % of subcategories scored (not N/A)
  scoredCount: number;           // Count of scored subcategories
  totalCount: number;            // Total subcategories in this function (excluding N/A)
  notApplicableCount: number;

  calculatedAt: Date;
}
```

#### `CategoryScore`

```ts
interface CategoryScore {
  id: string;
  assessmentId: string;          // FK → Assessment.id
  categoryId: string;            // FK → CSFCategoryRecord.id — "GV.OC" | "ID.AM" | etc.
  functionId: string;            // Denormalized

  maturityScore: number;         // 0.00–4.00 — avg of scored subcategory responses
  completionPercent: number;
  scoredCount: number;
  totalCount: number;
  notApplicableCount: number;

  calculatedAt: Date;
}
```

---

### `GapAnalysis`

Captures the delta between a Current and Target assessment at every level. One `GapAnalysis` record links a Current/Target pair and their derived gaps.

```ts
interface GapAnalysis {
  id: string;                        // UUID
  organizationId: string;            // FK → Organization.id
  currentAssessmentId: string;       // FK → Assessment.id (type = CURRENT)
  targetAssessmentId: string;        // FK → Assessment.id (type = TARGET)
  name: string;                      // "2026 Gap Analysis"

  // Overall gap
  overallCurrentScore: number;       // 0–4
  overallTargetScore: number;        // 0–4
  overallGap: number;                // target − current

  // Tier gap
  currentTier: CSFTier | null;
  targetTier: CSFTier | null;
  tierGap: number | null;            // targetTier − currentTier

  createdById: string;               // FK → User.id
  createdAt: Date;
  updatedAt: Date;
}
```

#### `GapItem`

A gap at the subcategory level — the atomic unit of remediation.

```ts
interface GapItem {
  id: string;                        // UUID
  gapAnalysisId: string;             // FK → GapAnalysis.id
  subcategoryId: string;             // FK → CSFSubcategoryRecord.id
  categoryId: string;                // Denormalized
  functionId: string;                // Denormalized

  currentScore: number;              // 0–4 from current assessment
  targetScore: number;               // 0–4 from target assessment
  gap: number;                       // targetScore − currentScore (positive = gap exists)

  priority: RiskPriority;            // Derived or manually overridden
  // Derivation rule: gap >= 3 → CRITICAL, gap == 2 → HIGH, gap == 1 → MEDIUM, gap == 0 → LOW

  notes: string | null;
  isAddressed: boolean;              // True when a linked ActionItem is COMPLETED
}
```

---

### `ActionPlan`

A container for a set of remediation action items. Typically one per `GapAnalysis`.

```ts
interface ActionPlan {
  id: string;                   // UUID
  organizationId: string;       // FK → Organization.id
  gapAnalysisId: string | null; // FK → GapAnalysis.id — null if standalone
  name: string;                 // "2026 Remediation Roadmap"
  description: string | null;
  targetCompletionDate: Date | null;
  owner: string | null;         // Name/team responsible
  createdById: string;          // FK → User.id
  createdAt: Date;
  updatedAt: Date;
}
```

#### `ActionItem`

An individual remediation task. Linked to one or more gap items.

```ts
interface ActionItem {
  id: string;                     // UUID
  actionPlanId: string;           // FK → ActionPlan.id
  organizationId: string;         // Denormalized FK

  title: string;                  // "Implement MFA for all privileged accounts"
  description: string | null;
  priority: RiskPriority;

  status: ActionItemStatus;
  assignedToId: string | null;    // FK → User.id
  dueDate: Date | null;
  completedAt: Date | null;

  // The subcategories this action addresses
  subcategoryIds: string[];       // Array of CSFSubcategory.id values

  estimatedEffort: string | null; // Free-text: "2 weeks", "40 hrs"
  estimatedCost: number | null;   // USD
  notes: string | null;

  createdById: string;            // FK → User.id
  createdAt: Date;
  updatedAt: Date;
}
```

---

### `AssessmentHistory`

Immutable audit log. Captures a snapshot of the overall maturity score each time an assessment is saved as COMPLETED, enabling trend analysis over time.

```ts
interface AssessmentHistory {
  id: string;                        // UUID
  assessmentId: string;              // FK → Assessment.id
  organizationId: string;
  snapshotAt: Date;

  overallMaturityScore: number;      // 0.00–4.00
  tier: CSFTier | null;

  // Scores per function at time of snapshot
  functionScores: {
    functionId: string;
    score: number;
  }[];

  completionPercent: number;
  triggeredById: string;             // FK → User.id
}
```

---

### `Comment`

Threaded discussion on any subcategory response or action item.

```ts
interface Comment {
  id: string;                    // UUID
  organizationId: string;
  authorId: string;              // FK → User.id

  // Polymorphic target — one of:
  subcategoryResponseId: string | null;
  actionItemId: string | null;
  gapItemId: string | null;

  parentCommentId: string | null; // For threaded replies
  body: string;
  isResolved: boolean;

  createdAt: Date;
  updatedAt: Date;
}
```

---

## Scoring Algorithm

### Subcategory Score

```
if implementationStatus == NOT_APPLICABLE OR isExcluded:
  exclude from rollup

effectiveScore = scoreOverride ?? defaultScoreFromStatus

defaultScoreFromStatus:
  NOT_IMPLEMENTED        → 0
  PARTIALLY_IMPLEMENTED  → 1   (assessor may use scoreOverride for 1 or 2)
  LARGELY_IMPLEMENTED    → 3   (assessor may use scoreOverride for 2 or 3)
  FULLY_IMPLEMENTED      → 4
```

### Category Score

```
categoryScore = mean(effectiveScore for all non-excluded subcategories in category)
// Equal weight per subcategory within the category — no manual weighting needed here.
// The subcategory's overall impact is already encoded in CSFSubcategoryRecord.weightOverall.
```

### Function Score

```
functionScore = mean(categoryScore for all categories in function)
// Equal weight per category within the function.
```

### Overall Maturity Score

```
overallScore = mean(functionScore for all 6 functions)
// Equal weight per function — each contributes exactly 1/6 to the total.
```

### Why Simple Means Work

Because weights are equal at every level, a plain unweighted mean at each level produces the correct weighted result. The differential impact of subcategories (e.g., RC.CO subcategories mattering more than RC.RP subcategories) emerges automatically: improving one of RC.CO's 2 subcategories moves RC.CO's category score by 50 points, while improving one of RC.RP's 6 subcategories moves it by only 16.7 points — and both categories feed into RECOVER's function score at equal weight.

No explicit weight multiplication is required in the scoring logic. The `weightOverall` fields on `CSFCategoryRecord` and `CSFSubcategoryRecord` are stored for use in UI features like the treemap heatmap (to size tiles proportionally) and gap prioritization (to surface high-leverage subcategories), not for the score calculation itself.

### Interpreting the Score

| Score Range | Approximate CSF Tier | Maturity Label |
|---|---|---|
| 0.00 – 0.99 | Tier 1 (Partial) | Initial / Ad Hoc |
| 1.00 – 1.99 | Tier 1–2 | Developing |
| 2.00 – 2.99 | Tier 2–3 | Defined |
| 3.00 – 3.74 | Tier 3 (Repeatable) | Managed |
| 3.75 – 4.00 | Tier 4 (Adaptive) | Optimizing |

---

## Entity Relationship Summary

```
Organization
  ├── User (many)
  │     └── AssessmentCollaborator (many)
  │
  ├── Assessment (many)
  │     ├── SubcategoryResponse (one per CSFSubcategory)
  │     │     ├── Evidence (many)
  │     │     └── Comment (many)
  │     ├── FunctionScore (one per CSFFunction — computed)
  │     ├── CategoryScore (one per CSFCategory — computed)
  │     └── AssessmentHistory (one per completion event)
  │
  ├── GapAnalysis (pairs a CURRENT + TARGET Assessment)
  │     └── GapItem (one per CSFSubcategory where gap > 0)
  │
  └── ActionPlan
        └── ActionItem (references one or more CSFSubcategories)


CSF Reference (shared, read-only)
  CSFFunctionRecord (6)
    └── CSFCategoryRecord (22)
          └── CSFSubcategoryRecord (~94)
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Separate CURRENT and TARGET as distinct `Assessment` records | Mirrors CSF language exactly; each can progress through its own lifecycle independently |
| Denormalize `functionId` / `categoryId` onto `SubcategoryResponse` | Avoids repeated joins on the hot scoring path |
| Cache `FunctionScore` / `CategoryScore` separately from `SubcategoryResponse` | Dashboard queries should never require full rollup recalculation at read time |
| `scoreOverride` field on `SubcategoryResponse` | Allows assessors to assign partial credit within a band (e.g., 1.5 instead of a hard 1 or 3) |
| `isExcluded` + `NOT_APPLICABLE` | Distinguishes "doesn't apply to us" (N/A, deliberate) from "we skipped this" (excluded, temporary) |
| `GapItem.priority` derived from gap magnitude | Auto-surfaces critical remediation areas without requiring manual triage |
| `AssessmentHistory` as an immutable append-only table | Enables trend-over-time dashboards and regression detection without rebuilding from audit logs |
