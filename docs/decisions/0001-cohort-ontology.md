# Decision 0001 — The Cohort ontology (sigil → cohort)

- **Status:** accepted (reversible — see "Alternatives rejected")
- **Date:** 2026-09-04
- **Decided by:** project owner brief + implementation lead

## Decision

The entity the user draws — the shadow-entity that appears at the centre of the
desktop — is called the **Cohort**. The word **"sigil" is retired from all
user-facing copy** (it carries occult connotation the project explicitly wants
to avoid). Internally the runtime keeps the old key names for now; the mapping
below is normative until a migration is scheduled.

## Mapping

| Concept | User-facing name | Runtime name (current) |
|---|---|---|
| The drawn shadow-entity, unique, saved once | **the Cohort** | `state.sigils[0]` |
| The casting ritual app (Mistress Physius) | **Cohort** (copy rename pending) | `sigil.html`, `src/features/sigil/` |
| Artifact → Cohort edges | "declared relations" | `state.relations` (edges hardcode `to: 'sigil'`) |
| Confession-people gathered by E-Lizabeth | "those you carry" | `state.cohort` |

## Rules carried over unchanged

1. The Cohort is unique: after it is cast and saved, the casting app scratches
   itself out. A new Cohort requires the existing erase-all-progress ritual.
2. The Cohort is the anchor of the relation grammar: every artifact relation
   points at it (`artifact → verb → cohort`).
3. The desktop constellation renders the Cohort as the hub; artifacts orbit.

## Alternatives rejected

- **Full runtime rename now** (`sigils` → `cohortEntity`, etc.). Rejected:
  collides with the existing `state.cohort` key (E-Lizabeth's people), orphans
  existing localStorage, and touches every feature for zero user-visible gain.
  Revisit after the audit-critical fixes, with an explicit migration function
  in `state.js` and a versioned storage key.
- **Keeping "sigil" as internal jargon in user-facing copy.** Rejected: the
  connotation concern is the entire point of the rename.

## Consequences

- New copy must say "Cohort"; grep for "sigil" in user-visible strings is part
  of every future copy pass (runtime identifiers stay until the migration).
- The prompt engine addresses the entity as `{cohort}` and reads its name from
  the sigil entry's name/intention field.
