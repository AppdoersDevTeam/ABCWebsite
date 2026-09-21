# Responsive device matrix (Phase 4)

Ticket: `d4109d17-3b07-4477-968e-f80d825a2aeb`
Checked: 21/09/2026, 4:00:17 pm (Pacific/Auckland)
Tool: headless Chrome at the listed CSS viewports (not a physical phone). Protected `/dashboard` and `/admin` routes redirect to login without a session, so they were not scored as member/admin layouts.

## Viewports

| Device | Size | Orientation | Coverage |
| --- | --- | --- | --- |
| Smallest phone | 320 × 568 | portrait + landscape | every public route |
| iPhone SE | 375 × 667 | portrait | every public route |
| iPhone 14 | 390 × 844 | portrait + landscape | every public route |
| iPad mini | 744 × 1133 | portrait + landscape | every public route |
| iPad 10th gen | 820 × 1180 | portrait | every public route |
| Other spec phones / iPad Pro | see names | portrait | Home, Login, Contact |

## Summary

- Pages checked: 194
- Pass (no meaningful horizontal overflow): 194
- Fail: 0
- Reduced motion: prefers-reduced-motion is reported by the browser
- 200% zoom (Home + Login at 375px): Home overflow 0px; Login overflow 0px
- Navigation: hamburger shows on phones and tablets through 1024px; desktop bar starts at xl (1280px)

## Fixes applied during this pass

- The public desktop bar at 1024px was cramped (labels wrapping, Log in collapsing to an icon). The hamburger now stays until **1280px (`xl`)**.
- `AdminTeam.tsx` could not compile (`User` imported from both Lucide and `types`), which blanked the whole SPA in Vite. The Lucide icon is now `UserIcon`.

## Visual spot-check (Chrome)

- **320 × 568 About:** logo + hamburger, hero title wraps, no sideways scroll.
- **1024 × 768 About (before the xl change):** full nav was too tight — that is why the breakpoint moved.

## Failures

None. No public page produced more than 8px of horizontal overflow at the checked sizes.

## Chrome (hamburger vs desktop nav)

| Viewport | Size | Hamburger | Desktop nav |
| --- | --- | --- | --- |
| small-phone | 320x568 | yes | no |
| iphone-se | 375x667 | yes | no |
| iphone-14 | 390x844 | yes | no |
| ipad-mini | 744x1133 | yes | no |
| ipad-10 | 820x1180 | yes | no |
| small-phone-landscape | 568x320 | yes | no |
| iphone-14-landscape | 844x390 | yes | no |
| ipad-mini-landscape | 1133x744 | yes | no |
| iphone-16-pro | 393x852 | yes | no |
| pixel-8 | 412x915 | yes | no |
| galaxy-s24 | 360x800 | yes | no |
| iphone-16-pro-max | 430x932 | yes | no |
| ipad-pro-11 | 834x1194 | yes | no |
| ipad-pro-13 | 1024x1366 | yes | no |

## Known limits of this check

- Landscape used swapped width/height of the same device boxes.
- Member and admin screens need a signed-in session; they were not visually scored here.
- Overlap and “reachable tap target” are sampled from header/login chrome, not every table checkbox.
- Screenshots (if captured) live in gitignored `.phase4-output/`.
