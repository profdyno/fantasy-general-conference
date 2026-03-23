---
name: Game Design and Features
description: Full feature set of the Fantasy General Conference game as of 2026-03-23
type: project
---

**Two-phase game:** Predictions (before conference) → Live Play (during conference)

**Categories (85 questions):**
- U.S. Temples (2) — city autocomplete via OpenStreetMap Nominatim API
- Worldwide Temples (2) — city autocomplete
- Topics (2) — dropdown from official churchofjesuschrist.org gospel topics
- Songs (4) — dropdown from hymn list, type-your-own allowed
- Choir Clothing (5) — select color per session
- Conducting (5) — select leader per session
- Quick Picks (4) — temples count, Uchtdorf flight, weather (multi-select), youth choir
- Speakers (60) — 15 leaders × 4 fields (predicted session, actual session LIVE, topic LIVE, prompting LIVE)
- Other Speakers (1) — checkbox list of 25 names grouped by presidency, pick up to 5

**Live fields:** allow_after_lock=1 questions are disabled before lock, enabled after lock. Auto-scored on save if actual exists.

**Scoring types:** exact, boolean, closest, contains, any_value, none, checkbox_match, custom_points

**Penalties:** Fighting, Sleeping, Phone Use, Leaving — up to 10 infractions each at -5 pts. Assigned by parents (self + children) or grandparents (everyone).

**Player roles:** grandparent, parent, child with parent1_id/parent2_id relationships. Affects penalty access and scoreboard answer visibility.

**Admin answers tab:** Checklist-based scoring for temples, topics, songs (aggregates player guesses). Single session dropdown per speaker that scores both predicted and actual.

**How to apply:** When adding new features, respect the two-phase model and role-based permissions.
