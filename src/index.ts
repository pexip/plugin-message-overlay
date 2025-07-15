import { type Button, registerPlugin } from '@pexip/plugin-api'
import { createSelectRoomForm } from './forms/createSelectRoomForm'
import { getMessageOverlay } from './messageOverlay'
import { createInputMessageForm } from './forms/createInputMessageForm'
import { setPlugin } from './plugin'
import { logger } from './logger'

const version = 1

const plugin = await registerPlugin({
  id: 'message-overlay',
  version
})

setPlugin(plugin)

let button: Button<'settingsMenu'> | null = null
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

const addButton = async (): Promise<void> => {
  if (button != null || creatingButton) {
    return
  }
  try {
    creatingButton = true
    button = await plugin.ui.addButton({
      position: 'settingsMenu',
      label: 'Set message overlay',
      inMeetingOnly: true,
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
