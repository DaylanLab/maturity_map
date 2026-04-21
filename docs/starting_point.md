

# Overview

## Objective

We have the nist 2.0 CSF Framework. It can be referenced here (./NIST_CSF_2.0.md). We want to build a app which shows a treemap like infographic in which a given company can estimate future nist scores by setting NIST CSF subcategory scores to their desired choice. This should allow the user to play with the score at the subcategory level, the score at the category level will then update, the function score will then update, and this should then  update their overall NIST CSF 2.0 Maturity score, The goal will be to have a tool that will allow the user to see which category will have the largest impact to their overall NIST score as well as at the overall function level.

The tree map should break down into the 6 functions, color coded for each nist function. scores should be colored with green being for the highest maturity and red for the lowest. The treemap should work like a heat map, allowing folks to see which categories would tip their overall score higher or lower.  The overall NIST CSF maturity score will be informed by the rest of the scores under it.

---

## Technology

This should be a single page react app which requires no database or server.

---

## UX

This should be a single page with no other routes. The user can change the score on a subcategory. There are no other things on the page that the user can interact with.

---

## Weighting Model

Weights are equal at every level of the CSF hierarchy. No level manually ranks one item above another — the structure of the framework produces the differential impact naturally.

**Rules:**
1. All 6 Functions are equally weighted — each contributes 1/6 (16.67%) to the overall maturity score.
2. All Categories within a Function are equally weighted — each gets an equal share of that function's 16.67%.
3. All Subcategories within a Category are equally weighted — each gets an equal share of that category's weight.

**Consequence:** Categories in functions with fewer categories carry more weight. Subcategories in categories with fewer subcategories carry more weight. No manual override needed.

| Category | Category Weight (Overall) | # Subcats | Each Subcat Weight (Overall) |
|---|---|---|---|
| **GV — Govern** (16.67% ÷ 6 categories = 2.78% each) | | | |
| GV.OC | 2.78% | 5 | 0.56% |
| GV.RM | 2.78% | 7 | 0.40% |
| GV.RR | 2.78% | 4 | 0.69% |
| GV.PO | 2.78% | 2 | 1.39% |
| GV.OV | 2.78% | 3 | 0.93% |
| GV.SC | 2.78% | 10 | 0.28% |
| **ID — Identify** (16.67% ÷ 3 categories = 5.56% each) | | | |
| ID.AM | 5.56% | 7 | 0.79% |
| ID.RA | 5.56% | 10 | 0.56% |
| ID.IM | 5.56% | 4 | 1.39% |
| **PR — Protect** (16.67% ÷ 5 categories = 3.33% each) | | | |
| PR.AA | 3.33% | 6 | 0.56% |
| PR.AT | 3.33% | 2 | 1.67% |
| PR.DS | 3.33% | 4 | 0.83% |
| PR.PS | 3.33% | 6 | 0.56% |
| PR.IR | 3.33% | 4 | 0.83% |
| **DE — Detect** (16.67% ÷ 2 categories = 8.33% each) | | | |
| DE.CM | 8.33% | 5 | 1.67% |
| DE.AE | 8.33% | 6 | 1.39% |
| **RS — Respond** (16.67% ÷ 4 categories = 4.17% each) | | | |
| RS.MA | 4.17% | 5 | 0.83% |
| RS.AN | 4.17% | 4 | 1.04% |
| RS.CO | 4.17% | 2 | 2.08% |
| RS.MI | 4.17% | 2 | 2.08% |
| **RC — Recover** (16.67% ÷ 2 categories = 8.33% each) | | | |
| RC.RP | 8.33% | 6 | 1.39% |
| RC.CO | 8.33% | 2 | 4.17% |

**Scoring:** Plain unweighted means at each level (subcategory → category → function → overall) produce the correct weighted result automatically. The `weightOverall` value stored per category and subcategory is used for treemap tile sizing and gap prioritization, not the score calculation itself.


## Style

- Use PWC colors