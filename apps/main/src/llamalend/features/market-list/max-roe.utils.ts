type MaxRoeInputs = {
  leverage: number | null | undefined
  assets: { collateral: { rebasingYield: number | null | undefined } }
  rates: { borrowApy: number | null | undefined }
}

/** Annualized return on own capital at maximum leverage; input APYs and output are percentage points. */
export const getMaxRoe = ({
  leverage,
  assets: {
    collateral: { rebasingYield },
  },
  rates: { borrowApy },
}: MaxRoeInputs): number | undefined => {
  if (
    leverage == null ||
    leverage < 1 ||
    rebasingYield == null ||
    borrowApy == null ||
    ![leverage, rebasingYield, borrowApy].every(Number.isFinite)
  ) {
    return undefined
  }

  // Total collateral / equity = leverage, so debt / equity = leverage - 1.
  const roe = leverage * rebasingYield - (leverage - 1) * borrowApy
  return Number.isFinite(roe) ? roe : undefined
}
