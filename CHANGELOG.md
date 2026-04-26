# @coongro/vet-staff

## 0.2.0

### Minor Changes

- 3d66f1d: feat: detail view aligned with kit pattern — DeleteConfirmation banner replaced by UI.ConfirmDialog modal; EditProfessionalDialog migrated to UI.FormDialogSubmit and now also lets you edit the professional's name (via linked contact) and shows fields whose settings are off when data already exists; timestamps card compact + es-AR; vet_professional schema updated_at uses .$onUpdate() (COONG-112)

## 0.1.1

### Patch Changes

- 64292e8: Remove redundant `@coongro/contacts` dependency. It is already pulled transitively via `@coongro/staff` and not imported directly by `vet-staff` code.
- 6309c9b: Replace incoherent settings with field visibility toggles (license, specialty, senasa)
