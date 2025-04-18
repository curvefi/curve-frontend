/**
 * Recursively fetches all items from a paginated API endpoint.
 *
 * @template T The type of the items being fetched.
 * @template R The type of the raw response from the fetch function.
 * @param f An async function that fetches a single page of data.
 *          It takes the page number and offset as arguments and returns a Promise resolving to the raw response R.
 * @param page The initial page number to start fetching from (default: 0).
 * @param offset The number of items to fetch per page (default: 1000).
 * @param getItems An optional function to extract the array of items (T[]) from the raw response (R).
 *                 Use this if the fetch function `f` returns an object containing the items (e.g., { data: [...] })
 *                 instead of the array directly. If omitted, the function assumes the raw response R is the array T[].
 * @returns A Promise resolving to an array containing all fetched items.
 */
export async function paginate<T, R>(
  f: (page: number, offset: number) => Promise<R>,
  page = 0,
  offset = 1000,
  getItems?: (response: R) => T[],
): Promise<T[]> {
  const response = await f(page, offset)
  const xs = getItems ? getItems(response) : (response as unknown as T[])

  const next = await (xs.length >= offset ? paginate(f, page + 1, offset, getItems) : Promise.resolve([]))

  return xs.concat(next)
}
