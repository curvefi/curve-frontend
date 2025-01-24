import type { Address } from "..";

export type GetEventsResponse = {
  count: number;
  events: {
    action_type: "deposit" | "withdraw";
    sender: Address;
    owner: Address;
    receiver?: Address;
    assets: string;
    shares: string;
    block_number: number;
    timestamp: string;
    transaction_hash: Address;
  }[];
};

export type GetYieldResponse = {
  data: {
    timestamp: number;
    assets: number;
    supply: number;
    proj_apy: string;
  }[];
};

export type GetRevenueResponse = {
  count: number;
  total_distributed: string;
  history: {
    strategy: Address;
    gain: string;
    loss: string;
    current_debt: string;
    total_refunds: string;
    total_fees: string;
    protocol_fees: string;
    tx_hash: Address;
    dt: string;
  }[];
};

export type GetStatisticsResponse = {
  last_updated: string;
  last_updated_block: number;
  proj_apr: number;
  supply: number;
};
