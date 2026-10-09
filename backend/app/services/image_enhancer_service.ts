import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import ort from 'onnxruntime-node'
import sharp from 'sharp'

export default class ImageEnhancerService {
  private modelPath = join(process.cwd(), 'models', 'realesrgan', 'realesr-general-x4v3.onnx')

  async enhanceImage(inputPath: string, outputPath: string, scale: 2 | 4 = 4) {
    const image = sharp(inputPath)

    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('No se pudieron obtener las dimensiones de la imagen')
    }

    const resizeFactor = scale === 2 ? 0.5 : 1

    const { data, info } = await image
      .resize({
        width: Math.min(1280, Math.round(metadata.width * resizeFactor)),
        height: Math.min(720, Math.round(metadata.height * resizeFactor)),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = info.width * info.height
    const input = new Float32Array(pixels * 3)

    for (let i = 0; i < pixels; i++) {
      input[i] = data[i * 3] / 255
      input[pixels + i] = data[i * 3 + 1] / 255
      input[pixels * 2 + i] = data[i * 3 + 2] / 255
    }

    const tensor = new ort.Tensor('float32', input, [1, 3, info.height, info.width])

    const session = await ort.InferenceSession.create(this.modelPath)

    const result = await session.run({
      input: tensor,
    })

    const output = result.output
    const outputData = output.data as Float32Array

    const outputWidth = info.width * 4
    const outputHeight = info.height * 4
    const outputPixels = outputWidth * outputHeight

    const imageData = Buffer.alloc(outputPixels * 3)

    for (let i = 0; i < outputPixels; i++) {
      imageData[i * 3] = Math.max(0, Math.min(255, outputData[i] * 255))

      imageData[i * 3 + 1] = Math.max(0, Math.min(255, outputData[outputPixels + i] * 255))

      imageData[i * 3 + 2] = Math.max(0, Math.min(255, outputData[outputPixels * 2 + i] * 255))
    }

    await mkdir(join(outputPath, '..'), { recursive: true })

    const processedImage = sharp(imageData, {
      raw: {
        width: outputWidth,
        height: outputHeight,
        channels: 3,
      },
    })

    if (scale === 2) {
      await processedImage
        .resize(info.width * 2, info.height * 2)
        .png()
        .toFile(outputPath)
    } else {
      await processedImage.png().toFile(outputPath)
    }
  }
}
