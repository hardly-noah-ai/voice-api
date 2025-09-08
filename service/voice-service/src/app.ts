import "reflect-metadata"
import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { setupContainer } from './setupContainer'
import voiceServiceRouter from './voiceServiceRouter'
import cors from '@fastify/cors'
import mongodbPlugin from './plugins/mongodb'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {

  void setupContainer()

  await fastify.register(mongodbPlugin)

  await fastify.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  void fastify.register(voiceServiceRouter)
}

export default app
export { app, options }
