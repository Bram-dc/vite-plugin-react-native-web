import type { RolldownPlugin } from 'rolldown'

export const typeExportsFixPlugin = (): RolldownPlugin => ({
	name: 'type-exports-fix',
	load: {
		filter: { id: /expo-modules-core.*ts-declarations.*\.ts$/ },
		handler: () => ({
			code: 'export {}', moduleType: 'js'
		}),
	},
})
