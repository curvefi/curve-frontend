/**
 * Generates all possible combinations of elements from an input array with a specified size.
 * Each element can only be used once per combination.
 *
 * @example
 * // Returns [[1,2],[1,3],[2,3]]
 * combinations([1,2,3], 2)
 *
 * @param inputArray Array of elements to generate combinations from
 * @param size Size of each combination
 * @returns Array of all possible combinations where each element appears once per combination
 */
export function combinations<T>(inputArray: T[], size: number): T[][] {
  const result: T[][] = []

  function combinationHelper(start: number, chosen: T[]) {
    if (chosen.length === size) {
      result.push([...chosen])
      return
    }

    for (let i = start; i < inputArray.length; i++) {
      // Choose one element
      chosen.push(inputArray[i])
      // Generate combinations of smaller size
      combinationHelper(i + 1, chosen)
      // Un-choose the chosen element
      chosen.pop()
    }
  }

  combinationHelper(0, [])
  return result
}
