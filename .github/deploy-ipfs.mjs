import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { Blob } from 'node:buffer'

function formatBytes(bytes) {
  const sizes = 'kmgt'
  const i = Math.min(parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10), sizes.length - 1)
  return `${Math.round(bytes / Math.pow(1024, i), 2)}${sizes.charAt(i - 1)}B`
}

async function* readAllFilesRecursively(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const fullPath = join(root, entry.name)
    if (entry.isDirectory()) {
      yield* readAllFilesRecursively(fullPath)
    } else if (entry.isFile()) {
      yield fullPath
    }
  }
}

const pinDirectoryToPinata = async (root) => {
  if (!root) throw new Error(`Usage: node pin-ens.mjs <directory>`)

  const formData = new FormData()

  for await (const file of readAllFilesRecursively(root)) {
    const normalizedPath = relative(root, file).split(sep).join('/')
    const buffer = await readFile(file)
    const blob = new Blob([buffer])
    formData.append('file', blob, normalizedPath)
    console.info(`Added file: ${normalizedPath} (${formatBytes(buffer.length)})`)
  }

  if (!process.env.PINATA_JWT) throw new Error(`PINATA_JWT environment variable is not set, cannot upload.`)

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.PINATA_JWT },
    body: formData,
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`Upload failed: ${response.status} ${response.statusText}\n${text}`)
  console.info(text)
}

pinDirectoryToPinata(process.argv[2]).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
