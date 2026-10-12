import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'prompt-enhancer',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 10,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 10 },
  },
} as const

// The engine draws an empty band on its own.
const emptyBand = (on: Parameters<Parameters<typeof test>[1]>[1]) =>
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => $.ui.resolve(e).Box({ children: [] }))

const answered = (text: string) => ({
  value: { isAnswered: true, text, usage: { input_tokens: 1, output_tokens: 1 } },
})

test('the band shows Enhance and Enhance & send at once on every surface', async ($, on) => {
  emptyBand(on)
  on('model.complete', () => answered('Clear prompt.'))
  on('prompt.read', () => ({ value: { text: 'vague prompt', cursor: 12 } }))
  let filled = ''
  on('prompt.fill', (_$, e) => {
    filled = e.text
    return { isFilled: true }
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await ui.find({ key: 'enhance' })).toBeDefined()
    expect(await ui.find({ key: 'enhance-send' })).toBeDefined()
    expect(await ui.find({ key: 'open' })).toBeUndefined()

    await ui.press({ key: 'enhance' })
    expect(filled).toBe('Clear prompt.')
    expect(await ui.find({ key: 'enhance' })).toBeDefined()
    await ui.unmount()
  }
})

test('the band keeps what other plugins draw beneath it, idle and busy', async ($, on) => {
  on('ui.render', { component: 'AbovePrompt' }, (_$, e) => {
    const { Box, Text } = _$.ui.resolve(e)
    return Box({ key: 'beneath', children: [Text({ children: ['cache-tax · warm'] })] })
  })
  let release = () => {}
  on('model.complete', () => new Promise(resolve => {
    release = () => resolve(answered('Clear prompt.'))
  }))
  on('prompt.read', () => ({ value: { text: 'vague prompt', cursor: 12 } }))
  on('prompt.fill', () => ({ isFilled: true }))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    expect(await ui.find({ key: 'beneath' })).toBeDefined()
    expect(await ui.find({ key: 'enhance' })).toBeDefined()

    const pressing = ui.press({ key: 'enhance' })
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(await ui.find({ key: 'beneath' })).toBeDefined()
    release()
    await pressing
    await ui.unmount()
  }
})

test('Enhance & send submits the rewritten prompt and clears the box', async ($, on) => {
  emptyBand(on)
  on('model.complete', () => answered('Clear prompt.'))
  on('prompt.read', () => ({ value: { text: 'vague prompt', cursor: 12 } }))
  let box = 'vague prompt'
  on('prompt.fill', (_$, e) => {
    box = e.text
    return { isFilled: true }
  })
  let submitted = ''
  on('prompt.submit', (_$, e) => {
    submitted = e.text
    return { text: e.text }
  })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await ui.press({ key: 'enhance-send' })

  expect(submitted).toBe('Clear prompt.')
  expect(box).toBe('')
})

test('an empty box is not sent to the model', async ($, on) => {
  emptyBand(on)
  let isCalled = false
  on('model.complete', () => {
    isCalled = true
    return answered('x')
  })
  on('prompt.read', () => ({ value: { text: '  ', cursor: 0 } }))

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await ui.press({ key: 'enhance' })

  expect(isCalled).toBe(false)
})
