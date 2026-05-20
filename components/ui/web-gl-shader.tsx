"use client"

import { useEffect, useRef, useState } from "react"

type ShaderRefs = {
  gl: WebGLRenderingContext | null
  program: WebGLProgram | null
  buffer: WebGLBuffer | null
  timeLocation: WebGLUniformLocation | null
  resolutionLocation: WebGLUniformLocation | null
  animationId: number | null
  startTime: number
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()

  if (!vertexShader || !fragmentShader || !program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  return program
}

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webGlUnavailable, setWebGlUnavailable] = useState(false)
  const [shouldStart, setShouldStart] = useState(false)
  const refs = useRef<ShaderRefs>({
    gl: null,
    program: null,
    buffer: null,
    timeLocation: null,
    resolutionLocation: null,
    animationId: null,
    startTime: 0,
  })

  useEffect(() => {
    const mobileDelay = window.matchMedia("(max-width: 767px)").matches ? 3500 : 0
    if (mobileDelay === 0) {
      setShouldStart(true)
      return
    }

    const startTimer = window.setTimeout(() => setShouldStart(true), mobileDelay)
    return () => window.clearTimeout(startTimer)
  }, [])

  useEffect(() => {
    if (!shouldStart) return

    const canvas = canvasRef.current
    if (!canvas) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    })

    if (!gl) {
      setWebGlUnavailable(true)
      return
    }

    const vertexSource = `
      attribute vec2 position;

      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentSource = `
      precision highp float;

      uniform vec2 resolution;
      uniform float time;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        float distortion = 0.05;
        float xScale = 1.0;
        float yScale = 0.5;
        float d = length(p) * distortion;

        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    const program = createProgram(gl, vertexSource, fragmentSource)
    const buffer = gl.createBuffer()
    if (!program || !buffer) {
      setWebGlUnavailable(true)
      return
    }

    const positionLocation = gl.getAttribLocation(program, "position")
    const resolutionLocation = gl.getUniformLocation(program, "resolution")
    const timeLocation = gl.getUniformLocation(program, "time")
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

    refs.current = {
      gl,
      program,
      buffer,
      timeLocation,
      resolutionLocation,
      animationId: null,
      startTime: performance.now(),
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    gl.useProgram(program)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth
      const height = canvas.clientHeight || window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const renderWidth = Math.max(1, Math.floor(width * pixelRatio))
      const renderHeight = Math.max(1, Math.floor(height * pixelRatio))

      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth
        canvas.height = renderHeight
      }

      gl.viewport(0, 0, renderWidth, renderHeight)
      gl.uniform2f(resolutionLocation, renderWidth, renderHeight)
    }

    const draw = (now: number) => {
      const { current } = refs
      if (!current.gl || !current.program) return

      gl.useProgram(program)
      gl.uniform1f(timeLocation, reducedMotion ? 0.0 : (now - current.startTime) * 0.0006)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      if (!reducedMotion) {
        current.animationId = requestAnimationFrame(draw)
      }
    }

    resize()
    draw(performance.now())
    window.addEventListener("resize", resize, { passive: true })

    return () => {
      const { current } = refs
      if (current.animationId) cancelAnimationFrame(current.animationId)
      window.removeEventListener("resize", resize)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      refs.current = {
        gl: null,
        program: null,
        buffer: null,
        timeLocation: null,
        resolutionLocation: null,
        animationId: null,
        startTime: 0,
      }
    }
  }, [shouldStart])

  if (webGlUnavailable) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-0 block h-full w-full"
      aria-hidden="true"
    />
  )
}
