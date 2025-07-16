import { logger } from '../logger'
import { setMessageOverlay } from '../messageOverlay'
import { plugin } from '../plugin'

export const createInputMessageForm = async (
  roomId: string,
  currentMessage: string,
  roomName?: string,
  breakoutRooms?: Map<string, string>
): Promise<void> => {
  const messageName =
    roomName != null ? `"${roomName}" message` : 'Room message'

  if (plugin == null) {
    throw new Error('Plugin is not initialized.')
  }

  const form = await plugin.ui.addForm({
    title: 'Set message overlay',
    description:
      'Write your message overlay text below. If you would like to get a new line press enter or make a new line in the textarea',
    form: {
      elements: {
        message: {
          name: messageName,
          type: 'textarea',
          isOptional: true,
          placeholder: 'Enter your message',
          value: currentMessage
        }
      },
      submitBtnTitle: 'Submit'
    }
  })

  form.onInput.add(async (result): Promise<void> => {
    await form.remove()

    if (roomId === '') {
      setMessageOverlay('main', result.message).catch(logger.error)
      breakoutRooms?.forEach((_breakoutName, breakoutUuid) => {
        setMessageOverlay(breakoutUuid, result.message).catch(logger.error)
      })
    } else {
      setMessageOverlay(roomId, result.message).catch(logger.error)
    }
  })
}
