import type { RolldownPlugin } from 'rolldown'

export const treeshakeFixPlugin = (): RolldownPlugin => ({
	name: 'treeshake-fix',
	transform: {
		filter: {
			id: 'expo-modules-core',
		},
		handler: () => {
			return {
				moduleSideEffects: 'no-treeshake',
			}
		},
	},
})
