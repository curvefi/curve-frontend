export const createIndexedDBStore = <T>(databaseName: string, storeName: string) => {
  const run = async <R>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<R>) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(storeName)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'))
    })
    try {
      return await new Promise<R>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const request = action(transaction.objectStore(storeName))
        transaction.oncomplete = () => resolve(request.result)
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
      })
    } finally {
      db.close()
    }
  }

  return {
    get: (key: IDBValidKey) => run('readonly', store => store.get(key) as IDBRequest<T | undefined>),
    set: async (key: IDBValidKey, value: T) => {
      await run('readwrite', store => store.put(value, key))
    },
    remove: (key: IDBValidKey) => run('readwrite', store => store.delete(key)),
  }
}
