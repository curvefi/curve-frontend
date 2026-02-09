type RequestPriority = 'high' | 'default' | 'low'

type QueuedRequest = {
  priority: RequestPriority
  task: () => Promise<unknown>
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}

const PRIORITY_ORDER: Record<RequestPriority, number> = {
  high: 0,
  default: 1,
  low: 2,
}

class SwapRequestScheduler {
  private queue: QueuedRequest[] = []
  private activeCount = 0

  constructor(private readonly maxConcurrency: number) {}

  schedule<T>(priority: RequestPriority, task: () => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        priority,
        task: task as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      })
      this.queue.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
      this.flush()
    })
  }

  private flush() {
    while (this.activeCount < this.maxConcurrency && this.queue.length > 0) {
      const next = this.queue.shift()
      if (!next) return
      this.activeCount += 1
      void next
        .task()
        .then((value) => next.resolve(value))
        .catch((error) => next.reject(error))
        .finally(() => {
          this.activeCount -= 1
          this.flush()
        })
    }
  }
}

const swapRequestScheduler = new SwapRequestScheduler(3)

export function scheduleSwapRequest<T>(priority: RequestPriority, task: () => Promise<T>) {
  return swapRequestScheduler.schedule(priority, task)
}
