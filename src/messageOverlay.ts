import { plugin } from './plugin'

interface ConferenceWithSendRequest {
  sendRequest: (
    request: unknown
  ) => Promise<{ data: { result: { text?: string } } | null }>
}

export const getMessageOverlay = async (roomId: string): Promise<string> => {
  let path = 'get_message_text'
  if (roomId !== 'main') {
    path = `breakouts/${roomId}/${path}`
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `plugin.conference` is typed as `any`
  const conference = plugin?.conference as unknown as ConferenceWithSendRequest
  const response = await conference.sendRequest({
    method: 'GET',
    path
  })

  return response.data?.result.text ?? ''
}

export const setMessageOverlay = async (
  roomId: string,
  text: string
): Promise<void> => {
  let path = 'set_message_text'
  if (roomId !== 'main') {
    path = `breakouts/${roomId}/${path}`
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `plugin.conference` is typed as `any`
  const conference = plugin?.conference as unknown as ConferenceWithSendRequest
  await conference.sendRequest({
    method: 'POST',
    path,
    payload: { text }
  })
}
