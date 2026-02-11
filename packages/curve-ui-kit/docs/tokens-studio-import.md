# Tokens Studio Import (curve-ui-kit)

This importer syncs Tokens Studio exports directly into `curve-ui-kit` theme source files.
Default mode updates color-linked theme tokens plus `1_sizes_spaces.ts`.

Layering is preserved in generated marker sections:
- `0_primitives.ts` is the primitive source.
- `1_sizes_spaces.ts` and `1_surfaces_text.ts` reference primitives from `0_primitives.ts` where possible.
- `2_theme.ts` references primitives plus `SurfacesAndText` and `SizesAndSpaces` where possible.

Importer-managed marker blocks are strict source-of-truth:
- token added in export -> added on import
- token changed in export -> updated on import
- token removed in export -> removed on import

Only existing marker blocks are rewritten. No new generated/intermediate files are created.

## Pipeline Overview

Importer entrypoint:
- `packages/curve-ui-kit/scripts/import-tokens-studio.ts`

Internal modules:
- `packages/curve-ui-kit/scripts/tokens-studio/types.ts`
- `packages/curve-ui-kit/scripts/tokens-studio/extractors.ts`
- `packages/curve-ui-kit/scripts/tokens-studio/sd-runtime.ts`
- `packages/curve-ui-kit/scripts/tokens-studio/reference-renderer.ts`
- `packages/curve-ui-kit/scripts/tokens-studio/pipelines.ts`
- `packages/curve-ui-kit/scripts/tokens-studio/marker-writer.ts`

Processing stages:
1. load + validate Tokens Studio export sets (`$themes`/`$metadata`, W3C format, Aria skip)
2. resolve per-theme enabled/source set composition
3. extract and normalize token values by type/path
4. generate target marker objects (`Primitives`, `SizesAndSpaces`, `PlainSurfaces`, `ImportedThemeConstants`, `ImportedThemeTokens`, `TYPOGRAPHY_VARIANTS`)
5. render deterministic TS literals with expression references preserved
6. rewrite marker blocks only

## Scope

- Included:
  - `packages/curve-ui-kit/src/themes/design/0_primitives.ts`
  - `packages/curve-ui-kit/src/themes/design/1_sizes_spaces.ts`
  - `packages/curve-ui-kit/src/themes/design/1_surfaces_text.ts`
  - `packages/curve-ui-kit/src/themes/design/2_theme.ts`
  - `packages/curve-ui-kit/src/themes/typography.ts`
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
- Default (`--colors-only`) updates color-linked theme token data and full mapped `sizesAndSpaces` data.
- `--all-tokens` additionally updates non-color theme token/theme-constant data.

## How To Run

1. Export Tokens Studio as a folder.
2. Run check first:

```bash
yarn workspace curve-ui-kit tokens:check --input /absolute/path/to/tokens-export
```

3. If drift is reported, run import:

```bash
yarn workspace curve-ui-kit tokens:import --input /absolute/path/to/tokens-export
```

4. Optional full-token update:

```bash
yarn workspace curve-ui-kit tokens:import --input /absolute/path/to/tokens-export --all-tokens
```

5. Re-run check:

```bash
yarn workspace curve-ui-kit tokens:check --input /absolute/path/to/tokens-export
```

## Expected Token Path Conventions

The importer maps by path convention and fails if required paths are missing.

### Shared (resolved from `light` theme)

- `primitives.*` -> `Primitives` block in `0_primitives.ts`
- `sizesAndSpaces.*` -> `SizesAndSpaces` block in `1_sizes_spaces.ts`
- `typography.*` -> `TYPOGRAPHY_VARIANTS` block in `typography.ts`

### Per-theme

For each theme (`light`, `dark`, `chad`) after Tokens Studio set resolution:

- `surfaces.*` -> `PlainSurfaces.<Theme>` block in `1_surfaces_text.ts`
- `themeConstants.*` -> `ImportedThemeConstants.<theme>` block in `2_theme.ts`
- Required runtime token paths used by `2_theme.ts` button/focus/text overrides -> `ImportedThemeTokens.<theme>` block in `2_theme.ts`

New keys from export are added in-place inside these existing marker objects.

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

## Token-Set Matrix

- Primitives:
  - `00_Primitives/Base`
- Sizes and spaces:
  - `00_Primitives/Base`
  - `01_Mapped_Sizes&Spaces/sm|md|lg`
- Surfaces:
  - `00_Primitives/Base`
  - `01_Surfaces&Text/Default`
  - `02_Theme/Light|Dark|Chad` (theme context for alias resolution)
- Theme tokens/constants:
  - `00_Primitives/Base`
  - `01_Mapped_Sizes&Spaces/sm`
  - `02_Theme/Light|Dark|Chad`
- Typography variants:
  - `02_Theme/Light` typography tokens
  - plus existing sizing/line-height/font-weight maps for reference binding

## Typography Recipe Generation

- The importer now manages `TYPOGRAPHY_VARIANTS` inside:
  - `packages/curve-ui-kit/src/themes/typography.ts`
- Marker section:
  - `/* TOKENS-STUDIO:BEGIN_TYPOGRAPHY_VARIANTS */`
  - `/* TOKENS-STUDIO:END_TYPOGRAPHY_VARIANTS */`
- Source-of-truth inputs:
  - typography tokens from `02_Theme/Light`
  - font size / line height / weight resolution through existing token maps
- Sync behavior:
  - source-driven add/update/remove inside marker block
  - existing key style is preserved when a case-insensitive key match exists
  - stale variants missing from source are removed
- Field mapping:
  - `textTransform` tokens -> `textCase`
  - numeric/semantic weight tokens -> Curve weight keys
  - dimension aliases mapped to `Sizing[...]` / existing keys where possible

## Warning Output

Importer warnings are non-fatal and are printed at the end of `tokens:import` and `tokens:check`.

- `reference-fallback`: alias could not be represented as a TS reference, so literal value was written.
- `coerce-fallback`: optional token could not be resolved/coerced, so existing fallback value was kept.
- `optional-missing`: optional token path is missing from source theme composition.

## Troubleshooting

1. `Legacy token format detected ... value/type`
- Export is not W3C format. Re-export with `$value/$type`.

2. `Missing required themes in $themes`
- Ensure `light`, `dark`, `chad` exist in `$themes` or include standard `02_Theme/*` sets.

3. `Missing required runtime token(s)`
- Required button/focus/text override tokens are absent from composed theme sets.

4. `Circular token reference detected`
- One or more alias chains form a cycle; fix source tokens.

5. Marker parsing errors
- Check that each importer-managed file still contains required `BEGIN_/END_` markers and valid const declarations.
