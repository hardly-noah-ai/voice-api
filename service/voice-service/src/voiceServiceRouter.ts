import { FastifyPluginAsync } from 'fastify'
import { container } from 'tsyringe'
import { VoiceServiceAdapter } from './voiceServiceAdapter'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const adapter = container.resolve(VoiceServiceAdapter)


  fastify.get('/health', async function (request, reply) {
    return reply.status(200).send({ message: 'OK' })
  })

  fastify.get('/start-conversation', async function (request, reply) {
    return reply.status(200).send(await adapter.startConversation())
  })
}

export default root
