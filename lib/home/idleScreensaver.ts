export const IDLE_SCREEN_DELAY_MS = 45_000
export const IDLE_SCREEN_PREVIEW_DELAY_MS = 900
export const IDLE_SCREEN_WAKE_SHIELD_MS = 450
export const IDLE_SCREEN_MAX_FRAME_SECONDS = 0.05

export const IDLE_SCREEN_COLORS = [
  '#EC0000',
  '#F6F6F6',
  '#2B50FF',
  '#FFD60A',
] as const

export type BounceBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export type BounceState = {
  x: number
  y: number
  velocityX: number
  velocityY: number
}

export type EdgeInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

export type Size = {
  width: number
  height: number
}

export type BounceStep = BounceState & {
  collided: boolean
}

type TimerHandle = ReturnType<typeof setTimeout>

type IdleTimerOptions = {
  delayMs: number
  canActivate: () => boolean
  onActiveChange: (active: boolean) => void
  schedule?: (callback: () => void, delayMs: number) => TimerHandle
  cancel?: (handle: TimerHandle) => void
}

export type IdleTimer = {
  arm: () => void
  activity: () => void
  suspend: () => void
  resume: () => void
  dispose: () => void
  isActive: () => boolean
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function getBounceBounds(
  viewport: Size,
  mark: Size,
  insets: EdgeInsets,
): BounceBounds {
  const minX = Math.max(0, insets.left)
  const minY = Math.max(0, insets.top)
  const maxX = Math.max(minX, viewport.width - mark.width - Math.max(0, insets.right))
  const maxY = Math.max(minY, viewport.height - mark.height - Math.max(0, insets.bottom))

  return { minX, maxX, minY, maxY }
}

export function createInitialBounceState(bounds: BounceBounds, viewportWidth: number): BounceState {
  const availableWidth = bounds.maxX - bounds.minX
  const availableHeight = bounds.maxY - bounds.minY
  const speed = clamp(viewportWidth * 0.075, 78, 116)

  return {
    x: bounds.minX + availableWidth * 0.18,
    y: bounds.minY + availableHeight * 0.27,
    velocityX: availableWidth > 0 ? speed : 0,
    velocityY: availableHeight > 0 ? speed * 0.72 : 0,
  }
}

export function clampBounceState(state: BounceState, bounds: BounceBounds): BounceState {
  return {
    ...state,
    x: clamp(state.x, bounds.minX, bounds.maxX),
    y: clamp(state.y, bounds.minY, bounds.maxY),
  }
}

function reflectAxis(
  position: number,
  velocity: number,
  min: number,
  max: number,
): { position: number; velocity: number; collided: boolean } {
  if (max <= min) return { position: min, velocity: 0, collided: false }

  let nextPosition = position
  let nextVelocity = velocity
  let collided = false
  let reflections = 0

  while ((nextPosition < min || nextPosition > max) && reflections < 16) {
    if (nextPosition < min) {
      nextPosition = min + (min - nextPosition)
      nextVelocity = Math.abs(nextVelocity)
      collided = true
    } else if (nextPosition > max) {
      nextPosition = max - (nextPosition - max)
      nextVelocity = -Math.abs(nextVelocity)
      collided = true
    }
    reflections += 1
  }

  return {
    position: clamp(nextPosition, min, max),
    velocity: nextVelocity,
    collided,
  }
}

export function stepBounce(
  state: BounceState,
  elapsedSeconds: number,
  bounds: BounceBounds,
): BounceStep {
  const delta = Math.max(0, elapsedSeconds)
  const horizontal = reflectAxis(
    state.x + state.velocityX * delta,
    state.velocityX,
    bounds.minX,
    bounds.maxX,
  )
  const vertical = reflectAxis(
    state.y + state.velocityY * delta,
    state.velocityY,
    bounds.minY,
    bounds.maxY,
  )

  return {
    x: horizontal.position,
    y: vertical.position,
    velocityX: horizontal.velocity,
    velocityY: vertical.velocity,
    collided: horizontal.collided || vertical.collided,
  }
}

export function createIdleTimer({
  delayMs,
  canActivate,
  onActiveChange,
  schedule = setTimeout,
  cancel = clearTimeout,
}: IdleTimerOptions): IdleTimer {
  let timeout: TimerHandle | null = null
  let active = false
  let suspended = false
  let disposed = false
  let generation = 0

  const clear = () => {
    generation += 1
    if (timeout !== null) {
      cancel(timeout)
      timeout = null
    }
  }

  const setActive = (nextActive: boolean) => {
    if (active === nextActive) return
    active = nextActive
    onActiveChange(active)
  }

  const arm = () => {
    if (disposed || suspended) return
    clear()
    if (!canActivate()) setActive(false)

    const ticket = generation
    timeout = schedule(() => {
      timeout = null
      if (disposed || ticket !== generation) return
      if (canActivate()) setActive(true)
      else arm()
    }, delayMs)
  }

  const suspend = () => {
    if (disposed) return
    suspended = true
    clear()
    setActive(false)
  }

  return {
    arm,
    activity: () => {
      if (disposed) return
      setActive(false)
      arm()
    },
    suspend,
    resume: () => {
      if (disposed) return
      suspended = false
      setActive(false)
      arm()
    },
    dispose: () => {
      if (disposed) return
      disposed = true
      clear()
      setActive(false)
    },
    isActive: () => active,
  }
}
