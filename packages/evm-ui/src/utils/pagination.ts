/** Compute page count from total item count and page size. */
export const getPageCount = (totalCount: number | undefined, pageSize: number) =>
  totalCount ? Math.ceil(totalCount / pageSize) : 0
