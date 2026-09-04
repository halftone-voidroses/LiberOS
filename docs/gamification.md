# Gamification spec — pulling without grinding

> Design constraints from the covenant: agency over protection; nothing
> nags. This spec's job is to make the OS *pull* the user back without ever
> shaming absence or turning therapy into KPIs.

## Theoretical frame

- **Self-Determination Theory (Deci & Ryan).** Motivation sustains when
  autonomy, competence, and relatedness are fed. Liber.OS already has
  autonomy (free exploration, no gates) and relatedness (the Cohort
  relationship *is* the relatedness loop). What's missing is **competence
  feedback** — visible mastery and progress.
- **Goal-setting theory (Locke & Latham).** Specific, difficult-but-attainable
  goals plus immediate feedback outperform "do your best". Raison is the
  feedback channel: specific, in-voice, one nudge at a time.
- **Peak-end rule (Kahneman).** Sessions are remembered by their peak and
  their end. The Sea release ritual is the designed session-ender.
- **Variable reward (operant scheduling).** Emergent prompts arrive on an
  unpredictable schedule — the machine pays in insight, not points.
- **Flow (Csikszentmihalyi).** The games booths are the difficulty-dial:
  exercises should sit at the edge of the user's current skill.

## Mechanics (in priority order)

1. **Session arc.** A visit has a shape: arrive (boot/dust) → one to three
   activities → the release (Sea). The status line and Raison may suggest a
   closing release if the visit has been long. Never block exit.
2. **Return rewards, not streaks.** Absence must never punish (no streak
   counters, no guilt copy — shame spirals are a real clinical risk). Instead
   the room *accumulates*: patina on carvings, dust patterns shifting, the
   Cohort's orbit slowly precessing. Presence changes the room's texture;
   absence leaves it resting, not decaying.
3. **Competence made visible.**
   - Carvings glow as travellers' apps are used (already implemented).
   - The constellation is the progress map: artifacts orbit the Cohort;
     relation edges thicken with use.
   - `visited-N` milestones (already in `shadow.js`) graduate the room —
     extend with subtle shell changes only (scars, dust density), never
     popups.
4. **"The Cohort becomes louder."** The narrative reskin of XP: as artifacts
   and relations accumulate, the Cohort's presence intensifies — the faint
   desktop overlay gains resolution, the status line occasionally speaks in
   the Cohort's name, prompts address the Cohort more intimately. Levels are
   diegetic, never numeric on screen.
5. **Variable prompts.** The prompt engine fires on relation binding; a
   later pass adds sparse ambient prompts (rare, seeded, capped per visit)
   so the OS occasionally *speaks first*.
6. **Mastery in the booths.** Each games booth tracks gentle personal bests
   locally (no leaderboards — this is a private room). Whimsy Wow may
   announce them theatrically.

## Anti-goals (explicitly forbidden)

- Streaks, daily-missed notifications, guilt copy, FOMO mechanics.
- Numeric XP/levels visible anywhere in the diegesis.
- Leaderboards or any social comparison.
- Notifications outside the session (the OS is a place you visit, not a
  service that summons you).
- Monetization of any kind.

## Measurement (for the research layer)

For the grad-theory layer: local, private, exportable session logs (what was
used, duration, what was released) — opt-in, off by default, owned by the
user, never transmitted. This feeds the eventual effectiveness questions
without analytics infrastructure.
