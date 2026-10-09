import router from '@adonisjs/core/services/router'
import ImagesController from '#controllers/images_controller'

router.post('/api/images/enhance', [ImagesController, 'enhance'])
router.get('/api/images/download/:fileName', [ImagesController, 'download'])
router.delete('/api/images/:fileName', [ImagesController, 'deleteOutput'])
