import flowRemoveTypes from 'flow-remove-types'
import type { RolldownPlugin } from 'rolldown'

const reactNativeFlowJsxPathPattern = /\.(js|flow)$/

export const flowRemoveTypesPlugin = (): RolldownPlugin => ({
	name: 'flow-remove-types',
	transform: {
		filter: {
			id: reactNativeFlowJsxPathPattern,
		},
		handler: async (code) => {
			const transformed = flowRemoveTypes(code)
			code = transformed.toString()

			return code
		},
	},
})
