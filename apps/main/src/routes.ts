import { type RouteConfig, route } from '@react-router/dev/routes'

export default [
  // Home page
  route('/', 'app/page.tsx'),

  // crvUSD routes
  route('/crvusd', 'app/crvusd/page.tsx'),
  route('/crvusd/:network/disclaimer', 'app/crvusd/[network]/disclaimer/page.tsx'),
  route('/crvusd/:network/integrations', 'app/crvusd/[network]/integrations/page.tsx'),
  route('/crvusd/:network/markets', 'app/crvusd/[network]/markets/page.tsx'),
  route(
    '/crvusd/:network/markets/:collateralId/create/:formType?',
    'app/crvusd/[network]/markets/[collateralId]/create/[[...formType]]/page.tsx',
  ),
  route(
    '/crvusd/:network/markets/:collateralId/manage/:formType?',
    'app/crvusd/[network]/markets/[collateralId]/manage/[[...formType]]/page.tsx',
  ),
  route('/crvusd/:network/pegkeepers', 'app/crvusd/[network]/pegkeepers/page.tsx'),
  route('/crvusd/:network/scrvUSD', 'app/crvusd/[network]/scrvUSD/page.tsx'),

  // DAO routes
  route('/dao', 'app/dao/page.tsx'),
  route('/dao/:network/analytics', 'app/dao/[network]/analytics/page.tsx'),
  route('/dao/:network/disclaimer', 'app/dao/[network]/disclaimer/page.tsx'),
  route('/dao/:network/gauges', 'app/dao/[network]/gauges/page.tsx'),
  route('/dao/:network/gauges/:gaugeAddress', 'app/dao/[network]/gauges/[gaugeAddress]/page.tsx'),
  route('/dao/:network/proposals', 'app/dao/[network]/proposals/page.tsx'),
  route('/dao/:network/proposals/:proposalId', 'app/dao/[network]/proposals/[proposalId]/page.tsx'),
  route('/dao/:network/user/:userAddress', 'app/dao/[network]/user/[userAddress]/page.tsx'),
  route('/dao/:network/vecrv/:formType?', 'app/dao/[network]/vecrv/[[...formType]]/page.tsx'),

  // DEX routes
  route('/dex', 'app/dex/page.tsx'),
  route('/dex/:network/compensation', 'app/dex/[network]/compensation/page.tsx'),
  route('/dex/:network/create-pool', 'app/dex/[network]/create-pool/page.tsx'),
  route('/dex/:network/dashboard', 'app/dex/[network]/dashboard/page.tsx'),
  route('/dex/:network/deploy-gauge', 'app/dex/[network]/deploy-gauge/page.tsx'),
  route('/dex/:network/disclaimer', 'app/dex/[network]/disclaimer/page.tsx'),
  route('/dex/:network/integrations', 'app/dex/[network]/integrations/page.tsx'),
  route('/dex/:network/pools', 'app/dex/[network]/pools/page.tsx'),
  route('/dex/:network/pools/:pool/:formType?', 'app/dex/[network]/pools/[pool]/[[...formType]]/page.tsx'),
  route('/dex/:network/swap', 'app/dex/[network]/swap/page.tsx'),

  // Lend routes
  route('/lend', 'app/lend/page.tsx'),
  route('/lend/:network/disclaimer', 'app/lend/[network]/disclaimer/page.tsx'),
  route('/lend/:network/integrations', 'app/lend/[network]/integrations/page.tsx'),
  route('/lend/:network/markets', 'app/lend/[network]/markets/page.tsx'),
  route(
    '/lend/:network/markets/:market/create/:formType?',
    'app/lend/[network]/markets/[market]/create/[[...formType]]/page.tsx',
  ),
  route(
    '/lend/:network/markets/:market/manage/:formType?',
    'app/lend/[network]/markets/[market]/manage/[[...formType]]/page.tsx',
  ),
  route(
    '/lend/:network/markets/:market/vault/:formType?',
    'app/lend/[network]/markets/[market]/vault/[[...formType]]/page.tsx',
  ),

  // LlamaLend routes
  route('/llamalend/:network/disclaimer', 'app/llamalend/[network]/disclaimer/page.tsx'),
  route('/llamalend/:network/integrations', 'app/llamalend/[network]/integrations/page.tsx'),
  route('/llamalend/:network/markets', 'app/llamalend/[network]/markets/page.tsx'),

  // Catch-all route (must be last)
  route('*', 'app/not-found.tsx'),
] satisfies RouteConfig
