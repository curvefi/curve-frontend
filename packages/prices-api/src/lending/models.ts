type Bar = {
  value: number;
  label: string;
};

export type LoanDistribution = {
  stablecoin: Bar[];
  debt: Bar[];
  collateral: Bar[];
};
