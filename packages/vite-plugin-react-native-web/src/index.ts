import type { TreeshakingOptions } from 'rolldown'
import type { Plugin as VitePlugin } from 'vite'
import type { ViteReactNativeWebOptions } from '../types'
import { flowRemoveTypesPlugin } from './plugins/flow-remove-types-plugin'
import { treeshakeFixPlugin } from './plugins/treeshake-fix-plugin'

const development = process.env.NODE_ENV === 'development'

const extensions = [
	'.web.mjs',
	'.mjs',
	'.web.js',
	'.js',
	'.web.mts',
	'.mts',
	'.web.ts',
	'.ts',
	'.web.jsx',
	'.jsx',
	'.web.tsx',
	'.tsx',
	'.json',
]

const moduleTypes = {
	'.js': 'jsx',
	'.mjs': 'jsx',
	'.cjs': 'jsx',
	'.flow': 'jsx',
} as const

const treeshakePreset = {
	annotations: true,
	invalidImportSideEffects: true,
	manualPureFunctions: [],
	moduleSideEffects: true,
	propertyReadSideEffects: 'always',
	unknownGlobalSideEffects: true,
	propertyWriteSideEffects: 'always',
} satisfies TreeshakingOptions

const optimizeDepsInclude = ['react-native-web']

const reactNativeWeb = (_options?: ViteReactNativeWebOptions): VitePlugin => ({
	enforce: 'pre',
	name: 'react-native-web',

	config: () => ({
		define: {
			global: 'globalThis',
			__DEV__: JSON.stringify(development),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.EXPO_OS': JSON.stringify('web'),
		},
		resolve: {
			extensions,
			alias: [{ find: 'react-native', replacement: 'react-native-web' }],
		},
		build: {
			rolldownOptions: {
				resolve: { extensions },
				shimMissingExports: true,
				treeshake: treeshakePreset,
				moduleTypes,
				plugins: [flowRemoveTypesPlugin(), treeshakeFixPlugin()],
			},
		},
		optimizeDeps: {
			include: optimizeDepsInclude,
			rolldownOptions: {
				resolve: { extensions },
				shimMissingExports: true,
				treeshake: treeshakePreset,
				moduleTypes,
				plugins: [flowRemoveTypesPlugin(), treeshakeFixPlugin()],
			},
		},
	}),
})

export default reactNativeWeb

export { flowRemoveTypesPlugin, reactNativeWeb, treeshakeFixPlugin }
