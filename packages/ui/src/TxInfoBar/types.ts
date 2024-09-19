export class TxHashError extends Error {
  data: { success: string[]; failed: string[] }

  constructor(message: string, data: { success: string[]; failed: string[] }) {
    super(message) // Call the base class constructor with the message
    this.data = data // Attach additional data
    this.name = 'TxHashError' // Set the error name to differentiate it
  }
}
