import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import ort from 'onnxruntime-node'
import sharp from 'sharp'

sharp.cache(false)
sharp.concurrency(1)

const MODEL_PATH = join(process.cwd(), 'models', 'realesrgan', 'realesr-general-x4v3.onnx')
const MODEL_SCALE = 4
const TILE = 128 // tamaño del bloque de entrada
const PAD = 8 // borde extra para evitar costuras entre bloques

// Límite de entrada: configurable desde Render sin tocar el código
const MAX_W = Number(process.env.ENHANCER_MAX_WIDTH ?? 640)
const MAX_H = Number(process.env.ENHANCER_MAX_HEIGHT ?? 360)

// La sesión se crea una sola vez y se reutiliza
let sessionPromise: Promise<ort.InferenceSession> | null = null

function getSession() {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession
      .create(MODEL_PATH, {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'basic',
        enableCpuMemArena: false,
        enableMemPattern: false,
        intraOpNumThreads: 1,
        interOpNumThreads: 1,
      })
      .catch((error) => {
        sessionPromise = null
        throw error
      })
  }

  return sessionPromise
}

// Cola: solo se procesa una imagen a la vez
let queue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value * 255)))

export default class ImageEnhancerService {
  async enhanceImage(inputPath: string, outputPath: string, scale: 2 | 4 = 4) {
    return enqueue(() => this.run(inputPath, outputPath, scale))
  }

  private async run(inputPath: string, outputPath: string, scale: 2 | 4) {
    const metadata = await sharp(inputPath).metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('No se pudieron obtener las dimensiones de la imagen')
    }

    const factor = scale === 2 ? 0.5 : 1

    const { data, info } = await sharp(inputPath)
      .resize({
        width: Math.min(MAX_W, Math.max(1, Math.round(metadata.width * factor))),
        height: Math.min(MAX_H, Math.max(1, Math.round(metadata.height * factor))),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const w = info.width
    const h = info.height
    const outW = w * MODEL_SCALE
    const outH = h * MODEL_SCALE

    const session = await getSession()
    const inputName = session.inputNames[0]
    const outputName = session.outputNames[0]

    const imageData = Buffer.alloc(outW * outH * 3)

    for (let ty = 0; ty < h; ty += TILE) {
      for (let tx = 0; tx < w; tx += TILE) {
        const tw = Math.min(TILE, w - tx)
        const th = Math.min(TILE, h - ty)

        // Región con borde extra
        const x0 = Math.max(0, tx - PAD)
        const y0 = Math.max(0, ty - PAD)
        const x1 = Math.min(w, tx + tw + PAD)
        const y1 = Math.min(h, ty + th + PAD)
        const pw = x1 - x0
        const ph = y1 - y0
        const n = pw * ph

        const input = new Float32Array(n * 3)

        for (let y = 0; y < ph; y++) {
          for (let x = 0; x < pw; x++) {
            const src = ((y0 + y) * w + (x0 + x)) * 3
            const i = y * pw + x
            input[i] = data[src] / 255
            input[n + i] = data[src + 1] / 255
            input[2 * n + i] = data[src + 2] / 255
          }
        }

        const result = await session.run({
          [inputName]: new ort.Tensor('float32', input, [1, 3, ph, pw]),
        })

        const out = result[outputName].data as Float32Array
        const ow = pw * MODEL_SCALE
        const oPixels = ow * ph * MODEL_SCALE

        // Copia solo la parte central (sin el borde extra) a la imagen final
        const offX = (tx - x0) * MODEL_SCALE
        const offY = (ty - y0) * MODEL_SCALE

        for (let y = 0; y < th * MODEL_SCALE; y++) {
          for (let x = 0; x < tw * MODEL_SCALE; x++) {
            const o = (offY + y) * ow + (offX + x)
            const dst = ((ty * MODEL_SCALE + y) * outW + (tx * MODEL_SCALE + x)) * 3

            imageData[dst] = clamp(out[o])
            imageData[dst + 1] = clamp(out[oPixels + o])
            imageData[dst + 2] = clamp(out[2 * oPixels + o])
          }
        }
      }
    }

    await mkdir(dirname(outputPath), { recursive: true })

    await sharp(imageData, { raw: { width: outW, height: outH, channels: 3 } })
      .png()
      .toFile(outputPath)
  }
}