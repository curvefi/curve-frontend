import startsWith from 'lodash/startsWith'

export function isStartPartOrEnd(searchString: string, string: string) {
  return startsWith(string, searchString) || string.includes(searchString) || string === searchString
}

export function parsedSearchTextToList(searchText: string) {
  return searchText
    .toLowerCase()
    .split(searchText.indexOf(',') !== -1 ? ',' : ' ')
    .filter((st) => st !== '')
    .map((st) => st.trim())
}
