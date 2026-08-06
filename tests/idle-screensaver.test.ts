import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  clampBounceState,
  createIdleTimer,
  createInitialBounceState,
  getBounceBounds,
  stepBounce,
} from '../lib/home/idleScreensaver'

type TimerHandle = ReturnType<typeof setTimeout>

function createFakeScheduler() {
  let nextHandle = 1
  const scheduled = new Map<number, () => void>()

  return {
    schedule(callback: () => void) {
      const handle = nextHandle
      nextHandle += 1
      scheduled.set(handle, callback)
      return handle as unknown as TimerHandle
    },
    cancel(handle: TimerHandle) {
      scheduled.delete(handle as unknown as number)
    },
    firstCallback() {
      return scheduled.values().next().value as (() => void) | undefined
    },
    runFirst() {
      const entry = scheduled.entries().next().value as [number, () => void] | undefined
      assert.ok(entry)
      scheduled.delete(entry[0])
      entry[1]()
    },
    size() {
      return scheduled.size
    },
  }
}

describe('idle screensaver timer', () => {
  test('arms once and activates only when the current timer fires', () => {
    const scheduler = createFakeScheduler()
    const states: boolean[] = []
    const timer = createIdleTimer({
      delayMs: 45_000,
      canActivate: () => true,
      onActiveChange: (active) => states.push(active),
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
    })

    timer.arm()
    assert.equal(timer.isActive(), false)
    assert.equal(scheduler.size(), 1)
    scheduler.runFirst()
    assert.equal(timer.isActive(), true)
    assert.deepEqual(states, [true])
  })

  test('activity dismisses, replaces the timer, and invalidates a stale callback', () => {
    const scheduler = createFakeScheduler()
    const states: boolean[] = []
    const timer = createIdleTimer({
      delayMs: 45_000,
      canActivate: () => true,
      onActiveChange: (active) => states.push(active),
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
    })

    timer.arm()
    const staleCallback = scheduler.firstCallback()
    assert.ok(staleCallback)
    timer.activity()
    assert.equal(scheduler.size(), 1)
    staleCallback()
    assert.equal(timer.isActive(), false)

    scheduler.runFirst()
    assert.equal(timer.isActive(), true)
    timer.activity()
    assert.equal(timer.isActive(), false)
    assert.equal(scheduler.size(), 1)
    assert.deepEqual(states, [true, false])
  })

  test('retries a temporary blocker without requiring another activity event', () => {
    const scheduler = createFakeScheduler()
    let blocked = true
    const states: boolean[] = []
    const timer = createIdleTimer({
      delayMs: 45_000,
      canActivate: () => !blocked,
      onActiveChange: (active) => states.push(active),
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
    })

    timer.arm()
    assert.equal(scheduler.size(), 1)
    scheduler.runFirst()
    assert.equal(timer.isActive(), false)
    assert.equal(scheduler.size(), 1)

    blocked = false
    scheduler.runFirst()
    assert.equal(timer.isActive(), true)
    assert.deepEqual(states, [true])
  })

  test('suspend, resume, and dispose leave no stale work', () => {
    const scheduler = createFakeScheduler()
    const states: boolean[] = []
    const timer = createIdleTimer({
      delayMs: 45_000,
      canActivate: () => true,
      onActiveChange: (active) => states.push(active),
      schedule: scheduler.schedule,
      cancel: scheduler.cancel,
    })

    timer.arm()
    timer.suspend()
    assert.equal(scheduler.size(), 0)
    timer.activity()
    assert.equal(scheduler.size(), 0)
    timer.resume()
    scheduler.runFirst()
    assert.equal(timer.isActive(), true)
    timer.dispose()
    assert.equal(timer.isActive(), false)
    assert.equal(scheduler.size(), 0)
    timer.arm()
    assert.equal(scheduler.size(), 0)
    assert.deepEqual(states, [true, false])
  })
})

describe('idle screensaver bounce physics', () => {
  test('builds inset bounds and a deterministic in-bounds start', () => {
    const bounds = getBounceBounds(
      { width: 1000, height: 700 },
      { width: 200, height: 90 },
      { top: 20, right: 30, bottom: 40, left: 10 },
    )

    assert.deepEqual(bounds, { minX: 10, maxX: 770, minY: 20, maxY: 570 })
    const initial = createInitialBounceState(bounds, 1000)
    assert.ok(initial.x >= bounds.minX && initial.x <= bounds.maxX)
    assert.ok(initial.y >= bounds.minY && initial.y <= bounds.maxY)
    assert.ok(initial.velocityX > 0)
    assert.ok(initial.velocityY > 0)
  })

  test('reflects the correct velocity on horizontal, vertical, and corner collisions', () => {
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 80 }

    const horizontal = stepBounce(
      { x: 99, y: 20, velocityX: 20, velocityY: 5 },
      0.1,
      bounds,
    )
    assert.equal(horizontal.x, 99)
    assert.equal(horizontal.velocityX, -20)
    assert.equal(horizontal.velocityY, 5)
    assert.equal(horizontal.collided, true)

    const vertical = stepBounce(
      { x: 20, y: 79, velocityX: 5, velocityY: 20 },
      0.1,
      bounds,
    )
    assert.equal(vertical.y, 79)
    assert.equal(vertical.velocityX, 5)
    assert.equal(vertical.velocityY, -20)
    assert.equal(vertical.collided, true)

    const corner = stepBounce(
      { x: 99, y: 79, velocityX: 20, velocityY: 20 },
      0.1,
      bounds,
    )
    assert.equal(corner.velocityX, -20)
    assert.equal(corner.velocityY, -20)
    assert.equal(corner.collided, true)
  })

  test('clamps resized states and stays stable when the mark fills the viewport', () => {
    const clamped = clampBounceState(
      { x: 500, y: -40, velocityX: 90, velocityY: -70 },
      { minX: 16, maxX: 220, minY: 20, maxY: 180 },
    )
    assert.deepEqual(clamped, {
      x: 220,
      y: 20,
      velocityX: 90,
      velocityY: -70,
    })

    const tinyBounds = getBounceBounds(
      { width: 100, height: 60 },
      { width: 140, height: 70 },
      { top: 16, right: 16, bottom: 16, left: 16 },
    )
    const tiny = stepBounce(
      createInitialBounceState(tinyBounds, 100),
      1,
      tinyBounds,
    )
    assert.deepEqual(tinyBounds, { minX: 16, maxX: 16, minY: 16, maxY: 16 })
    assert.equal(tiny.x, 16)
    assert.equal(tiny.y, 16)
    assert.equal(tiny.velocityX, 0)
    assert.equal(tiny.velocityY, 0)
    assert.equal(tiny.collided, false)
  })
})
