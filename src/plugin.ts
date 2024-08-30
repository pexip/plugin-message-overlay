import { type Plugin } from '@pexip/plugin-api'

let plugin: Plugin

export const setPlugin = (p: Plugin): void => {
  plugin = p
}

export const getPlugin = (): Plugin => {
  return plugin
}
