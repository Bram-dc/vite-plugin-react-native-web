import flowRemoveTypes from 'flow-remove-types'
import type { RolldownPlugin } from 'rolldown'
import { transformWithOxc, type Plugin as VitePlugin } from 'vite'

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

// const flowPragmaPattern = /@flow\b/

const rolldownPlugin = (): RolldownPlugin => ({
	name: 'react-native-web',
	transform: {
		filter: {
			id: reactNativeFlowJsxPathPattern,
			// code: flowPragmaPattern,
		},
		handler: async (code, id) => {
			const transformed = flowRemoveTypes(code)
			code = transformed.toString()

			const result = await transformWithOxc(code, id, {
				lang: 'tsx',
				// loader: reactNativeFlowJsxLoader,
				// jsx: 'automatic',
			})

			return {
				...result,
				moduleType: 'tsx',
			}
		},
	},
})

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
		build: {
			rolldownOptions: {
				plugins: [rolldownPlugin()],
				resolve: {
					extensions,
				},
			},
		},
		resolve: {
			extensions,
			alias: [{ find: 'react-native', replacement: 'react-native-web' }],
		},
		optimizeDeps: {
			rolldownOptions: {
				plugins: [rolldownPlugin()],
				resolve: {
					extensions,
				},
			},
		},
	}),
})

export default reactNativeWeb
