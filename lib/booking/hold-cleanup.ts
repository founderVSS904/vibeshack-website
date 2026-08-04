export type BookingHoldCleanupFailure = {
  target: string
  error: unknown
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function isMissingStatus(status: number) {
  return status === 404 || status === 410
}

export async function deleteBookingHoldArtifact(
  remove: () => Promise<unknown>,
  verifyStillExists: () => Promise<unknown>,
  statusOf: (error: unknown) => number,
) {
  try {
    await remove()
  } catch (error) {
    if (isMissingStatus(statusOf(error))) return

    try {
      await verifyStillExists()
      throw error
    } catch (verificationError) {
      if (verificationError === error) throw error
      if (isMissingStatus(statusOf(verificationError))) return

      throw new Error(
        `${errorMessage(error)}; deletion could not be verified: ${errorMessage(verificationError)}`,
      )
    }
  }
}

export async function runOptimisticBookingHoldCleanup<State>(options: {
  attempts: number
  load: () => Promise<State>
  isReleased: (state: State) => boolean
  update: (state: State) => Promise<void>
  verifyReleased: () => Promise<boolean>
  statusOf: (error: unknown) => number
  concurrentStatus?: number
  concurrentFailureMessage: string
}) {
  const concurrentStatus = options.concurrentStatus ?? 412

  for (let attempt = 0; attempt < options.attempts; attempt++) {
    const state = await options.load()
    if (options.isReleased(state)) return

    try {
      await options.update(state)
      return
    } catch (error) {
      if (options.statusOf(error) !== concurrentStatus) {
        try {
          if (await options.verifyReleased()) return
        } catch (verificationError) {
          throw new Error(
            `${errorMessage(error)}; release could not be verified: ${errorMessage(verificationError)}`,
          )
        }

        throw error
      }

      if (attempt === options.attempts - 1) {
        throw new Error(options.concurrentFailureMessage)
      }
    }
  }
}

export async function collectBookingHoldCleanupFailures<T>(
  items: readonly T[],
  targetName: (item: T) => string,
  cleanup: (item: T) => Promise<void>,
) {
  const failures: BookingHoldCleanupFailure[] = []

  for (const item of items) {
    try {
      await cleanup(item)
    } catch (error) {
      failures.push({ target: targetName(item), error })
    }
  }

  return failures
}

export function bookingHoldCleanupError(
  bookingRef: string,
  failures: BookingHoldCleanupFailure[],
) {
  const details = failures
    .map(({ target, error }) => `${target}: ${errorMessage(error)}`)
    .join('; ')

  return new AggregateError(
    failures.map(({ error }) => error),
    `Booking hold cleanup was incomplete for ${bookingRef}. ${details}`,
  )
}
