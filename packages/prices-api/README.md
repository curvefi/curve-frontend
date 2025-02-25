# @curvefi/prices-api

JavaScript library for Curve Finance Prices API.

## Installation

```bash
npm install @curvefi/prices-api
```

## Usage

```typescript
import { getMarkets } from '@curvefi/prices-api/crvusd'

// Get crvUSD markets for Ethereum
const markets = await getMarkets('ethereum')
```

## Features

- Chain data (TVL, volumes, fees)
- crvUSD / LlamaLend markets and user positions
- DAO data (votes, locks, gauges)
- Typed responses using TypeScript
- Tree-shakeable exports
- Zero dependencies

## License

MIT
