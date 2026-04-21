---
"@coongro/vet-staff": patch
---

Remove redundant `@coongro/contacts` dependency. It is already pulled transitively via `@coongro/staff` and not imported directly by `vet-staff` code.
