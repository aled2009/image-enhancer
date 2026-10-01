import router from '@adonisjs/core/services/router'
import VideosController from '#controllers/videos_controller'

router.post('/api/videos/analyze', [VideosController, 'analyze'])
router.post('/api/videos/process', [VideosController, 'process'])
