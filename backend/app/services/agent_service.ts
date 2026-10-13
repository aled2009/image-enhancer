const MAX_MESSAGE_LENGTH = 2000
const MAX_UPLOAD_MB = 10

type Intent = {
  name: string
  keywords: string[]
  answer: string
  weak?: boolean // saludos, gracias, etc.: solo responden si no hay otro tema
}

const intents: Intent[] = [
  {
    name: 'saludo',
    weak: true,
    keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal'],
    answer:
      '¡Hola! Soy el asistente de Image Enhancer. Puedo ayudarte con el escalado 2x/4x, los formatos admitidos, el límite de carga, las descargas y más. ¿Qué quieres saber?',
  },
  {
    name: 'gracias',
    weak: true,
    keywords: ['gracias', 'te agradezco', 'perfecto', 'genial', 'excelente', 'listo'],
    answer: '¡De nada! Si tienes otra duda sobre Image Enhancer, aquí estoy.',
  },
  {
    name: 'despedida',
    weak: true,
    keywords: ['adios', 'chao', 'hasta luego', 'nos vemos', 'bye'],
    answer: '¡Hasta pronto! Que disfrutes mejorando tus imágenes.',
  },
  {
    name: 'identidad',
    keywords: ['quien eres', 'como te llamas', 'eres un bot', 'eres una ia', 'tu nombre', 'eres humano'],
    answer:
      'Soy el asistente virtual de Image Enhancer. Respondo dudas sobre cómo funciona la aplicación.',
  },
  {
    name: 'que_es',
    keywords: [
      'que es', 'para que sirve', 'que hace', 'de que trata', 'image enhancer',
      'mejorar imagen', 'mejora la resolucion', 'resolucion', 'upscale', 'upscaling', 'ampliar', 'agrandar',
    ],
    answer:
      'Image Enhancer mejora la resolución de tus imágenes mediante inteligencia artificial. Subes una imagen, eliges un escalado de 2x o 4x y obtienes una versión con mayor resolución que puedes descargar.',
  },
  {
    name: 'como_usar',
    keywords: [
      'como uso', 'como se usa', 'como funciona', 'como mejoro', 'como subo', 'como puedo',
      'pasos', 'tutorial', 'empezar', 'comenzar', 'utilizar', 'instrucciones', 'guia',
    ],
    answer:
      'Para mejorar una imagen:\n1. Sube tu imagen (JPG, JPEG, PNG o WebP, máximo 10 MB).\n2. Elige el escalado: 2x o 4x.\n3. Inicia el procesamiento y espera a que termine.\n4. Descarga el resultado.\n\nSi quieres, también puedes eliminar los resultados desde la interfaz.',
  },
  {
    name: 'escalado',
    keywords: ['2x', '4x', 'x2', 'x4', 'escalado', 'escala', 'escalar', 'diferencia', 'aumentar', 'multiplicar'],
    answer:
      'La diferencia entre ambos modos:\n• 4x: es el escalado nativo del modelo (Real-ESRGAN x4v3). Multiplica por 4 el ancho y el alto, y da la mayor resolución final.\n• 2x: se obtiene ajustando el procesamiento del modelo x4. Genera una imagen más pequeña y es útil si no necesitas tanto tamaño.\n\nNo se puede garantizar una calidad perfecta; el resultado depende de la imagen original.',
  },
  {
    name: 'formatos',
    keywords: ['formato', 'jpg', 'jpeg', 'png', 'webp', 'extension', 'tipo de archivo', 'que archivos', 'admite', 'acepta', 'soporta', 'compatible'],
    answer:
      'Image Enhancer admite archivos JPG, JPEG, PNG y WebP. Otros formatos no están admitidos actualmente.',
  },
  {
    name: 'limite',
    keywords: ['limite', 'peso', 'pesa', 'tamano', 'megas', 'muy grande', 'maximo', 'demasiado grande', 'capacidad'],
    answer:
      'El límite de carga actual es de 10 MB por imagen. Si tu archivo pesa más, redúcelo o comprímelo antes de subirlo.',
  },
  {
    name: 'descarga',
    keywords: ['descargar', 'descarga', 'guardar', 'bajar', 'obtener resultado', 'exportar', 'resultado final'],
    answer:
      'Sí, las imágenes procesadas se pueden descargar. Cuando el procesamiento termine, usa la opción de descarga junto al resultado.',
  },
  {
    name: 'eliminar',
    keywords: ['eliminar', 'borrar', 'quitar', 'remover', 'suprimir', 'limpiar resultados'],
    answer:
      'Puedes eliminar los resultados desde la interfaz. Busca la opción de eliminar junto a la imagen procesada.',
  },
  {
    name: 'tecnologia',
    keywords: [
      'tecnologia', 'adonisjs', 'adonis', 'nextjs', 'next js', 'backend', 'frontend', 'real esrgan',
      'esrgan', 'modelo', 'stack', 'construido', 'programado', 'desarrollado', 'hecho con',
    ],
    answer:
      'Image Enhancer funciona así:\n• Backend: AdonisJS.\n• Web: Next.js.\n• Modelo de IA para mejorar imágenes: Real-ESRGAN x4v3.',
  },
  {
    name: 'movil',
    keywords: ['movil', 'app', 'aplicacion', 'celular', 'android', 'ios', 'telefono', 'iphone', 'smartphone'],
    answer:
      'Sí, la aplicación móvil ya está implementada. Puedes usar Image Enhancer tanto en la web como desde el móvil.',
  },
  {
    name: 'video',
    keywords: ['video', 'pelicula', 'clip', 'animacion', 'mejorar videos'],
    answer:
      'El mejoramiento de videos no está disponible en la versión actual. Podría considerarse en el futuro, pero no hay una fecha confirmada ni una promesa de lanzamiento.',
  },
  {
    name: 'precio',
    keywords: ['precio', 'costo', 'cuesta', 'gratis', 'pagar', 'plan', 'suscripcion', 'cobran', 'cuanto vale'],
    answer:
      'No tengo información confirmada sobre precios o planes, así que prefiero no darte datos que podrían ser incorrectos.',
  },
  {
    name: 'privacidad',
    keywords: ['privacidad', 'privado', 'seguro', 'seguridad', 'datos personales', 'quien ve', 'guardan mis imagenes', 'cuenta', 'registro', 'registrarme'],
    answer:
      'No tengo información confirmada sobre privacidad, cuentas o almacenamiento más allá de que puedes eliminar los resultados desde la interfaz.',
  },
  {
    name: 'tiempo',
    keywords: ['cuanto tarda', 'demora', 'tarda', 'tiempo de proceso', 'lento', 'lenta', 'rapido', 'velocidad', 'cuanto se demora'],
    answer:
      'No tengo un tiempo exacto confirmado. Normalmente depende del tamaño de la imagen, del escalado elegido y de la carga del servidor. Si se queda procesando demasiado, intenta de nuevo o prueba con una imagen más pequeña.',
  },
  {
    name: 'calidad',
    keywords: ['calidad', 'borrosa', 'borroso', 'pixelada', 'pixelado', 'mejor resultado', 'resultado malo', 'perfecta', 'nitida', 'nitidez', 'detalles', 'se ve mal'],
    answer:
      'La IA mejora la resolución y los detalles, pero no puede asegurar una calidad perfecta. Para obtener mejores resultados:\n1. Usa la imagen original de mayor calidad que tengas.\n2. Evita imágenes ya muy comprimidas.\n3. Prueba 2x y 4x y compara.',
  },
  {
    name: 'error',
    keywords: [
      'error', 'falla', 'no funciona', 'no carga', 'no sube', 'no puedo', 'problema', 'se queda',
      'se cuelga', 'no procesa', 'fallo', 'se traba', 'no responde', 'no abre', 'no descarga',
    ],
    answer:
      'Si algo falla, revisa lo siguiente:\n1. Que el archivo sea JPG, JPEG, PNG o WebP.\n2. Que no pese más de 10 MB.\n3. Que tu conexión sea estable.\n4. Intenta de nuevo o con otra imagen.\n\nSi el problema continúa, cuéntame qué mensaje aparece y en qué paso ocurre (subida, procesamiento o descarga).',
  },
]

const fallback =
  'No tengo información sobre eso. Mi especialidad es Image Enhancer: puedo ayudarte con el escalado 2x/4x, los formatos admitidos, el límite de carga, las descargas, la app móvil o posibles errores. ¿Sobre cuál quieres saber?'

const UNSUPPORTED_FORMATS = ['gif', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'svg', 'raw', 'pdf', 'avif', 'psd']

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------- Procesamiento de texto (ligero) ----------

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  const n = normalize(text)
  return n ? n.split(' ') : []
}

// Stemmer mínimo para español: "mejorar", "mejora", "mejoro" -> "mejor"
function stem(word: string): string {
  if (word.length <= 3) return word

  let s = word.replace(/(mente|ando|iendo|ar|er|ir|ado|ido|es|s)$/, '')
  if (s.length < 3) s = word

  const v = s.replace(/[aeo]$/, '')
  return v.length >= 3 ? v : s
}

// Distancia de edición (usa solo dos filas: memoria mínima)
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  let prev = Array.from({ length: n + 1 }, (_, j) => j)

  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }

  return prev[n]
}

// ---------- Compilación de intenciones (una sola vez al cargar) ----------

type Compiled = {
  name: string
  answer: string
  weak: boolean
  single: string[]
  phrases: string[]
}

const compiled: Compiled[] = intents.map((intent) => {
  const single = new Set<string>()
  const phrases = new Set<string>()

  for (const keyword of intent.keywords) {
    const stems = tokenize(keyword).map(stem)

    if (stems.length === 1) {
      single.add(stems[0])
    } else if (stems.length > 1) {
      phrases.add(` ${stems.join(' ')} `)
    }
  }

  return {
    name: intent.name,
    answer: intent.answer,
    weak: intent.weak === true,
    single: [...single],
    phrases: [...phrases],
  }
})

// ---------- Puntuación ----------

function hasFuzzy(keyword: string, tokens: string[]): boolean {
  if (keyword.length < 5) return false
  const maxDistance = keyword.length >= 9 ? 2 : 1

  for (const token of tokens) {
    if (token.length < 5 || Math.abs(token.length - keyword.length) > 2) continue
    if (levenshtein(token, keyword) <= maxDistance) return true
  }

  return false
}

function score(intent: Compiled, tokens: string[], tokenSet: Set<string>, padded: string): number {
  let total = 0

  for (const phrase of intent.phrases) {
    if (padded.includes(phrase)) total += 3
  }

  for (const keyword of intent.single) {
    if (tokenSet.has(keyword)) total += 2
    else if (hasFuzzy(keyword, tokens)) total += 1.5
  }

  return total
}

// ---------- Respuestas dinámicas (datos concretos del mensaje) ----------

function sizeAnswer(message: string): string | null {
  const match = message.toLowerCase().match(/(\d+(?:[.,]\d+)?)\s*(kb|mb|gb|megas?|megabytes?)\b/)
  if (!match) return null

  let mb = Number.parseFloat(match[1].replace(',', '.'))
  const unit = match[2]

  if (unit === 'gb') mb *= 1024
  else if (unit === 'kb') mb /= 1024

  if (!Number.isFinite(mb)) return null

  const shown = `${match[1]} ${match[2].toUpperCase()}`

  return mb <= MAX_UPLOAD_MB
    ? `Con ${shown} estás dentro del límite de ${MAX_UPLOAD_MB} MB, así que puedes subirla (siempre que sea JPG, JPEG, PNG o WebP).`
    : `Con ${shown} superas el límite de ${MAX_UPLOAD_MB} MB. Reduce o comprime la imagen antes de subirla.`
}

function formatAnswer(rawTokens: string[]): string | null {
  const found = rawTokens.find((token) => UNSUPPORTED_FORMATS.includes(token))
  if (!found) return null

  return `El formato ${found.toUpperCase()} no está admitido. Solo se admiten JPG, JPEG, PNG y WebP. Puedes convertir la imagen a uno de esos formatos antes de subirla.`
}

// ---------- Motor principal ----------

function findAnswer(message: string): string {
  const rawTokens = tokenize(message).slice(0, 120)
  const tokens = rawTokens.map(stem)
  const tokenSet = new Set(tokens)
  const padded = ` ${tokens.join(' ')} `

  const dynamic = [formatAnswer(rawTokens), sizeAnswer(message)].filter(Boolean) as string[]
  if (dynamic.length) return dynamic.join('\n\n')

  const scored = compiled
    .map((intent) => ({ intent, score: score(intent, tokens, tokenSet, padded) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const strong = scored.filter((item) => !item.intent.weak)

  if (strong.length) {
    const best = strong[0]

    if (best.score < 2) {
      return `Creo que preguntas sobre esto:\n\n${best.intent.answer}`
    }

    const picks = [best.intent.answer]
    const second = strong[1]

    // Si la segunda coincidencia es casi tan fuerte, responde ambas
    if (second && second.score >= 2 && second.score >= best.score * 0.7) {
      picks.push(second.intent.answer)
    }

    return picks.join('\n\n')
  }

  const weak = scored.find((item) => item.intent.weak)
  return weak ? weak.intent.answer : fallback
}

// ---------- API pública (misma interfaz de antes) ----------

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null) {
    const status = Number((error as { status?: unknown }).status)

    if (Number.isFinite(status) && status >= 400) {
      return status
    }
  }

  return undefined
}

export function agentErrorMessage(error: unknown): string {
  if (error instanceof Error && /vacío|superar/i.test(error.message)) {
    return error.message
  }

  return 'El agente no pudo completar la respuesta. Inténtalo nuevamente.'
}

export default class AgentService {
  private validateMessage(message: string) {
    if (typeof message !== 'string' || !message.trim()) {
      throw new Error('El mensaje no puede estar vacío')
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres`)
    }
  }

  async reply(message: string) {
    this.validateMessage(message)

    return findAnswer(message)
  }

  async *replyStream(message: string) {
    this.validateMessage(message)

    const answer = findAnswer(message)
    const parts = answer.match(/\S+\s*/g) ?? [answer]

    for (const part of parts) {
      yield part
      await sleep(15)
    }
  }
}