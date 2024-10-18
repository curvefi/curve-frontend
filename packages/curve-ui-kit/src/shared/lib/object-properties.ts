/**
 * Removes a specified property from an object and returns a new object without that property.
 *
 * @template T - The type of the input object.
 * @template K - The type of the key to be omitted (must be a key of T).
 * @param {T} obj - The original object from which to omit a property.
 * @param {K} propertyToOmit - The key of the property to be omitted.
 * @returns {Omit<T, K>} A new object with all properties of the original object except the omitted one.
 */
export function omitProperty<T extends object, K extends keyof T>(obj: T, propertyToOmit: K): Omit<T, K> {
  const { [propertyToOmit]: _, ...rest } = obj
  return rest
}
