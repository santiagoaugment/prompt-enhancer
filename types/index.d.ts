export type PromptEnhancerState = { isBusy: boolean }

declare module 'claude-code' {
  interface PluginState {
    'prompt-enhancer': { isBusy: boolean }
  }
}
