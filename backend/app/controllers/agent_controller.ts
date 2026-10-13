import { Readable } from 'stream'
import type { HttpContext } from '@adonisjs/core/http'
import AgentService, { agentErrorMessage } from '#services/agent_service'

export default class AgentController {
  async chat({ request, response }: HttpContext) {
    const message = request.input('message')

    if (typeof message !== 'string' || !message.trim()) {
      return response.badRequest({
        status: 'error',
        message: 'Escribe una pregunta para el agente',
      })
    }

    if (message.length > 2000) {
      return response.badRequest({
        status: 'error',
        message: 'La pregunta no puede superar los 2000 caracteres',
      })
    }

    try {
      const agentService = new AgentService()
      const answer = await agentService.reply(message.trim())

      return response.json({
        status: 'ok',
        answer,
      })
    } catch (error) {
      console.error('Error en el agente de IA:', error)

      return response.internalServerError({
        status: 'error',
        message: agentErrorMessage(error),
      })
    }
  }

  async chatStream({ request, response }: HttpContext) {
    const message = request.input('message')

    if (typeof message !== 'string' || !message.trim()) {
      return response.badRequest({
        status: 'error',
        message: 'Escribe una pregunta para el agente',
      })
    }

    if (message.length > 2000) {
      return response.badRequest({
        status: 'error',
        message: 'La pregunta no puede superar los 2000 caracteres',
      })
    }

    response.header('Content-Type', 'text/plain; charset=utf-8')
    response.header('Cache-Control', 'no-cache, no-transform')
    response.header('X-Accel-Buffering', 'no')

    const agentService = new AgentService()
    const generator = agentService.replyStream(message.trim())

    const stream = Readable.from(
      (async function* () {
        try {
          for await (const chunk of generator) {
            yield chunk
          }
        } catch (error) {
          console.error('Error en el streaming del agente:', error)
          yield `\n\n[${agentErrorMessage(error)}]`
        }
      })()
    )

    return response.stream(stream)
  }
}
