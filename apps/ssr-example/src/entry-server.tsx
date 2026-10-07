import { ServerContainer, type ServerContainerRef } from '@react-navigation/native'
import { createRef } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { AppRegistry } from 'react-native'
import App from './App'

AppRegistry.registerComponent('App', () => App)

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)

export const render = (url: string) => {
	const navigation = createRef<ServerContainerRef>()
	const { element, getStyleElement } = AppRegistry.getApplication('App')

	const html = renderToString(
		<ServerContainer ref={navigation} location={new URL(url, 'http://localhost')}>
			{element}
		</ServerContainer>,
	)

	const title = navigation.current?.getCurrentOptions()?.title ?? 'SSR Example'
	const head = `<title>${escapeHtml(title)}</title>${renderToStaticMarkup(getStyleElement())}`

	return { head, html }
}
