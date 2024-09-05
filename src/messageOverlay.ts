import { plugin } from './plugin'

export const getMessageOverlay = async (roomId: string): Promise<string> => {
  let path = 'get_message_text'
  if (roomId !== 'main') {
    path = `breakouts/${roomId}/${path}`
  }

  const response = await (plugin.conference as any).sendRequest({
    method: 'GET',
    path
  })

  return response.data.result.text ?? ''
}

export const setMessageOverlay = async (
  roomId: string,
  text: string
): Promise<void> => {
  let path = 'set_message_text'
  if (roomId !== 'main') {
    path = `breakouts/${roomId}/${path}`
  }

  ;(plugin.conference as any).sendRequest({
    method: 'POST',
    path,
    payload: { text }
  })
}
