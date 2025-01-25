import { transformWithEsbuild } from 'vite'
import flowRemoveTypes from 'flow-remove-types'
import fs from 'node:fs/promises'

import type { Plugin as VitePlugin } from 'vite'
import type { Plugin as ESBuildPlugin } from 'esbuild'
import type { SourceMap } from 'rollup'
// import type { ViteReactNativeWebOptions } from '../types'

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

const scriptPathPattern = /\.(js|jsx|ts|tsx|flow)$/
const nativeLegacyScriptPathPattern = /\.(js|flow)$/

const flowPragmaPattern = /@flow\b/
const useClientPragmaPattern = /['"]use client['"]/

const jsxElementPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>([\s\S]*?)<\/\1>/
const jsxSelfClosingPattern = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*\/?>/
const jsxFragmentPattern = /<>([\s\S]*?)<\/>/

const loaders = {
	'.js': 'jsx',
	'.flow': 'jsx',
} as const

const getLoader = (path: string) => {
	const ext = `.${path.split('.').pop()}`

    if (ext in loaders) {
        return loaders[ext as keyof typeof loaders]
    }

    return 'default' as const
}

const esbuildPlugin = (): ESBuildPlugin => ({
	name: 'react-native-web',
	setup: (build) => {
		// We need to manually resolve .web files since the resolveExtensions option does not seem to work properly.
		build.onLoad({ filter: scriptPathPattern }, async (args) => {
			let path = args.path

			const webPath = args.path.replace(/(\.[^/.]+)$/, '.web$1')
			try {
				await fs.access(webPath)
				path = webPath
			} catch {}

			let contents = await fs.readFile(path, 'utf-8')
			const loader = getLoader(path)

			if (nativeLegacyScriptPathPattern.test(path) && flowPragmaPattern.test(contents)) {
				contents = flowRemoveTypes(contents).toString()
			}

			return {
				contents,
				loader,
			}
		})
	},
})

const reactNativeWeb = (/*options: ViteReactNativeWebOptions = {}*/): VitePlugin => ({
	enforce: 'pre',
	name: 'react-native-web',

	config: () => ({
		define: {
			global: 'self',
			__DEV__: JSON.stringify(development),
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		},
		resolve: {
			extensions,
			alias: [{ find: 'react-native', replacement: 'react-native-web' }],
		},
		optimizeDeps: {
			esbuildOptions: {
				plugins: [esbuildPlugin()],
				resolveExtensions: extensions,
			},
		},
	}),

	async transform(code, id) {
		id = id.split('?')[0]

		if (!nativeLegacyScriptPathPattern.test(id)) {
			return
		}

		if (flowPragmaPattern.test(code)) {
			code = flowRemoveTypes(code).toString()
		}

		let map: SourceMap | null = null

		if (jsxElementPattern.test(code) || jsxSelfClosingPattern.test(code) || jsxFragmentPattern.test(code)) {
			const loader = getLoader(id)

			const result = await transformWithEsbuild(code, id, {
				loader,
				tsconfigRaw: {
					compilerOptions: {
						jsx: 'react-jsx',
					},
				},
			})

			code = result.code
			map = result.map

			// Do not include source maps for files that are using 'use client' pragma since these break the esbuild mappings (https://github.com/vitejs/vite/issues/15012)
			if (useClientPragmaPattern.test(code)) {
				map = null
			}
		}

		return { code, map }
	},
})

export default reactNativeWeb
