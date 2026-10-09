import router from '@adonisjs/core/services/router'
import AgentController from '#controllers/agent_controller'

router.post('/api/agent/chat', [AgentController, 'chat'])
router.post('/api/agent/chat/stream', [AgentController, 'chatStream'])
