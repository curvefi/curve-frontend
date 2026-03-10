# @curvefi/primitives

Shared TypeScript primitives and small utility helpers used across Curve packages.

This package is intentionally simple and split into subpath exports (for example `@curvefi/primitives/fetch.utils`) so consumers can import only what they need.

## Installation

```bash
npm install @curvefi/primitives
```

## Usage

Import from subpaths (there is no root package entrypoint).

```ts
import type { Address } from '@curvefi/primitives/address.utils'
import { fetchJson, addQueryString } from '@curvefi/primitives/fetch.utils'
import { fromEntries, recordEntries } from '@curvefi/primitives/objects.utils'
```

## Available modules

- `address.utils` (`Hex`, `Address`, `Token`)
- `array.utils`
- `decimal.utils` (`Decimal`, `Amount`)
- `fetch.utils` (`fetchJson`, `addQueryString`, `FetchError`)
- `objects.utils`
- `router.utils` (shared router response types)
- `string.utils`

## Build

```bash
yarn workspace @curvefi/primitives build
```

This runs `tsc` and emits `dist/`.

## License

MIT
