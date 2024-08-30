import { getBreakoutRooms } from './breakoutRooms'
import { setMessageOverlay } from './messageOverlay'
import { getPlugin } from './plugin'

export const createInputMessageForm = async (
  roomId: string,
  currentMessage: string,
  roomName?: string
): Promise<void> => {
  const plugin = getPlugin()

  const messageName =
    roomName != null ? `"${roomName}" message` : 'Room message'

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

  form.onInput.add((result): void => {
    handleSubmitMessage(form, roomId, result)
  })
}

const handleSubmitMessage = (
  form: any,
  roomId: string,
  result: {
    message: string
  }
): void => {
  form?.remove()
  if (roomId === '') {
    setMessageOverlay('main', result.message).catch(console.error)
    const breakoutRooms = getBreakoutRooms()
    breakoutRooms.forEach((_breakoutName, breakoutUuid) => {
      setMessageOverlay(breakoutUuid, result.message).catch(console.error)
    })
  } else {
    setMessageOverlay(roomId, result.message).catch(console.error)
  }
}
