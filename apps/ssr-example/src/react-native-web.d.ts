import type { ReactElement } from 'react'

declare module 'react-native' {
	namespace AppRegistry {
		function getApplication(
			appKey: string,
			appParameters?: { initialProps?: object },
		): { element: ReactElement; getStyleElement: () => ReactElement }
	}
}
