import { captureException } from '@sentry/react'
import { notify } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'

/** Open one connection and report storage failures before disabling persistence until reload. */
export const createIndexedDBStore = <T>(databaseName: string, storeName: string) => {
  let persistenceDisabled = false
  const onError = (error: unknown) => {
    if (persistenceDisabled) return
    persistenceDisabled = true
    captureException(error)
    notify(
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? t`Browser storage is full. Cached data won't be saved between visits.`
        : (error as Error)?.message || String(error),
      'error',
    )
  }

  const database = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName)
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => db.close()
      resolve(db)
    }
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB'))
  }).catch(onError)

  const withPersistence = async <R>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<R>) => {
    const db = await database
    if (!db || persistenceDisabled) return
    try {
      return await new Promise<R>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode)
        const request = action(transaction.objectStore(storeName))
        transaction.oncomplete = () => resolve(request.result)
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'))
      })
    } catch (error: unknown) {
      onError(error)
    }
  }

  return {
    get: (key: IDBValidKey) => withPersistence('readonly', store => store.get(key) as IDBRequest<T | undefined>),
    set: async (key: IDBValidKey, value: T) => {
      await withPersistence('readwrite', store => store.put(value, key))
    },
    remove: (key: IDBValidKey) => withPersistence('readwrite', store => store.delete(key)),
  }
}
