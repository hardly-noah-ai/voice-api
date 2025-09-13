import { FastifyPluginAsync } from 'fastify'
import { container } from 'tsyringe'
import { VoiceServiceAdapter } from './voiceServiceAdapter'
import {
  ConversationItemParams,
  ConversationParams,
  ConversationItemBody,
  ConversationItemQuery,
  conversationItemParamsSchema,
  conversationParamsSchema,
  conversationItemBodySchema,
  conversationItemQuerySchema,
  QuestionQuery,
  questionQuerySchema,
  CriterionQuery,
  criterionQuerySchema
} from './dto/conversation.dto'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const adapter = container.resolve(VoiceServiceAdapter)


  fastify.get('/health', async function (request, reply) {
    return reply.status(200).send({ message: 'OK' })
  })

  fastify.get('/start-conversation', async function (request, reply) {
    return reply.status(200).send(await adapter.startConversation())
  })

  fastify.post<{
    Params: ConversationItemParams;
    Body: ConversationItemBody;
  }>('/conversation-item/:id', {
    schema: {
      params: conversationItemParamsSchema,
      body: conversationItemBodySchema
    }
  }, async function (request, reply) {
    return reply.status(200).send(await adapter.saveConversationItem(request.params.id, request.body))
  })

  fastify.get<{
    Params: ConversationParams;
  }>('/conversation-items/:id', {
    schema: {
      params: conversationParamsSchema
    }
  }, async function (request, reply) {
    return reply.status(200).send(await adapter.getConversationItems(request.params.id))
  })

  fastify.get<{
    Querystring: ConversationItemQuery;
  }>('/conversation-item', {
    schema: {
      querystring: conversationItemQuerySchema
    }
  }, async function (request, reply) {
    return reply.status(200).send(await adapter.getConversationItem(request.query))
  })

  fastify.get<{
    Querystring: QuestionQuery;
  }>('/next-question', {
    schema: {
      querystring: questionQuerySchema
    }
  }, async function (request, reply) {
    return reply.status(200).send(await adapter.getNextQuestion(request.query.userId))
  })

  fastify.get<{
    Querystring: CriterionQuery;
  }>('/is-criterion-met', {
    schema: {
      querystring: criterionQuerySchema
    }
  }, async function (request, reply) {
    return reply.status(200).send(await adapter.isCriterionMet(request.query.userId, request.query.criterionName))
  })
}

export default root
