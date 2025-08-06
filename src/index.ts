import { type Button, registerPlugin } from '@pexip/plugin-api'
import { createSelectRoomForm } from './forms/createSelectRoomForm'
import { getMessageOverlay } from './messageOverlay'
import { createInputMessageForm } from './forms/createInputMessageForm'
import { setPlugin } from './plugin'
import { logger } from './logger'
import { i18next } from './i18n'

const version = 1

const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(50, 50, 50)"><path d="M240-320h320v-80H240v80Zm400 0h80v-80h-80v80ZM240-480h80v-80h-80v80Zm160 0h320v-80H400v80ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/></svg>'

const plugin = await registerPlugin({
  id: 'message-overlay',
  version
})

setPlugin(plugin)

let button: Button<'toolbar'> | null = null
let creatingButton = false

const breakoutRooms = new Map<string, string>()

plugin.events.authenticatedWithConference.add(() => {
  breakoutRooms.clear()
})

plugin.events.breakoutBegin.add((breakoutRoom) => {
  breakoutRooms.set(breakoutRoom.breakout_uuid, '')
})

plugin.events.breakoutEnd.add((breakoutRoom) => {
  breakoutRooms.delete(breakoutRoom.breakout_uuid)
})

plugin.events.conferenceStatus.add(async ({ id, status }) => {
  if (breakoutRooms.has(id) && status.breakoutName != null) {
    breakoutRooms.set(id, status.breakoutName)
  }

  if (!status.directMedia && status.started) {
    await addButton()
  } else {
    await removeButton()
  }
})

plugin.events.languageSelect.add(async (language) => {
  await i18next.changeLanguage(language).catch(logger.error)
  if (button != null) {
    await removeButton()
    await addButton()
  }
})

const addButton = async (): Promise<void> => {
  if (button != null || creatingButton) {
    return
  }
  try {
    creatingButton = true
    button = await plugin.ui.addButton({
      position: 'toolbar',
      tooltip: i18next.t('setMessageOverlay'),
      icon: {
        custom: {
          main: icon,
          hover: icon
        }
      },
      roles: ['chair']
    })
    button.onClick.add(handleClickButton)
  } catch (e) {
    logger.error(e)
  }

  creatingButton = false
}

const removeButton = async (): Promise<void> => {
  await button?.remove()
  button = null
}

const handleClickButton = async (): Promise<void> => {
  const empty = 0
  if (breakoutRooms.size > empty) {
    await createSelectRoomForm(breakoutRooms)
  } else {
    const roomId = 'main'
    let currentMessage = ''

    try {
      currentMessage = await getMessageOverlay(roomId)
    } catch (e) {
      logger.error(e)
    }
    await createInputMessageForm(roomId, currentMessage)
  }
}
