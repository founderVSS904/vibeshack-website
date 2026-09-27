import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import React from 'react'
import ts from 'typescript'

class FixtureNode {
  constructor(readonly children: FixtureNode[] = []) {}
  contains(target: unknown): boolean {
    return target === this || this.children.some((child) => child.contains(target))
  }
}

class FixtureDetails extends FixtureNode {
  open = true
  removeAttribute(name: string) {
    assert.equal(name, 'open')
    this.open = false
  }
}

type Element = React.ReactElement<Record<string, unknown>> & { ref?: { current: unknown } }
type PointerListener = (event: { target: unknown }) => void

function findElement(node: React.ReactNode, type: string): Element {
  const elements: Element[] = []
  const visit = (child: React.ReactNode) => {
    if (!React.isValidElement<Record<string, unknown>>(child)) return
    if (child.type === type) elements.push(child)
    React.Children.forEach(child.props.children as React.ReactNode, visit)
  }
  visit(node)
  assert.equal(elements.length, 1, `Expected one ${type}`)
  return elements[0]
}

// Run the component itself, with real React elements and isolated DOM/hook
// bindings. Its rendered event handlers and effect callbacks are not copied.
function headerFixture() {
  const effects: Array<() => (() => void)> = []
  const listeners = new Map<string, PointerListener>()
  const componentModule = { exports: {} as { default: (props: { email: string; preview: boolean }) => React.ReactNode } }
  const source = readFileSync(new URL('../app/employee/EmployeeHeader.tsx', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React, esModuleInterop: true,
  } }).outputText
  const context = vm.createContext({
    module: componentModule, exports: componentModule.exports, React, Node: FixtureNode,
    document: {
      addEventListener: (name: string, handler: PointerListener) => listeners.set(name, handler),
      removeEventListener: (name: string, handler: PointerListener) => {
        assert.equal(listeners.get(name), handler)
        listeners.delete(name)
      },
    },
    require: (name: string) => {
      if (name === 'react') return { ...React, useRef: (current: unknown) => ({ current }), useEffect: (effect: () => (() => void)) => effects.push(effect) }
      if (name === 'next/link') return { __esModule: true, default: 'a' }
      if (name === '@/components/BrandMark') return { BrandMark: 'div' }
      if (name === './EmployeeHeader.module.css') return { __esModule: true, default: {} }
      throw new Error(`Unexpected component dependency: ${name}`)
    },
  })
  vm.runInContext(compiled, context)
  const tree = componentModule.exports.default({ email: 'staff@example.test', preview: false })
  const detailsElement = findElement(tree, 'details')
  const summaryElement = findElement(tree, 'summary')
  const buttonElement = findElement(tree, 'button')
  const formElement = findElement(tree, 'form')
  let focusedSummary = 0
  const summary = Object.assign(new FixtureNode(), { focus: () => { focusedSummary += 1 } })
  const button = new FixtureNode()
  const details = new FixtureDetails([summary, button])
  assert.ok(detailsElement.ref)
  assert.ok(summaryElement.ref)
  detailsElement.ref.current = details
  summaryElement.ref.current = summary
  const cleanup = effects.map((effect) => effect())
  const blur = detailsElement.props.onBlur as (event: { currentTarget: FixtureDetails; relatedTarget: FixtureNode | null }) => void
  const keyDown = detailsElement.props.onKeyDown as (event: { key: string; preventDefault: () => void }) => void
  return {
    details, button, buttonElement, formElement, listeners,
    blur: (relatedTarget: FixtureNode | null) => blur({ currentTarget: details, relatedTarget }),
    pointerDown: (target: unknown) => {
      const handler = listeners.get('pointerdown')
      assert.ok(handler)
      handler({ target })
    },
    keyDown, focusedSummary: () => focusedSummary,
    cleanup: () => cleanup.forEach((remove) => remove()),
  }
}

test('a Safari-style null blur leaves Sign out available after its pointerdown', () => {
  const fixture = headerFixture()
  fixture.pointerDown(fixture.button)
  fixture.blur(null)
  assert.equal(fixture.details.open, true)
  assert.equal(fixture.buttonElement.props.type, 'submit')
  assert.equal(fixture.formElement.props.method, 'post')
  assert.equal(fixture.formElement.props.action, '/api/employee/auth/logout')
  fixture.cleanup()
})

test('focus stays open within the account disclosure and closes when moving outside', () => {
  const fixture = headerFixture()
  fixture.blur(fixture.button)
  assert.equal(fixture.details.open, true)
  fixture.blur(new FixtureNode())
  assert.equal(fixture.details.open, false)
  fixture.cleanup()
})

test('outside pointerdown closes the disclosure and unmount removes the listener', () => {
  const fixture = headerFixture()
  fixture.pointerDown(fixture.button)
  assert.equal(fixture.details.open, true)
  fixture.pointerDown(new FixtureNode())
  assert.equal(fixture.details.open, false)
  fixture.cleanup()
  assert.equal(fixture.listeners.size, 0)
})

test('Escape closes an open disclosure and returns focus to its summary', () => {
  const fixture = headerFixture()
  let prevented = 0
  const preventDefault = () => { prevented += 1 }
  fixture.keyDown({ key: 'Tab', preventDefault })
  assert.equal(fixture.details.open, true)
  assert.equal(fixture.focusedSummary(), 0)
  fixture.keyDown({ key: 'Escape', preventDefault })
  assert.equal(fixture.details.open, false)
  assert.equal(fixture.focusedSummary(), 1)
  assert.equal(prevented, 1)
  fixture.keyDown({ key: 'Escape', preventDefault })
  assert.equal(fixture.focusedSummary(), 1)
  assert.equal(prevented, 1)
  fixture.cleanup()
})
