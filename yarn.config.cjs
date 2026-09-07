module.exports = {
  /** Verifies that all duplicated dependencies are declaring the exact same version range. */
  constraints: async ({ Yarn: { dependencies } }) =>
    [...Map.groupBy(dependencies(), dependency => dependency.ident)]
      .filter(([, deps]) => new Set(deps.map(d => d.range)).size > 1)
      .forEach(([name, deps]) =>
        deps.forEach(d => d.error(`Found ${name} with different versions: ${deps.map(d => d.range).join(', ')}`)),
      ),
}
