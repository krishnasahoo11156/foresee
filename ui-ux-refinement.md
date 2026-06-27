# UI/UX Refinement Prompt — Personal Developer Portfolio

> Use this as a brief for an AI agent, designer, or yourself. It's intentionally written as a set of *options and lenses* to look through, not a checklist of mandatory changes. The goal is a site that feels like it belongs on the same shelf as a clean big-tech product page (think Stripe, Linear, Vercel) — spacious, confident, unhurried — without losing the personal, artistic identity already baked into the brand (pencil-sketch art, AlgoMinds, the dev+artist duality).

---

## Context to give the agent

"This is a personal portfolio/developer website. It already has content (GitHub analytics modal, certificates carousel, project sections, etc.) — the goal right now is a *UI/UX refinement pass*, not a rebuild. Review the current site and suggest changes; don't assume every section needs to change. Flag what's already working before touching it."

---

## The lens to look through (not a rulebook — just things worth weighing)

**1. Hierarchy first, decoration second**
Before suggesting any visual polish, it might help to map out what the page wants the visitor's eye to land on first, second, third. Size, weight, and position can do most of this work — color and imagery should reinforce that order, not compete with it.

**2. Whitespace as a feature, not empty leftover space**
A "spacious, big-tech" feel usually comes from generous margins and breathing room around sections more than from any single design trick. It could be worth auditing whether sections feel tight or cramped, and whether padding/margins follow a consistent scale (e.g., 8px-based steps) rather than ad-hoc values.

**3. One primary color, a couple of supporting ones, and a quiet neutral base**
A common pattern in restrained, professional-feeling sites: one accent color reserved almost entirely for the primary action (e.g. "View Project," "Contact"), everything else living in neutrals/grayscale. If the site currently has several competing bright colors, it might be worth testing what happens when most of them get pulled back to neutral and only one or two are kept "loud."

**4. Typography doing the heavy lifting**
Worth checking: is there a clear, limited type scale (e.g. H1 → H2 → body → caption) used consistently across sections? A line-height around 1.4–1.6x font size for body text tends to read more comfortably. Given the personal/artistic angle, there's room to have one slightly more expressive font for headings (something with character) paired with a clean, neutral sans-serif (Inter, General Sans, etc.) for body copy — that contrast itself can feel premium if it's consistent everywhere.

**5. Consistency over novelty**
Repeating the same card style, button style, spacing rhythm, and corner radius across the GitHub modal, certificates carousel, and project sections (even if they were built at different times) usually reads as "thought through" rather than "assembled." Could be a useful pass: list every UI pattern currently in use (buttons, cards, badges, modals) and see where two slightly different versions of the same thing exist.

**6. Reduce decisions, not content**
If any section throws a lot of choices at the visitor at once (e.g. many CTAs, many nav items), it might help to ask which *one* action matters most on that screen and let the rest recede visually — smaller, quieter, secondary styling — rather than removing content outright.

**7. Motion as feedback, not decoration**
Subtle micro-interactions (hover states, smooth modal open/close, a slight transition on scroll) tend to read as "polished" today, but it's worth weighing each one against its performance cost — especially anything 3D or heavily animated, since that can hurt load time more than it adds. A good filter: does this animation tell the user something happened, or is it just movement?

**8. Accessibility as a quality signal, not a compliance chore**
Things like color contrast (roughly 4.5:1 for body text), real alt text on images/certificates, and keyboard-navigable interactive elements (modals, carousels) tend to make the site feel more solid even for visitors who'll never notice them directly. Worth a quick audit pass with something like Lighthouse if there's time.

**9. Mobile as a first-class layout, not a squeeze**
Given there's a fair amount of interactive content (modals, carousels, an analytics popup), it could be worth specifically checking how each of those degrade on a phone — sometimes a different pattern (bottom sheet instead of modal, swipe instead of arrows) fits small screens better than a shrunk version of the desktop layout.

**10. Let the personal identity show through restraint, not extra elements**
Since there's an artistic/sketch identity alongside the technical one, one option is using that as a subtle texture — a hand-drawn accent, a signature-style detail, a small illustrated touch — in just one or two spots, rather than spreading "artsy" treatment everywhere. A little goes further in an otherwise clean, technical layout.

---

## How to brief the agent (sample closing instruction)

"Go through the site with the above lenses in mind. For each section, you can either confirm it already works well, or suggest a specific, minimal change — including what problem it solves and roughly how big a change it is (CSS tweak vs. structural). I'd rather see a short list of high-impact suggestions than a full redesign. Where there's a genuine tradeoff (e.g. a 3D effect that looks great but is slow), lay out the options and the cost of each, and let me decide."

---

*References drawn from: Sky Rye Design's UI design guide (hierarchy, consistency, accessibility, feedback, affordance as the five core principles; restraint in color/graphics), Dorik's UI/UX guide (Hick's Law on reducing choices, white space, visual hierarchy patterns, mobile responsiveness), and Passionate Agency's UI/UX guide (design fundamentals, information architecture, accessibility, iterative testing).*