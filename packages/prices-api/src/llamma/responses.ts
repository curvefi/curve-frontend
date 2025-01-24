import type { Address } from "..";

export type GetLlammaEventsResponse = {
  count: number;
  data: {
    provider: Address;
    deposit: {
      amount: number;
      n1: number;
      n2: number;
    } | null;
    withdrawal?: {
      amount_borrowed: number;
      amount_collateral: number;
    } | null;
    block_number: number;
    timestamp: number;
    transaction_hash: Address;
  }[];
};

export type GetLlammaTradesResponse = {
  count: number;
  data: {
    sold_id: number;
    bought_id: number;
    token_sold: {
      symbol: string;
      address: Address;
    };
    token_bought: {
      symbol: string;
      address: Address;
    };
    amount_sold: number;
    amount_bought: number;
    price: number;
    buyer: Address;
    fee_x: number;
    fee_y: number;
    block_number: number;
    timestamp: number;
    transaction_hash: Address;
  }[];
};

export type GetLlammaOHLCResponse = {
  data: {
    time: number;
    open: number;
    close: number;
    high: number;
    low: number;
    base_price: number;
    oracle_price: number;
    volume: number;
  }[];
};
