module.exports = {
  /** Verifies that all duplicated dependencies are declaring the exact same version range. */
  constraints: async ({ Yarn: { dependencies } }) =>
    Object.entries(
      dependencies().reduce(
        (groups, { ident, range }) => ({ ...groups, [ident]: [...(groups[ident] ?? []), range] }),
        {},
      ),
    )
      .filter(([, ranges]) => new Set(ranges).size > 1)
      .forEach(([name, ranges]) =>
        dependencies({ ident: name }).forEach(dependency =>
          dependency.error(`Found ${name} with different versions: ${[...new Set(ranges)].join(', ')}`),
        ),
      ),
}
