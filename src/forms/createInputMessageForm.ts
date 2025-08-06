import { logger } from '../logger'
import { setMessageOverlay } from '../messageOverlay'
import { plugin } from '../plugin'
import { i18next } from '../i18n'

export const createInputMessageForm = async (
  roomId: string,
  currentMessage: string,
  roomName?: string,
  breakoutRooms?: Map<string, string>
): Promise<void> => {
  const messageName =
    roomName != null
      ? `"${roomName}" ${i18next.t('message')}`
      : i18next.t('roomMessage')

  if (plugin == null) {
    throw new Error('Plugin is not initialized.')
  }

  const form = await plugin.ui.addForm({
    title: i18next.t('setMessageOverlay'),
    description: i18next.t('inputMessageForm.description'),
    form: {
      elements: {
        message: {
          name: messageName,
          type: 'textarea',
          isOptional: true,
          placeholder: i18next.t('enterYourMessage'),
          value: currentMessage
        }
      },
      submitBtnTitle: i18next.t('submit')
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
