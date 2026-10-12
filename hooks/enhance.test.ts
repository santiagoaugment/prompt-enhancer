import { expect, test } from 'claude-code/testing'

test('/enhance puts the rewritten prompt in the box', async ($, on) => {
  let sent = ''
  on('model.complete', (_$, e) => {
    sent = e.prompt
    return {
      value: {
        isAnswered: true,
        text: '  Fix the failing login test in auth.test.ts.  ',
        usage: { input_tokens: 1, output_tokens: 1 },
      },
    }
  })
  let filled = ''
  on('prompt.fill', (_$, e) => {
    filled = e.text
    return { isFilled: true }
  })

  const ran = await $.command.run({ command: 'enhance', args: 'fix the login thing' })

  expect(sent).toContain('<prompt>\nfix the login thing\n</prompt>')
  expect(filled).toBe('Fix the failing login test in auth.test.ts.')
  expect(ran.text).toContain('prompt box')
})

test('/enhance with nothing to enhance says how to use it', async $ => {
  const ran = await $.command.run({ command: 'enhance', args: '   ' })

  expect(ran.text).toContain('Usage')
})

test('/enhance shows the result when the box cannot take it', async ($, on) => {
  on('model.complete', () => ({
    value: {
      isAnswered: true,
      text: 'Clear prompt.',
      usage: { input_tokens: 1, output_tokens: 1 },
    },
  }))
  on('prompt.fill', () => ({ isFilled: false }))

  const ran = await $.command.run({ command: 'enhance', args: 'vague prompt' })

  expect(ran.text).toContain('Clear prompt.')
})
