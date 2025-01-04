// Configure your rate limit based on your ElevenLabs tier
const MAX_CONCURRENT_REQUESTS = 5;

export class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private timeout: NodeJS.Timeout | null = null;

  constructor(private intervalMs: number = 1000) {}

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      const task = async () => {
        this.running++;
        resolve();
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  async release(): Promise<void> {
    this.running--;
    this.processQueue();
  }

  private processQueue(): void {
    if (this.timeout) return;

    this.timeout = setTimeout(() => {
      this.timeout = null;

      while (this.queue.length > 0 && this.running < MAX_CONCURRENT_REQUESTS) {
        const task = this.queue.shift();
        if (task) task();
      }
    }, this.intervalMs);
  }
}

// Singleton instance for voice generation
let voiceRateLimiter: RateLimiter | null = null;

export function getVoiceRateLimiter(): RateLimiter {
  if (!voiceRateLimiter) {
    voiceRateLimiter = new RateLimiter();
  }
  return voiceRateLimiter;
}

