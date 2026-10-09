import type { HttpContext } from '@adonisjs/core/http'
import { execa } from 'execa'
import { mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'

export default class VideosController {
  async analyze({ request, response }: HttpContext) {
    const video = request.file('video')

    if (!video) {
      return response.badRequest({
        status: 'error',
        message: 'No se recibió ningún video',
      })
    }

    await video.move('tmp/videos')

    if (video.hasErrors || !video.fileName) {
      return response.badRequest({
        status: 'error',
        message: 'No se pudo guardar el video',
        errors: video.errors,
      })
    }

    const videoPath = join(process.cwd(), 'tmp', 'videos', video.fileName)

    const { stdout } = await execa('ffprobe', [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      videoPath,
    ])

    const metadata = JSON.parse(stdout)

    const videoStream = metadata.streams.find(
      (stream: { codec_type: string }) => stream.codec_type === 'video'
    )

    await unlink(videoPath)

    if (!videoStream) {
      return response.badRequest({
        status: 'error',
        message: 'No se encontró un stream de video válido',
      })
    }

    return response.json({
      status: 'ok',
      message: 'Video analizado correctamente',
      video: {
        clientName: video.clientName,
        fileName: video.fileName,
        size: video.size,
        resolution: `${videoStream.width}x${videoStream.height}`,
        width: videoStream.width,
        height: videoStream.height,
        fps: videoStream.r_frame_rate,
        duration: metadata.format.duration,
        format: metadata.format.format_name,
        codec: videoStream.codec_name,
      },
    })
  }

  async process({ request, response }: HttpContext) {
    const video = request.file('video')

    if (!video) {
      return response.badRequest({
        status: 'error',
        message: 'No se recibió ningún video',
      })
    }

    await video.move('tmp/videos')

    if (video.hasErrors || !video.fileName) {
      return response.badRequest({
        status: 'error',
        message: 'No se pudo guardar el video',
        errors: video.errors,
      })
    }

    const videoPath = join(process.cwd(), 'tmp', 'videos', video.fileName)
    const outputFileName = `enhanced-${video.fileName}`
    const outputPath = join(process.cwd(), 'tmp', 'outputs', outputFileName)

    await mkdir(join(process.cwd(), 'tmp', 'outputs'), { recursive: true })

    try {
      await execa('ffmpeg', [
        '-i',
        videoPath,
        '-map',
        '0:v:0',
        '-map',
        '0:a:0?',
        '-vf',
        'scale=1920:1080:force_original_aspect_ratio=decrease',
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-crf',
        '23',
        '-r',
        '30',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        outputPath,
      ])

      return response.json({
        status: 'ok',
        message: 'Video procesado correctamente',
        video: {
          fileName: outputFileName,
        },
      })
    } finally {
      await unlink(videoPath)
    }
  }
  async download({ params, response }: HttpContext) {
    const filePath = join(process.cwd(), 'tmp', 'outputs', params.fileName)

    return response.attachment(filePath, params.fileName)
  }
}
