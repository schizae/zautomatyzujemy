import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../components/voice/use-voice-call.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

// Exercise the hook's session lifecycle without a DOM, microphone, network or paid call.
function mountVoice() {
  const slots = []
  const sessions = []
  let cursor = 0
  const timers = new Map()
  const exports = {}
  class FakeVapi {
    handlers = new Map()
    messages = []
    stopped = false
    constructor() { sessions.push(this) }
    on(event, handler) { this.handlers.set(event, handler) }
    emit(event) { this.handlers.get(event)?.() }
    async start(assistantId) { this.assistantId = assistantId }
    send(message) { this.messages.push(JSON.parse(JSON.stringify(message))) }
    async stop() { this.stopped = true }
    removeAllListeners() { this.handlers.clear() }
  }
  const react = {
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = initial
      return [slots[index], next => { slots[index] = typeof next === 'function' ? next(slots[index]) : next }]
    },
    useRef(initial) {
      const index = cursor++
      return slots[index] ??= { current: initial }
    },
    useCallback: callback => callback,
    useEffect: () => {},
  }
  runInNewContext(compiled, {
    exports,
    require: name => {
      if (name === 'react') return react
      if (name === '@vapi-ai/web') return { __esModule: true, default: FakeVapi }
      throw new Error(`Unexpected import: ${name}`)
    },
    navigator: { mediaDevices: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) } },
    fetch: async () => ({ ok: true, json: async () => ({ token: 'test', assistantId: 'klara' }) }),
    setTimeout: callback => { const id = timers.size + 1; timers.set(id, callback); return id },
    clearTimeout: id => timers.delete(id),
  })
  return {
    sessions,
    timeout() { for (const callback of [...timers.values()]) callback() },
    render() { cursor = 0; return exports.useVoiceCall('/test-token') },
  }
}

test('sends the idea once as user context only after the new call starts', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Potrzebuję automatyzacji faktur')
  const session = mounted.sessions[0]
  assert.equal(session.assistantId, 'klara')
  assert.deepEqual(session.messages, [])
  session.emit('call-start')
  session.emit('call-start')
  assert.deepEqual(session.messages, [{
    type: 'add-message',
    message: { role: 'user', content: 'Potrzebuję automatyzacji faktur' },
    triggerResponseEnabled: false,
  }])
  assert.equal(mounted.render().status, 'active')
})

test('start without context preserves existing voice behavior', async () => {
  const mounted = mountVoice()
  await mounted.render().start()
  mounted.sessions[0].emit('call-start')
  assert.deepEqual(mounted.sessions[0].messages, [])
  assert.equal(mounted.render().status, 'active')
})

test('cancelled session cannot send its idea through a late start event', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Stary pomysł')
  const session = mounted.sessions[0]
  const lateStart = session.handlers.get('call-start')
  mounted.render().stop()
  lateStart()
  assert.deepEqual(session.messages, [])
  assert.equal(mounted.render().status, 'idle')
})

test('active call is not restarted or given a changed idea', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Pierwszy pomysł')
  mounted.sessions[0].emit('call-start')
  await mounted.render().start('Zmieniony pomysł')
  assert.equal(mounted.sessions.length, 1)
  assert.equal(mounted.sessions[0].messages.length, 1)
})

test('connecting call is not replaced while waiting for the SDK call-start event', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Pierwszy pomysł')
  await mounted.render().start('Drugi pomysł')
  assert.equal(mounted.sessions.length, 1)
})

test('a new call after stopping receives only the current idea', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Pierwszy pomysł')
  mounted.sessions[0].emit('call-start')
  mounted.render().stop()
  await mounted.render().start('Drugi pomysł')
  mounted.sessions[1].emit('call-start')
  assert.equal(mounted.sessions[1].messages.length, 1)
  assert.equal(mounted.sessions[1].messages[0].message.content, 'Drugi pomysł')
})

test('context transport exception closes the call and exposes an error', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Pomysł z formularza')
  const session = mounted.sessions[0]
  session.send = () => { throw new Error('Transport failed') }
  session.emit('call-start')
  assert.equal(mounted.render().status, 'error')
  assert.equal(session.stopped, true)
})

test('timeout closes the session and ignores its late start event', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Stary pomysł')
  const session = mounted.sessions[0]
  const lateStart = session.handlers.get('call-start')
  mounted.timeout()
  lateStart()
  assert.equal(session.stopped, true)
  assert.deepEqual(session.messages, [])
  assert.equal(mounted.render().status, 'error')
})

test('retry waits for timed-out session cleanup before creating another session', async () => {
  const mounted = mountVoice()
  await mounted.render().start('Stary pomysł')
  const session = mounted.sessions[0]
  let finishCleanup
  session.stop = () => new Promise(resolve => { finishCleanup = () => { session.stopped = true; resolve() } })
  mounted.timeout()
  const retry = mounted.render().start('Nowy pomysł')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(mounted.sessions.length, 1)
  finishCleanup()
  await retry
  assert.equal(session.stopped, true)
  assert.equal(session.handlers.size, 0)
  mounted.sessions[1].emit('call-start')
  assert.equal(mounted.sessions[1].messages[0].message.content, 'Nowy pomysł')
})
