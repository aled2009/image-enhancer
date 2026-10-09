import type { HttpContext } from '@adonisjs/core/http'
import { mkdir, unlink } from 'node:fs/promises'
import { basename, join } from 'node:path'
import ImageEnhancerService from '#services/image_enhancer_service'

export default class ImagesController {
  private getOutputPath(fileName: string) {
    if (basename(fileName) !== fileName || !/^enhanced-[a-zA-Z0-9._-]+\.png$/.test(fileName)) {
      return null
    }

    return join(process.cwd(), 'tmp', 'outputs', fileName)
  }

  async enhance({ request, response }: HttpContext) {
    const image = request.file('image', {
      size: '10mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp'],
    })

    if (!image) {
      return response.badRequest({
        status: 'error',
        message: 'No se recibió ninguna imagen',
      })
    }

    if (image.hasErrors) {
      return response.badRequest({
        status: 'error',
        message: 'La imagen no es válida o supera el límite de 10 MB',
        errors: image.errors,
      })
    }

    await image.move('tmp/images')

    if (image.hasErrors || !image.fileName) {
      return response.badRequest({
        status: 'error',
        message: 'No se pudo guardar la imagen',
        errors: image.errors,
      })
    }

    const imagePath = join(process.cwd(), 'tmp', 'images', image.fileName)

    try {
      const scale = Number(request.input('scale', 4))

      if (scale !== 2 && scale !== 4) {
        return response.badRequest({
          status: 'error',
          message: 'El escalado debe ser 2 o 4',
        })
      }

      const outputFileName = `enhanced-${image.fileName}.png`
      const outputPath = join(process.cwd(), 'tmp', 'outputs', outputFileName)

      await mkdir(join(process.cwd(), 'tmp', 'outputs'), {
        recursive: true,
      })

      const imageEnhancerService = new ImageEnhancerService()

      await imageEnhancerService.enhanceImage(imagePath, outputPath, scale)

      return response.json({
        status: 'ok',
        message: 'Imagen mejorada correctamente',
        image: {
          fileName: outputFileName,
        },
      })
    } catch (error) {
      console.error('Error al mejorar la imagen:', error)

      return response.internalServerError({
        status: 'error',
        message: 'No se pudo mejorar la imagen',
      })
    } finally {
      try {
        await unlink(imagePath)
      } catch (error) {
        console.error('No se pudo eliminar la imagen temporal:', error)
      }
    }
  }
  async download({ params, response }: HttpContext) {
    const filePath = this.getOutputPath(params.fileName)

    if (!filePath) {
      return response.badRequest({
        status: 'error',
        message: 'Nombre de archivo no válido',
      })
    }

    response.header('Content-Disposition', `attachment; filename="${basename(filePath)}"`)

    return response.download(filePath)
  }

  async deleteOutput({ params, response }: HttpContext) {
    const filePath = this.getOutputPath(params.fileName)

    if (!filePath) {
      return response.badRequest({
        status: 'error',
        message: 'Nombre de archivo no válido',
      })
    }

    try {
      await unlink(filePath)

      return response.json({
        status: 'ok',
        message: 'Imagen eliminada correctamente',
      })
    } catch (error) {
      console.error('No se pudo eliminar el resultado:', error)

      return response.internalServerError({
        status: 'error',
        message: 'No se pudo eliminar la imagen',
      })
    }
  }
}
