import flowRemoveTypes from 'flow-remove-types'
import type { RolldownPlugin, SourceMap } from 'rolldown'
import type { Plugin as VitePlugin } from 'vite'
import { transformWithEsbuild } from 'vite'

import type { ViteReactNativeWebOptions } from '../types'

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

const reactNativeFlowJsxPathPattern = /\.(js|flow)$/
const reactNativeFlowJsxLoader = 'jsx'

const flowPragmaPattern = /@flow\b/

const rolldownPlugin = (): RolldownPlugin => ({
	name: 'react-native-web',
	transform: {
		filter: {
			id: reactNativeFlowJsxPathPattern,
			code: flowPragmaPattern,
		},
		handler: async (code, id) => {
			let map: SourceMap | null = null

			const transformed = flowRemoveTypes(code)
			code = transformed.toString()
			map = {
				file: id,
				toUrl: () => id,
				sourcesContent: [code],
				...transformed.generateMap(),
			}

			const result = await transformWithEsbuild(code, id, {
				loader: reactNativeFlowJsxLoader,
				jsx: 'automatic',
			})
			code = result.code
			map = result.map

			return { code, map }
		},
	},
})

const reactNativeWeb = (options?: ViteReactNativeWebOptions): VitePlugin => ({
	enforce: 'pre',
	name: 'react-native-web',

	config: () => ({
		define: {
			global: 'globalThis',
			__DEV__: JSON.stringify(development),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
			'process.env.EXPO_OS': JSON.stringify('web'),
		},
		build: {
			commonjsOptions: {
				extensions,
				transformMixedEsModules: true,
			},
			rollupOptions: options?.enableExpoManualChunk
				? {
					output: {
						manualChunks(id) {
							if (id.includes('expo-modules-core')) {
								return 'expo-modules-core'
							}
						},

						entryFileNames: (chunk) => {
							if (chunk.name === 'expo-modules-core') {
								return '0-expo-modules-core.js'
							}
							return '[name].js'
						},
					},
				}
				: undefined,
		},
		resolve: {
			extensions,
			alias: [{ find: 'react-native', replacement: 'react-native-web' }],
		},
		optimizeDeps: {
			rolldownOptions: {
				plugins: [rolldownPlugin()],
				resolveExtensions: extensions,
			},
		},
	}),

	async transform(code, id) {
		id = id.split('?')[0]

		if (!reactNativeFlowJsxPathPattern.test(id)) {
			return
		}

		let map: SourceMap | null = null

		const transformed = flowRemoveTypes(code)
		code = transformed.toString()
		map = {
			file: id,
			toUrl: () => id,
			sourcesContent: [code],
			...transformed.generateMap(),
		}

		const result = await transformWithEsbuild(code, id, {
			loader: reactNativeFlowJsxLoader,
			jsx: 'automatic',
		})
		code = result.code
		map = result.map

		return { code, map }
	},
})

export default reactNativeWeb
