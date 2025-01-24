type Bar = {
  value: number;
  label: string;
};

export type GetLoanDistributionResponse = {
  stablecoin: Bar[];
  debt: Bar[];
  collateral: Bar[];
};
