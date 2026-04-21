```markdown
# Design System Specification: The Architectural Perspective

## 1. Overview & Creative North Star: "The Informed Curator"
This design system moves beyond the standard corporate dashboard to create an environment of **Authoritative Precision**. We are not building a simple "tool"; we are crafting a digital workspace that reflects the prestige of a global consultancy. 

The **Creative North Star** for this system is **"The Informed Curator."** This concept blends the structure of high-end editorial magazines (like *The Economist*) with the precision of architectural blueprints. We achieve this through "The Void"—using generous white space and sharp, 0px-radius corners to imply a sense of unyielding confidence. By rejecting standard UI tropes like rounded corners and heavy borders, we create an experience that feels custom, intentional, and high-stakes.

---

## 2. Color Theory: Tonal Authority
Our palette is rooted in the heritage of the PwC brand but evolved for a high-density, data-driven environment. We use color not just for decoration, but as a functional layer of information.

### Core Palette
- **Primary Foundation:** `primary` (#bb1004) and `primary_container` (#e0301e). Use these for high-impact actions and brand presence.
- **Secondary Energy:** `secondary` (#a83a00) and `secondary_container` (#fe6a29). Reserved for secondary actions and mid-tier heat map states.
- **Surface Intelligence:** `surface` (#fbf9f8) and its variants. These are the "paper" of our application.

### The "No-Line" Rule
To maintain an elite editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background shifts. For example:
- A high-level navigation bar uses `surface_container_low`.
- The main content area sits on `surface`.
- A nested sidebar or info-panel uses `surface_container_high`.
This creates a seamless, "milled" look rather than a boxy, cluttered one.

### Signature Textures & Glassmorphism
To add "soul" to professional data, use the **Glass & Gradient** rule for elevated elements (like floating action bars or tooltips):
- **Backdrop-Blur:** 12px to 20px.
- **Fill:** `surface_container_lowest` at 80% opacity.
- **CTA Depth:** Main buttons should use a subtle linear gradient from `primary` (#bb1004) to `primary_container` (#e0301e) at a 135-degree angle.

---

## 3. Typography: Editorial Scale
We utilize **Inter** (as the modern digital surrogate for Helvetica Neue) to drive a clean, sans-serif hierarchy. The intent is "High-Contrast Legibility."

- **Display & Headline:** Use `display-lg` and `headline-lg` to ground the page. These should feel like titles in a premium report.
- **Body:** `body-md` (0.875rem) is our workhorse. It ensures high data density without sacrificing readability.
- **Labeling:** Use `label-md` for metadata. This should always be in `on_surface_variant` (#5c403b) to provide a secondary visual layer that doesn't compete with primary data.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often "muddy." This design system utilizes **Tonal Layering** and **Ambient Diffusion**.

- **The Layering Principle:** Depth is achieved by stacking surface tiers. A card (using `surface_container_lowest`) placed on a workspace (using `surface_container_low`) creates a natural, soft lift.
- **Ambient Shadows:** For floating modals, use a 32px blur with only 6% opacity of the `on_surface` color. The shadow should feel like a soft glow of light, not a dark edge.
- **The "Ghost Border" Fallback:** If a divider is functionally required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: The Primitive Set

### Buttons (Architectural State)
- **Primary:** 0px border-radius. Gradient fill (`primary` to `primary_container`). White text. No border.
- **Secondary:** 0px border-radius. `surface_container_high` background. `on_surface` text.
- **Tertiary:** Pure text with 2px bottom padding, using a `primary` underlines only on hover.

### The Heat Map (Maturity Gradient)
The heat map represents the "Data-Driven" heart of the tool. Use a continuous linear interpolation:
- **Low Maturity:** `primary_container` (#E0301E) - High urgency.
- **Medium Maturity:** `tertiary_fixed` (#FFB600) - Cautionary.
- **High Maturity:** Use a custom Deep Professional Green (#1E5631) - Success/Growth.
*Note: Ensure cell spacing is 2px (The "Void") to separate data points without using lines.*

### Cards & Data Containers
- **Rule:** Forbid divider lines.
- **Execution:** Separate content blocks using the **Spacing Scale** (32px vertical gaps) or by shifting from `surface_container_lowest` to `surface_container`. 

### Input Fields
- **Default State:** `surface_container_highest` background, 0px radius, 2px bottom-border using `outline_variant`.
- **Focus State:** Bottom-border transforms to `primary` (#bb1004) at 2px thickness.

---

## 6. Do’s and Don'ts

### Do:
- **Do** use 0px border-radius for every single element. Roundness dilutes authority in this context.
- **Do** lean into intentional asymmetry. Align a headline to the far left and data points to the far right, leaving a "weighted" center.
- **Do** use `on_surface_variant` for all non-essential text to create a clear information hierarchy.

### Don’t:
- **Don’t** use shadows to define basic cards. Use background color shifts.
- **Don’t** use "Alert Red" for errors; use the system `error` token (#ba1a1a) which is tuned to the PwC Red palette.
- **Don’t** use standard icons. Use thin-stroke (1px or 1.5px) "light" icons to match the Inter typography weight.

---

## 7. High-End Data Visualization
In this design system, data is the hero. Use high-contrast backgrounds for charts. For instance, a complex bar chart should sit on `surface_dim` (#dbd9d9) to make the `primary` and `secondary` data points pop. When visualizing "Low Maturity" to "High Maturity," always ensure the text on the "Low" (Red) end is `on_primary` (White) and the "Medium" (Yellow) end is `on_tertiary_fixed` (Black) to maintain AAA accessibility standards.```