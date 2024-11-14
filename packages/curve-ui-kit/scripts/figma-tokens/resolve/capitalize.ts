const reRegExpChar = /[\\^$.*+?()[\]{}|]/g

/**
 * Escapes the `RegExp` special characters
 */
const escapeRegExp = (str: string) => RegExp(reRegExpChar.source).test(str) ? str.replace(reRegExpChar, '\\$&') : str

/**
 * Capitalizes the first letter of a given string.
 * @param {string} str - The input string to capitalize.
 * @returns {string} The input string with its first letter capitalized.
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Removes dashes and spaces, capitalizing the following letter.
 * @param {string} str - The input string to process.
 * @returns {string} The input string with dashes removed and the following letter capitalized.
 */
export const removeDashes = (str: string): string => str.replace(/[- ]+([a-z])/g, (_, letter) => letter.toUpperCase())

/**
 * Capitalizes specific words in a given text, even when they are part of longer words.
 * @param {string} text - The input text to process.
 * @param {string[]} [wordsToCapitalize=[]] - An array of words to capitalize.
 * @returns {string} The input text with specified words capitalized.
 */
export const capitalizeSpecificWords = (text: string, wordsToCapitalize: string[] = []): string => {
  if (wordsToCapitalize.length === 0) return text

  const escapedWords = wordsToCapitalize.map((word) => escapeRegExp(word))
  const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi')

  return text.replace(pattern, (match) => {
    const lowercaseMatch = match.toLowerCase()
    if (wordsToCapitalize.includes(lowercaseMatch)) {
      return capitalizeFirstLetter(lowercaseMatch)
    }
    return match
  })
}
