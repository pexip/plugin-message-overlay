import { createInputMessageForm } from './createInputMessageForm'
import { getMessageOverlay } from '../messageOverlay'
import { plugin } from '../plugin'

export const createSelectRoomForm = async (
  breakoutRooms: Map<string, string>
): Promise<void> => {
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

  form.onInput.add(async (result): Promise<void> => {
    await form.remove()

    if (result.room == null) {
      return
    }

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
  })
}
