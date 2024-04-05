declare module 'flow-remove-types' {
    export default function flowRemoveTypes(src: string): {
        toString(): string
    }
}