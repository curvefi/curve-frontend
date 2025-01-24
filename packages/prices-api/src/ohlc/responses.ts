export type GetOHLCResponse = {
  chain: string;
  address: string;
  data: {
    time: number;
    open: number;
    close: number;
    high: number;
    low: number;
  }[];
};
