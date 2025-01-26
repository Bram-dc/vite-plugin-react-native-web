import type { Plugin as VitePlugin } from 'vite'

// biome-ignore lint/complexity/noBannedTypes: Empty type for now
export type ViteReactNativeWebOptions = {}

export default function reactNativeWeb(options?: ViteReactNativeWebOptions): VitePlugin
