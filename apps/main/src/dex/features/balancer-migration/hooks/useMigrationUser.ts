import { useConnection } from 'wagmi'

/** Whose positions the migration pages show and migrate. */
export const useMigrationUser = () => useConnection().address
