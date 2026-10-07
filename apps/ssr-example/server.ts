import { readFile } from 'node:fs/promises'
import { createServer, type ServerResponse } from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

type Render = (url: string) => { head: string; html: string }

const isProduction = process.argv.includes('--production')
const port = Number(process.env.PORT ?? (isProduction ? 4173 : 5173))
const clientDir = path.resolve('dist/client')

const contentTypes: Record<string, string> = {
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
}

const sendPage = (res: ServerResponse, template: string, render: Render, url: string) => {
	const { head, html } = render(url)

	res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
	res.end(template.replace('<!--app-head-->', head).replace('<!--app-html-->', html))
}

const sendError = (res: ServerResponse, error: unknown) => {
	console.error(error)

	res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
	res.end(error instanceof Error ? error.stack : String(error))
}

const sendFile = async (res: ServerResponse, pathname: string) => {
	const file = path.join(clientDir, pathname)
	if (!file.startsWith(`${clientDir}${path.sep}`) || file.endsWith('.html')) {
		return false
	}

	const body = await readFile(file).catch(() => null)
	if (!body) {
		return false
	}

	res.writeHead(200, {
		'content-type': contentTypes[path.extname(file)] ?? 'application/octet-stream',
		'cache-control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
	})
	res.end(body)

	return true
}

const server = createServer()

if (isProduction) {
	process.env.NODE_ENV = 'production'

	const template = await readFile(path.join(clientDir, 'index.html'), 'utf-8')
	const { render }: { render: Render } = await import(pathToFileURL(path.resolve('dist/server/entry-server.js')).href)

	server.on('request', async (req, res) => {
		const url = req.url ?? '/'

		try {
			if (!(await sendFile(res, new URL(url, 'http://localhost').pathname))) {
				sendPage(res, template, render, url)
			}
		} catch (error) {
			sendError(res, error)
		}
	})
} else {
	const { createServer: createViteServer, isRunnableDevEnvironment } = await import('vite')
	const vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } }, appType: 'custom' })
	const ssr = vite.environments.ssr

	if (!isRunnableDevEnvironment(ssr)) {
		throw new Error('The ssr environment cannot run modules in this process')
	}

	server.on('request', (req, res) => {
		vite.middlewares(req, res, async () => {
			const url = req.url ?? '/'

			try {
				const template = await vite.transformIndexHtml(url, await readFile('index.html', 'utf-8'))
				const { render } = await ssr.runner.import<{ render: Render }>('/src/entry-server.tsx')

				sendPage(res, template, render, url)
			} catch (error) {
				sendError(res, error)
			}
		})
	})
}

server.listen(port, () => console.log(`http://localhost:${port}`))
