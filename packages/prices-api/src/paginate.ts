export async function paginate<T>(
  f: (page: number, offset: number) => Promise<T[]>,
  page = 0,
  offset = 1000
): Promise<T[]> {
  const xs = await f(page, offset);
  const next = await (xs.length >= offset
    ? paginate(f, page + 1, offset)
    : Promise.resolve([]));

  return xs.concat(next);
}