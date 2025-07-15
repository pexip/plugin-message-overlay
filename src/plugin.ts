import type { Plugin } from '@pexip/plugin-api'

export let plugin: Plugin | null = null

export const setPlugin = (p: Plugin): void => {
  plugin = p
}
