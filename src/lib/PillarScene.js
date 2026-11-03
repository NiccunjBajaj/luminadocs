import * as THREE from 'three'

/**
 * Four pillars, each a stack of paper slabs.
 * Scroll progress (0..1) drops them one after another: slabs fall scattered and stretched,
 * then settle into a tight stack. Hovering a landed pillar riffles its pages toward the cursor.
 *
 * Built to stay cheap: it renders only while something is moving, rebuilds a stack only when
 * that stack's state changed, and writes colours straight into the buffer.
 */

export const PILLAR_COUNT = 4
const SLABS = 56
const HEIGHTS = [5.0, 6.4, 4.3, 5.8]
const SPACING = 2.3
const SLAB_W = 1.5
const SLAB_D = 1.1
const DROP_STEP = 0.2 // scroll progress between one pillar starting and the next
const DROP_LEN = 0.2 // scroll progress one pillar takes to land
const FALL = 16
const LABEL_GAP = 0.5 // world units between a pillar's top and its heading

// The active pillar changes once the next one is well into its fall, so the tab matches what is on screen.
export const progressToIndex = (p) =>
  Math.min(PILLAR_COUNT - 1, Math.max(0, Math.floor((p - DROP_LEN * 0.35) / DROP_STEP)))

const IDLE_A = new THREE.Color('#2b2f2e')
const IDLE_B = new THREE.Color('#383d3b')
const ON_A = new THREE.Color('#8df0c8')
const ON_B = new THREE.Color('#6fd6ad')
const LIFT = new THREE.Color('#6a736f')

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// Seeded generator so every load builds the same stacks.
function rng(seed) {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class PillarScene {
  constructor(host, { onSelect } = {}) {
    this.host = host
    this.onSelect = onSelect
    this.progress = 0
    this.target = 0
    this.hoverIndex = -1
    this.pointer = new THREE.Vector2()
    this.pointerSmooth = new THREE.Vector2()
    this.visible = false
    this.disposed = false
    this.raf = 0
    this.last = 0
    this.elapsed = 0
    this.rect = null
    this.labels = []
    this.ray = new THREE.Raycaster()
    this.dummy = new THREE.Object3D()
    this.v = new THREE.Vector3()
    this.tmp = new THREE.Color()

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    this.renderer.setClearColor(0x000000, 0)
    this.canvas = this.renderer.domElement
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:pan-y;'
    host.appendChild(this.canvas)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x1b2824, 1.2))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 11, 7)
    this.scene.add(key)
    const rim = new THREE.DirectionalLight(0x8df0c8, 0.45)
    rim.position.set(-6, 3, -5)
    this.scene.add(rim)

    this.slabGeo = new THREE.BoxGeometry(1, 1, 1)
    this.slabMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, metalness: 0 })
    this.hitMat = new THREE.MeshBasicMaterial({ visible: false })
    this.hitGeo = new THREE.BoxGeometry(1, 1, 1)

    this.pillars = []
    for (let i = 0; i < PILLAR_COUNT; i++) this.pillars.push(this.buildPillar(i))

    this.bind()
    this.resize()
  }

  buildPillar(i) {
    const H = HEIGHTS[i]
    const x = (i - (PILLAR_COUNT - 1) / 2) * SPACING
    const mesh = new THREE.InstancedMesh(this.slabGeo, this.slabMat, SLABS)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.setColorAt(0, IDLE_A)
    mesh.instanceColor.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = false
    this.group.add(mesh)

    const hit = new THREE.Mesh(this.hitGeo, this.hitMat)
    hit.scale.set(SLAB_W + 0.5, H, SLAB_D + 0.5)
    hit.position.set(x, H / 2, 0)
    hit.userData.index = i
    this.group.add(hit)

    const r = rng(11 + i * 97)
    const slabs = Array.from({ length: SLABS }, () => ({
      rot: (r() - 0.5) * 0.09,
      jx: (r() - 0.5) * 0.07,
      jz: (r() - 0.5) * 0.07,
      scatX: (r() - 0.5) * 2,
      scatZ: (r() - 0.5) * 2,
      spin: (r() - 0.5) * 2,
    }))

    return {
      i,
      H,
      x,
      mesh,
      hit,
      slabs,
      e: 0,
      act: 0,
      actTarget: 0,
      hover: 0,
      hoverTarget: 0,
      hoverY: 0,
      hoverYTarget: 0,
      impact: 0,
      landed: false,
      // What the buffers currently reflect, so unchanged stacks are skipped.
      drawn: { e: -1, hover: -1, hoverY: -1, impact: -1, act: -1, hoverC: -1, time: -1 },
    }
  }

  /** Heading elements, one per pillar, positioned above each stack. */
  setLabels(els) {
    this.labels = els
    this.frameOnce()
  }

  bind() {
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(this.host)

    this.io = new IntersectionObserver(([entry]) => this.setVisible(entry.isIntersecting), { threshold: 0 })
    this.io.observe(this.host)

    this.onMove = (e) => {
      const r = (this.rect ||= this.canvas.getBoundingClientRect())
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1))
      this.setHover(this.pick())
      this.invalidate()
    }
    this.onLeave = () => {
      this.pointer.set(0, 0)
      this.setHover(-1)
      this.invalidate()
    }
    this.onClick = (e) => {
      this.onMove(e)
      const i = this.pick()
      if (i >= 0) this.onSelect?.(i)
    }
    this.onEnter = () => (this.rect = this.canvas.getBoundingClientRect())
    this.canvas.addEventListener('pointerenter', this.onEnter)
    this.canvas.addEventListener('pointermove', this.onMove)
    this.canvas.addEventListener('pointerleave', this.onLeave)
    this.canvas.addEventListener('click', this.onClick)
  }

  pick() {
    this.ray.setFromCamera(this.pointer, this.camera)
    const hits = this.ray.intersectObjects(
      this.pillars.filter((p) => p.e > 0.97).map((p) => p.hit),
      false,
    )
    if (!hits.length) return -1
    const p = this.pillars[hits[0].object.userData.index]
    p.hoverYTarget = hits[0].point.y
    return p.i
  }

  setHover(i) {
    if (i === this.hoverIndex) return
    this.hoverIndex = i
    this.pillars.forEach((p) => (p.hoverTarget = p.i === i ? 1 : 0))
    this.canvas.style.cursor = i >= 0 ? 'pointer' : ''
  }

  setVisible(v) {
    this.visible = v
    if (v) this.invalidate()
    else if (this.raf) {
      cancelAnimationFrame(this.raf)
      this.raf = 0
    }
  }

  setProgress(p, immediate = false) {
    this.target = clamp(p)
    if (immediate) {
      this.progress = this.target
      this.frameOnce()
    } else this.invalidate()
  }

  setActive(i) {
    this.pillars.forEach((p) => (p.actTarget = p.i === i ? 1 : 0))
    this.invalidate()
  }

  resize() {
    const w = this.host.clientWidth || 1
    const h = this.host.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.rect = null
    this.width = w
    this.height = h
    const aspect = w / h
    this.camera.aspect = aspect
    const half = THREE.MathUtils.degToRad(this.camera.fov / 2)
    const spanX = (PILLAR_COUNT - 1) * SPACING + SLAB_W + 2.6 // room for rotation and the riffle
    const spanY = 10 // tallest pillar plus its heading
    this.dist = Math.max(spanX / 2 / (Math.tan(half) * aspect), spanY / 2 / Math.tan(half))
    this.camera.updateProjectionMatrix()
    this.pillars.forEach((p) => (p.drawn.e = -1))
    this.frameOnce()
  }

  invalidate() {
    if (this.raf || !this.visible || this.disposed) return
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  tick = (now) => {
    this.raf = 0
    const dt = clamp((now - this.last) / 1000, 0, 0.05)
    this.last = now
    if (this.step(dt)) this.raf = requestAnimationFrame(this.tick)
  }

  frameOnce() {
    if (!this.disposed) this.step(0.016, true)
  }

  /** Advances the state and draws. Returns true while anything is still moving. */
  step(dt, force = false) {
    const k = (rate) => 1 - Math.exp(-dt * rate)
    let busy = false
    this.elapsed += dt

    const dp = this.target - this.progress
    if (Math.abs(dp) > 0.0002) {
      this.progress += dp * k(16)
      busy = true
    } else this.progress = this.target

    const dx = this.pointer.x - this.pointerSmooth.x
    const dy = this.pointer.y - this.pointerSmooth.y
    if (Math.abs(dx) + Math.abs(dy) > 0.001) {
      this.pointerSmooth.x += dx * k(5)
      this.pointerSmooth.y += dy * k(5)
      busy = true
    }
    const p = this.progress

    const cy = 3.6
    this.camera.position.set(
      this.pointerSmooth.x * 1.0,
      cy + this.dist * 0.26 + this.pointerSmooth.y * 0.5,
      this.dist * 0.96,
    )
    this.camera.lookAt(0, cy, 0)
    this.group.rotation.y = THREE.MathUtils.lerp(-0.4, 0.1, p) + this.pointerSmooth.x * 0.1
    this.scene.updateMatrixWorld(true)

    for (const P of this.pillars) {
      const t = clamp((p - P.i * DROP_STEP) / DROP_LEN)
      const e = 1 - Math.pow(1 - t, 3.2)
      P.e = e
      if (!P.landed && t >= 1) {
        P.landed = true
        P.impact = 1
      } else if (P.landed && t < 0.98) P.landed = false

      P.impact = P.impact > 0.003 ? P.impact * Math.exp(-dt * 3.4) : 0
      const hd = P.hoverTarget - P.hover
      if (Math.abs(hd) > 0.002) P.hover += hd * k(9)
      else P.hover = P.hoverTarget
      const yd = P.hoverYTarget - P.hoverY
      if (Math.abs(yd) > 0.002) P.hoverY += yd * k(14)
      else P.hoverY = P.hoverYTarget
      const ad = P.actTarget - P.act
      if (Math.abs(ad) > 0.002) P.act += ad * k(7)
      else P.act = P.actTarget

      if (P.impact > 0 || Math.abs(hd) > 0.002 || Math.abs(ad) > 0.002 || (P.hover > 0.01 && Math.abs(yd) > 0.002)) busy = true

      this.drawPillar(P, force)
    }

    this.placeLabels()
    this.renderer.render(this.scene, this.camera)
    return busy
  }

  drawPillar(P, force) {
    const d = P.drawn
    const geometryChanged =
      force ||
      d.e !== P.e ||
      d.hover !== P.hover ||
      (P.hover > 0.01 && d.hoverY !== P.hoverY) ||
      d.impact !== P.impact
    const colourChanged = force || d.act !== P.act || d.hoverC !== P.hover

    P.mesh.visible = P.e > 0.004
    if (geometryChanged) {
      d.e = P.e
      d.hover = P.hover
      d.hoverY = P.hoverY
      d.impact = P.impact
      const o = this.dummy
      const th = P.H / SLABS
      const fall = 1 - P.e
      const time = this.elapsed
      for (let j = 0; j < SLABS; j++) {
        const s = P.slabs[j]
        const u = j / (SLABS - 1)
        let y = j * th + th / 2 + fall * (FALL + j * 0.12)
        if (P.impact > 0) y += P.impact * Math.sin(u * 10 - time * 16) * 0.05 * u
        let px = P.x + s.jx + fall * s.scatX * 1.0
        const pz = s.jz + fall * s.scatZ * 0.7
        let ry = s.rot + fall * s.spin * 1.2
        if (P.hover > 0.002) {
          const g = P.hover * Math.exp(-(((y - P.hoverY) / 0.55) ** 2))
          px += g * (j % 2 ? 0.62 : 0.4)
          ry += g * 0.1 * (j % 2 ? -1 : 1)
        }
        o.position.set(px, y, pz)
        o.rotation.set(fall * s.scatZ * 0.28, ry, fall * s.scatX * 0.22)
        o.scale.set(SLAB_W, th * 0.84, SLAB_D)
        o.updateMatrix()
        P.mesh.setMatrixAt(j, o.matrix)
      }
      P.mesh.instanceMatrix.needsUpdate = true
    }

    if (colourChanged) {
      d.act = P.act
      d.hoverC = P.hover
      const arr = P.mesh.instanceColor.array
      const c = this.tmp
      for (let j = 0; j < SLABS; j++) {
        const odd = j % 2
        c.copy(odd ? IDLE_B : IDLE_A)
        if (P.hover > 0.01) c.lerp(LIFT, P.hover * 0.45 * (1 - P.act))
        if (P.act > 0.001) c.lerp(odd ? ON_B : ON_A, P.act)
        arr[j * 3] = c.r
        arr[j * 3 + 1] = c.g
        arr[j * 3 + 2] = c.b
      }
      P.mesh.instanceColor.needsUpdate = true
    }
  }

  /** Pins each heading above its pillar's top, riding down with it as it falls. */
  placeLabels() {
    if (!this.labels.length) return
    const w = this.width
    const h = this.height
    for (const P of this.pillars) {
      const el = this.labels[P.i]
      if (!el) continue
      const fall = 1 - P.e
      const top = P.H + fall * (FALL + (SLABS - 1) * 0.12) + LABEL_GAP
      this.v.set(P.x, top, 0).applyMatrix4(this.group.matrixWorld).project(this.camera)
      const x = (this.v.x * 0.5 + 0.5) * w
      const y = Math.max(40, (-this.v.y * 0.5 + 0.5) * h)
      const o = smooth(0.4, 0.95, P.e)
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
      el.style.opacity = o.toFixed(3)
      el.style.pointerEvents = o > 0.9 ? 'auto' : 'none'
    }
  }

  dispose() {
    this.disposed = true
    if (this.raf) cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    this.canvas.removeEventListener('pointerenter', this.onEnter)
    this.canvas.removeEventListener('pointermove', this.onMove)
    this.canvas.removeEventListener('pointerleave', this.onLeave)
    this.canvas.removeEventListener('click', this.onClick)
    this.slabGeo.dispose()
    this.hitGeo.dispose()
    this.slabMat.dispose()
    this.hitMat.dispose()
    this.pillars.forEach((p) => p.mesh.dispose())
    this.renderer.dispose()
    this.canvas.remove()
  }
}
