import { createInputMessageForm } from './createInputMessageForm'
import { getMessageOverlay } from '../messageOverlay'
import { plugin } from '../plugin'
import { logger } from '../logger'
import { i18next } from '../i18n'

export const createSelectRoomForm = async (
  breakoutRooms: Map<string, string>
): Promise<void> => {
  if (plugin == null) {
    throw new Error('Plugin is not initialized.')
  }

  const form = await plugin.ui.addForm({
    title: i18next.t('setMessageOverlay'),
    description: i18next.t('selectRoomForm.description'),
    form: {
      elements: {
        room: {
          name: i18next.t('selectRoom'),
          type: 'select',
          isOptional: true,
          options: [
            {
              id: '',
              label: i18next.t('allRooms')
            },
            {
              id: 'main',
              label: i18next.t('mainRoom')
            },
            ...Array.from(breakoutRooms).map(([roomId, roomName]) => ({
              id: roomId,
              label: roomName
            }))
          ]
        }
      },
      submitBtnTitle: i18next.t('choose')
    }
  })

  form.onInput.add(async (result): Promise<void> => {
    await form.remove()

    const { room: roomId } = result
    let currentMessage = ''

    if (roomId !== '') {
      try {
        currentMessage = await getMessageOverlay(result.room)
      } catch (e) {
        logger.error(e)
      }
    }

    const roomName =
      roomId === ''
        ? i18next.t('allRooms')
        : roomId === 'main'
          ? i18next.t('mainRoom')
          : breakoutRooms.get(roomId)

    await createInputMessageForm(roomId, currentMessage, roomName)
  })
}
