# Tokens Studio Import (curve-ui-kit)

This importer syncs Tokens Studio exports directly into `curve-ui-kit` theme source files.
Default mode updates color-linked theme tokens plus `1_sizes_spaces.ts`.

## Scope

- Included:
  - `packages/curve-ui-kit/src/themes/design/0_primitives.ts`
  - `packages/curve-ui-kit/src/themes/design/1_sizes_spaces.ts`
  - `packages/curve-ui-kit/src/themes/design/1_surfaces_text.ts`
  - `packages/curve-ui-kit/src/themes/design/2_theme.ts`
- Excluded: Aria-based token/component paths (`packages/ui`, `react-aria` surfaces)

## Requirements

1. Export a **folder** from Tokens Studio (JSON files).
2. Use **W3C/DTCG** token format (`$value` / `$type`).
3. Include a `$themes` payload with required themes: `light`, `dark`, `chad`.
   - If `$themes` is missing/empty, the importer can infer themes from `02_Theme/Light|Dark|Chad` sets.
4. Theme set statuses:
- Included: `enabled`, `source`
- Excluded: `disabled`

## Commands

From repo root:

```bash
yarn workspace curve-ui-kit tokens:import --input /absolute/path/to/tokens-export
```

```bash
yarn workspace curve-ui-kit tokens:check --input /absolute/path/to/tokens-export
```

Optional full-token mode:

```bash
yarn workspace curve-ui-kit tokens:import --input /absolute/path/to/tokens-export --all-tokens
```

- `tokens:import` writes token marker sections.
- `tokens:check` verifies marker sections are up to date and exits non-zero on drift.
- Default (`--colors-only`) updates color-linked token data and `sizesAndSpaces`.
- `--all-tokens` additionally updates non-color theme-flat/theme-constant token data.

## Expected Token Path Conventions

The importer maps by path convention and fails if required paths are missing.

### Shared (resolved from `light` theme)

- `primitives.*` -> `Primitives` block in `0_primitives.ts`
- `sizesAndSpaces.*` -> `SizesAndSpaces` block in `1_sizes_spaces.ts`

### Per-theme

For each theme (`light`, `dark`, `chad`) after Tokens Studio set resolution:

- `surfaces.*` -> `PlainSurfaces.<Theme>` block in `1_surfaces_text.ts`
- `themeConstants.*` -> `ImportedThemeConstants.<theme>` block in `2_theme.ts`
- Required runtime token paths used by `2_theme.ts` button/focus/text overrides -> `ImportedThemeFlat.<theme>` block in `2_theme.ts`

Examples:

- `primitives.Grays.500`
- `sizesAndSpaces.Spacing.md.desktop`
- `surfaces.Text.Primary`
- `themeConstants.appBackground`
- `themeConstants.slider.default.SliderThumbImage`

## Failure Modes (Fail-Fast)

The importer fails when:

1. Legacy tokens are detected (`value`/`type` instead of `$value`/`$type`).
2. `$themes` is missing and the fallback `02_Theme/Light|Dark|Chad` pattern is unavailable.
3. Required theme (`light`, `dark`, `chad`) is missing.
4. A required mapped token path is missing.
5. A theme references a missing token set.

## Notes

- Set names containing `aria` are ignored by design.
- Only marker sections are rewritten (`/* TOKENS-STUDIO:BEGIN_* */ ... /* TOKENS-STUDIO:END_* */`).
- Non-token logic in those files remains untouched (manual code outside markers is preserved).
- In color-only mode, non-token code is still preserved; only marker sections are rewritten.
