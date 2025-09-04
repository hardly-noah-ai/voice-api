import fp from 'fastify-plugin'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorate('someSupport', function () {
    return 'hugs'
  })
})

declare module 'fastify' {
  export interface FastifyInstance {
    someSupport(): string;
  }
}
