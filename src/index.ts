import { type Button, registerPlugin } from '@pexip/plugin-api'

const plugin = await registerPlugin({
  id: 'message-overlay',
  version: 0
})

let button: Button<'settingsMenu'> | null = null
let creatingButton = false

plugin.events.conferenceStatus.add(async ({ id, status }) => {
  if (id === 'main' && !status.directMedia && status.started) {
    await addButton()
  } else {
    await removeButton()
  }
})

const addButton = async (): Promise<void> => {
  console.log('addButton')
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
    console.error(e)
  }

  creatingButton = false
}

const removeButton = async (): Promise<void> => {
  await button?.remove()
  button = null
}

const handleClickButton = async (): Promise<void> => {
  let currentMessage = ''
  try {
    currentMessage = await getMessageOverlay()
    console.log(currentMessage)
  } catch (e) {
    console.error(e)
  }
  await createForm(currentMessage)
}

const createForm = async (currentMessage: string): Promise<void> => {
  const form = await plugin.ui.addForm({
    title: 'Set message overlay',
    description:
      'Write your message overlay text below. If you would like to get a new line press enter or make a new line in the textarea',
    form: {
      elements: {
        message: {
          name: 'Enter text',
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
    handleFormSubmit(form, result).catch((e) => {
      console.error(e)
    })
  })
}

const handleFormSubmit = async (
  form: any,
  result: {
    message: string
  }
): Promise<void> => {
  form?.remove()
  await setMessageOverlay(result.message)
}

const getMessageOverlay = async (): Promise<string> => {
  const response = await (plugin.conference as any).sendRequest({
    method: 'GET',
    path: 'get_message_text'
  })
  console.log(response)
  return response.data.result.text ?? ''
}

const setMessageOverlay = async (text: string): Promise<void> => {
  await (plugin.conference as any).sendRequest({
    method: 'POST',
    path: 'set_message_text',
    payload: { text }
  })
}
