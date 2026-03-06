const POOL_REGISTRIES = [
  "main",
  "crypto",
  "factory",
  "factory-crvusd",
  "factory-eywa",
  "factory-crypto",
  "factory-twocrypto",
  "factory-tricrypto",
  "factory-stable-ng",
] as const;

interface PoolEntry {
  id: string;
  address: string;
  [key: string]: unknown;
}

interface PoolsResponse {
  success: boolean;
  data: {
    poolData: PoolEntry[];
  };
}

async function resolvePoolAddresses(
  network: string,
  ids: { id: string; comment: string }[],
): Promise<{ id: string; address: string | null; comment: string }[]> {
  const responses = await Promise.allSettled(
    POOL_REGISTRIES.map((registry) =>
      fetch(
        `https://api.curve.finance/api/getPools/${network}/${registry}`,
      ).then((res) => res.json() as Promise<PoolsResponse>),
    ),
  );

  const idToAddress = new Map<string, string>();

  for (const result of responses) {
    if (result.status === "fulfilled" && result.value.success) {
      for (const pool of result.value.data.poolData) {
        idToAddress.set(pool.id, pool.address);
      }
    }
  }

  return ids.map(({ id, comment }) => ({
    id,
    address: idToAddress.get(id) ?? null,
    comment,
  }));
}

const ids = [
  { id: "factory-v2-0", comment: "non pegged andre boo boo" },
  { id: "factory-v2-4", comment: "scrv doesnt exist" },
  { id: "factory-v2-6", comment: "old cvxcrv pool" },
  { id: "factory-v2-8", comment: "by team request" },
  { id: "factory-v2-36", comment: "by team request" },
  { id: "factory-v2-15", comment: "ruler dead" },
  { id: "factory-v2-17", comment: "ruler dead" },
  { id: "factory-v2-18", comment: "ruler dead" },
  { id: "factory-v2-19", comment: "ruler dead" },
  { id: "factory-v2-26", comment: "never seeded" },
  { id: "factory-v2-39", comment: "broken non pegged" },
  { id: "factory-v2-40", comment: "broken non pegged" },
  { id: "factory-v2-46", comment: "non pegged" },
  { id: "factory-v2-54", comment: "duplicate" },
  { id: "factory-v2-81", comment: "outdated, team asked to hide it" },
  { id: "factory-v2-103", comment: "broken" },
  { id: "factory-v2-65", comment: "non pegged" },
  { id: "factory-crypto-0", comment: "price borked" },
  { id: "factory-crypto-1", comment: "price borked" },
  { id: "factory-crypto-2", comment: "price borked" },
  { id: "factory-crypto-49", comment: "broken" },
  { id: "factory-crypto-265", comment: "broken" },
  { id: "factory-stable-ng-69", comment: "broken" },
  { id: "factory-stable-ng-405", comment: "offensive" },
  { id: "factory-stable-ng-406", comment: "offensive" },
  { id: "factory-twocrypto-154", comment: "offensive" },
  { id: "factory-twocrypto-155", comment: "offensive" },
  { id: "factory-twocrypto-156", comment: "offensive" },
  { id: "factory-twocrypto-200", comment: "offensive" },
  { id: "factory-tricrypto-53", comment: "offensive" },
  { id: "factory-tricrypto-54", comment: "offensive" },
  { id: "factory-tricrypto-55", comment: "offensive" },
  { id: "factory-tricrypto-56", comment: "offensive" },
  { id: "factory-tricrypto-71", comment: "offensive" },
  {
    id: "one-way-market-34",
    comment: "price per share too high, will be redeployed",
  },
  { id: "factory-twocrypto-274", comment: "duplicate and empty" },
  { id: "factory-twocrypto-275", comment: "duplicate and empty" },
  { id: "factory-twocrypto-279", comment: "IDRS token has broken balanceOf" },
  {
    id: "factory-stable-ng-506",
    comment: "Team asked to hide, pool will not used",
  },
  { id: "factory-stable-ng-685", comment: "Team asked to hide" },
];

const result = await resolvePoolAddresses("ethereum", ids);

// Format as a TypeScript array literal with inline comments
const lines = result.map(({ id, address, comment }) =>
  address
    ? `  '${address}', // ${id} - ${comment}`
    : `  // '${id}' - ${comment} (address not found)`,
);

console.log(`[\n${lines.join("\n")}\n]`);
