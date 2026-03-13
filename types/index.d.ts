import type { Plugin as VitePlugin } from 'vite'

// biome-ignore lint/complexity/noBannedTypes: Future proof
export type ViteReactNativeWebOptions = {}

export default function reactNativeWeb(options?: ViteReactNativeWebOptions): VitePlugin
