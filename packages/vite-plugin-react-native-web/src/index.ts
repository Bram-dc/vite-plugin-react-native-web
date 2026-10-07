import path from 'node:path'
import flowRemoveTypes from 'flow-remove-types'
import type { TreeshakingOptions } from 'rolldown'
import { type EnvironmentOptions, searchForWorkspaceRoot, transformWithOxc, type Plugin as VitePlugin } from 'vite'
import { crawlFrameworkPkgs } from 'vitefu'
import type { ViteReactNativeWebOptions } from '../types'
import { flowRemoveTypesPlugin } from './plugins/flow-remove-types-plugin'
import { treeshakeFixPlugin } from './plugins/treeshake-fix-plugin'

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
	'.ts': 'ts',
	'.mts': 'ts',
	'.cts': 'ts',
	'.tsx': 'tsx',
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

const reactNativeWebDependencies = [
	'inline-style-prefixer/lib/createPrefixer',
	'inline-style-prefixer/lib/plugins/crossFade',
	'inline-style-prefixer/lib/plugins/imageSet',
	'inline-style-prefixer/lib/plugins/logical',
	'inline-style-prefixer/lib/plugins/position',
	'inline-style-prefixer/lib/plugins/sizing',
	'inline-style-prefixer/lib/plugins/transition',
].map((dependency) => `react-native-web > ${dependency}`)

const optimizeDepsInclude = ['react-native-web', ...reactNativeWebDependencies]

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

const dependencyScript = /\/node_modules\/(?!\.vite\/).+\.m?js(?:\?.*)?$/

const rolldownOptions = () => ({
	resolve: { extensions },
	shimMissingExports: true,
	treeshake: treeshakePreset,
	moduleTypes,
	plugins: [flowRemoveTypesPlugin(), treeshakeFixPlugin()],
})

const isServerEnvironment = (name: string, config: EnvironmentOptions) =>
	(config.consumer ?? (name === 'client' ? 'client' : 'server')) === 'server'

const dependsOnReactNative = (pkgJson: Record<string, Record<string, string> | undefined>) =>
	['react-native', 'react-native-web'].some(
		(name) => pkgJson.dependencies?.[name] !== undefined || pkgJson.peerDependencies?.[name] !== undefined,
	)

const reactNativeWeb = (_options?: ViteReactNativeWebOptions): VitePlugin => {
	let root = process.cwd()
	let reactNativePackages: Promise<string[]> | undefined

	const findReactNativePackages = (isBuild: boolean) => {
		reactNativePackages ??= crawlFrameworkPkgs({
			root,
			isBuild,
			workspaceRoot: searchForWorkspaceRoot(root),
			isSemiFrameworkPkgByJson: dependsOnReactNative,
		}).then(({ ssr }) => ssr.noExternal)

		return reactNativePackages
	}

	return {
		enforce: 'pre',
		name: 'react-native-web',

		config: (config, env) => {
			root = path.resolve(config.root ?? '')

			return {
				define: {
					global: 'globalThis',
					__DEV__: JSON.stringify(env.mode === 'development'),
					'process.env.NODE_ENV': JSON.stringify(env.mode === 'development' ? 'development' : 'production'),
					'process.env.EXPO_OS': JSON.stringify('web'),
				},
				resolve: {
					extensions,
					alias: [{ find: 'react-native', replacement: 'react-native-web' }],
					dedupe: ['react-native-web'],
				},
				build: {
					rolldownOptions: {
						...rolldownOptions(),
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
					rolldownOptions: rolldownOptions(),
				},
			}
		},

		configEnvironment: async (name, config, env) => {
			if (!isServerEnvironment(name, config) || config.resolve?.noExternal === true) {
				return
			}

			return {
				resolve: {
					noExternal: [
						'react-native-web',
						'inline-style-prefixer',
						...(await findReactNativePackages(env.command === 'build')),
					],
				},
				optimizeDeps: {
					include: reactNativeWebDependencies,
					rolldownOptions: rolldownOptions(),
				},
			}
		},

		transform: {
			filter: { id: dependencyScript },
			handler(code, id) {
				if (this.environment.mode !== 'dev' || this.environment.config.consumer !== 'server') {
					return
				}

				const source = code.includes('@flow') ? flowRemoveTypes(code).toString() : code

				return transformWithOxc(source, id, { lang: 'jsx', jsx: { runtime: 'automatic' } })
			},
		},
	}
}

export default reactNativeWeb

export { flowRemoveTypesPlugin, reactNativeWeb, treeshakeFixPlugin }
