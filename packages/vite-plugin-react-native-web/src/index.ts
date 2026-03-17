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

const optimizeDepsInclude = [
	'react-native-web',
	'inline-style-prefixer/lib/createPrefixer',
	'inline-style-prefixer/lib/plugins/crossFade',
	'inline-style-prefixer/lib/plugins/imageSet',
	'inline-style-prefixer/lib/plugins/logical',
	'inline-style-prefixer/lib/plugins/position',
	'inline-style-prefixer/lib/plugins/sizing',
	'inline-style-prefixer/lib/plugins/transition',
]

const silencedLogs = [
	{
		code: 'EVAL',
		file: 'expo/src/async-require/fetchThenEvalJs.ts',
	},
	{
		code: 'EVAL',
		file: 'expo-modules-core/src/uuid/index.web.ts',
	},
]

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
				onLog(level, log, defaultHandler) {
					const code = log.code
					const file = log.loc?.file
					if (
						code &&
						file &&
						silencedLogs.some((silencedLog) => code === silencedLog.code && file.includes(silencedLog.file))
					) {
						return
					}

					defaultHandler(level, log)
				},
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
