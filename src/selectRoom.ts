import { createInputMessageForm } from './inputMessage'
import { getMessageOverlay } from './messageOverlay'
import { getPlugin } from './plugin'

let breakoutRooms = new Map<string, string>()

export const createSelectRoomForm = async (
  breakoutRoomsInfo: Map<string, string>
): Promise<void> => {
  const plugin = getPlugin()
  breakoutRooms = breakoutRoomsInfo

  const form = await plugin.ui.addForm({
    title: 'Set message overlay',
    description: 'Choose the room you want to set the message overlay for.',
    form: {
      elements: {
        room: {
          name: 'Select room',
          type: 'select',
          isOptional: true,
          options: [
            {
              id: '',
              label: 'All rooms'
            },
            {
              id: 'main',
              label: 'Main room'
            },
            ...Array.from(breakoutRooms).map(([roomId, roomName]) => ({
              id: roomId,
              label: roomName
            }))
          ]
        }
      },
      submitBtnTitle: 'Choose'
    }
  })

  form.onInput.add((result): void => {
    handleSubmitRoom(form, result).catch(console.error)
  })
}

const handleSubmitRoom = async (
  form: any,
  result: {
    room: string
  }
): Promise<void> => {
  form?.remove()

  const roomId = result.room
  let currentMessage = ''

  if (roomId !== '') {
    try {
      currentMessage = await getMessageOverlay(result.room)
    } catch (e) {
      console.error(e)
    }
  }

  const roomName =
    roomId === ''
      ? 'All rooms'
      : roomId === 'main'
        ? 'Main room'
        : breakoutRooms.get(roomId)

  await createInputMessageForm(roomId, currentMessage, roomName)
}
