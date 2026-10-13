"use client";

import AgentChat from "./components/AgentChat";
import { useRef, useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

// Cuando tengas tu repositorio en GitHub, pega aquí el enlace.
// Ejemplo: "https://github.com/tu-usuario/tu-repositorio"
const GITHUB_URL = "https://github.com/aled2009/image-enhancer.git";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [processedFileName, setProcessedFileName] = useState("");
  const [processedScale, setProcessedScale] = useState<2 | 4 | null>(null);
  const [scale, setScale] = useState<2 | 4>(4);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [showScaleConfirm, setShowScaleConfirm] = useState(false);
  const [exampleResults, setExampleResults] = useState<Record<string, string>>(
    {},
  );
  const [exampleProcessing, setExampleProcessing] = useState<string | null>(
    null,
  );
  const [exampleErrors, setExampleErrors] = useState<Record<string, string>>(
    {},
  );
  const abortController = useRef<AbortController | null>(null);

  const deleteOutput = async (fileName: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/images/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        console.error("No se pudo eliminar el output:", await response.text());
      }
    } catch (error) {
      console.error("Error al eliminar el output:", error);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedFileName("");
      setProcessedScale(null);
      setError("");
      setShowScaleConfirm(false);
    }

    event.target.value = "";
  };

  const processExample = async (src: string, name: string, key: string) => {
    if (processing || exampleProcessing) {
      return;
    }

    setExampleProcessing(key);
    setExampleErrors((previous) => ({ ...previous, [key]: "" }));

    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error("No se pudo cargar la imagen de ejemplo.");
      }

      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });
      const formData = new FormData();

      formData.append("image", file);
      formData.append("scale", "4");

      const result = await fetch(`${API_URL}/api/images/enhance`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || "No se pudo mejorar la imagen.");
      }

      const previousFileName = exampleResults[key];
      const newFileName = data.image.fileName;

      setExampleResults((previous) => ({
        ...previous,
        [key]: newFileName,
      }));

      if (previousFileName && previousFileName !== newFileName) {
        await deleteOutput(previousFileName);
      }
    } catch (error) {
      setExampleErrors((previous) => ({
        ...previous,
        [key]:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar el ejemplo.",
      }));
    } finally {
      setExampleProcessing(null);
    }
  };

  const handleExampleChange = async (src: string, name: string) => {
    if (processing || exampleProcessing) {
      return;
    }

    try {
      const response = await fetch(src);

      if (!response.ok) {
        throw new Error("No se pudo cargar la imagen de ejemplo.");
      }

      const blob = await response.blob();
      const file = new File([blob], name, { type: blob.type });

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedFileName("");
      setProcessedScale(null);
      setError("");
      setShowScaleConfirm(false);
    } catch {
      setError("No se pudo cargar la imagen de ejemplo.");
    }
  };

  const removeImage = async () => {
    if (processing) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const previousFileName = processedFileName;

    setImage(null);
    setPreviewUrl("");
    setProcessedFileName("");
    setProcessedScale(null);
    setError("");
    setShowScaleConfirm(false);

    if (previousFileName) {
      await deleteOutput(previousFileName);
    }
  };

  const cancelProcessing = () => {
    abortController.current?.abort();
  };

  const processImage = async (confirmedScaleChange = false) => {
    if (!image || processing) {
      return;
    }

    setError("");

    if (processedFileName && processedScale !== null) {
      if (processedScale === scale) {
        setError(
          `Esta imagen ya fue mejorada en ${scale}×. Selecciona ${scale === 2 ? "4×" : "2×"} si quieres generar otro resultado.`,
        );
        return;
      }

      if (!confirmedScaleChange) {
        setShowScaleConfirm(true);
        return;
      }
    }

    setShowScaleConfirm(false);
    setProcessing(true);

    const controller = new AbortController();
    abortController.current = controller;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("scale", String(scale));

    try {
      const response = await fetch(`${API_URL}/api/images/enhance`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (response.status === 413) {
        setError(
          "La imagen es demasiado grande. El tamaño máximo permitido es de 10 MB. Selecciona una imagen más pequeña e inténtalo de nuevo.",
        );
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo mejorar la imagen");
      }

      const previousFileName = processedFileName;

      setProcessedFileName(data.image.fileName);
      setProcessedScale(scale);

      if (previousFileName && previousFileName !== data.image.fileName) {
        await deleteOutput(previousFileName);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setError(
          "Se canceló la solicitud desde el navegador. El servidor podría continuar procesando la imagen.",
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al mejorar la imagen",
        );
      }
    } finally {
      if (abortController.current === controller) {
        abortController.current = null;
        setProcessing(false);
      }
    }
  };

  return (
    <main
      className={`relative min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(109,40,217,0.22),transparent_55%),linear-gradient(to_bottom,#09090b,#12091f,#09090b)] text-white transition-[padding] duration-300 ${
        isAgentOpen ? "lg:pr-105" : ""
      }`}
    >
      <aside className="absolute left-4 top-4 z-10 max-w-64 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-left shadow-lg shadow-violet-950/20 backdrop-blur sm:left-6 sm:top-6">
        <p className="text-sm font-semibold leading-tight text-white">
          David Alejandro Delgado Zambrano
        </p>

        <p className="mt-1 text-xs text-violet-300">Ingeniería de Software</p>

        <p className="mt-1 text-xs text-zinc-400">Facultad de Ingeniería</p>

        <p className="mt-1 text-xs text-zinc-400">
          Universidad Cooperativa de Colombia - Campus Pasto
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Contexto de la Ingeniería de Software
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          Semestre 1 · Grupo 1A · 2026-B
        </p>

        <p className="mt-2 text-xs">
          {GITHUB_URL ? (
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-300 underline-offset-2 transition hover:text-violet-200 hover:underline"
            >
              GitHub: ver repositorio ↗
            </a>
          ) : (
            <span className="text-zinc-500">
              Enlace de GitHub: próximamente
            </span>
          )}
        </p>
      </aside>

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 pb-10 pt-52 transition-all duration-300 sm:px-6 sm:pb-16 lg:pt-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Image Enhancer</h1>

          <p className="mt-3 text-zinc-400">
            Mejora la calidad y resolución de tus imágenes con IA
          </p>
        </div>

        <section className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl shadow-violet-950/20">
          {" "}
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 px-6 py-6 text-center">
            {image && previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa de la imagen original"
                className="max-h-80 max-w-full rounded-lg object-contain"
              />
            ) : (
              <>
                <h2 className="text-xl font-semibold">Selecciona una imagen</h2>

                <p className="mt-2 text-sm text-zinc-400">
                  Sube una imagen para comenzar a mejorarla
                </p>
              </>
            )}

            {!image && (
              <label className="mt-6 cursor-pointer rounded-lg border border-violet-400/30 bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500">
                {" "}
                Seleccionar imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {image && (
              <div className="mt-6 w-full">
                <p className="break-all text-sm text-zinc-300">{image.name}</p>

                <p className="mt-1 text-sm text-zinc-500">
                  {(image.size / 1024 / 1024).toFixed(2)} MB
                </p>

                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium text-zinc-300">
                    Escalado de imagen
                  </p>

                  <div className="flex justify-center gap-3">
                    {[2, 4].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setScale(value as 2 | 4);
                          setError("");
                        }}
                        disabled={processing}
                        className={`cursor-pointer rounded-lg border px-6 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          scale === value
                            ? "border-violet-400 bg-violet-600 text-white"
                            : "border-zinc-700 text-white hover:bg-zinc-800"
                        }`}
                      >
                        {value}×
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    {scale === 2
                      ? "Modo 2×: salida de aproximadamente el doble de las dimensiones de entrada procesada."
                      : "Modo 4×: salida de hasta cuatro veces las dimensiones de entrada procesada."}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => processImage()}
                    disabled={processing}
                    className="cursor-pointer rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? "Procesando..." : "Mejorar imagen"}
                  </button>

                  {processing && (
                    <button
                      type="button"
                      onClick={cancelProcessing}
                      className="cursor-pointer rounded-lg border border-red-800 px-6 py-3 font-medium text-red-300 transition hover:bg-red-950"
                    >
                      Cancelar procesamiento
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={processing}
                    className="cursor-pointer rounded-lg border border-zinc-700 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
            )}
          </div>
          {processing && (
            <div
              className="mt-6 rounded-lg border border-blue-900 bg-blue-950 p-4 text-center"
              role="status"
            >
              <p className="font-medium text-blue-300">
                La inteligencia artificial está mejorando tu imagen.
              </p>

              <p className="mt-1 text-sm text-blue-200">
                Puede tardar un poco. No cierres esta página mientras esperas el
                resultado.
              </p>
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-900 bg-red-950 p-4 text-center text-sm text-red-300"
            >
              {error}
            </div>
          )}
          {processedFileName && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-lg font-semibold">
                Imagen mejorada en {processedScale}×
              </h3>

              <img
                src={`${API_URL}/api/images/download/${encodeURIComponent(processedFileName)}`}
                alt={`Imagen mejorada en ${processedScale}×`}
                className="mt-4 max-h-150 w-full rounded-lg object-contain"
              />

              <div className="mt-6 rounded-lg border border-violet-500/30 bg-violet-950/40 p-4 text-center">
                {" "}
                <p className="text-sm font-medium text-violet-300">
                  {" "}
                  Imagen mejorada correctamente
                </p>
                <a
                  href={`${API_URL}/api/images/download/${encodeURIComponent(processedFileName)}`}
                  download={processedFileName}
                  className="mt-4 inline-block cursor-pointer rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-500"
                >
                  Descargar imagen
                </a>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 w-full space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Prueba los ejemplos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Compara cada imagen original con su versión mejorada mediante IA
              en 4×.
            </p>
          </div>

          {[
            {
              key: "example1",
              name: "Ejemplo 1",
              src: "/examples/example-1.png",
              enhancedSrc: "/examples/example-1-enhanced.png",
              fileName: "example-1.png",
            },
            {
              key: "example2",
              name: "Ejemplo 2",
              src: "/examples/example-2.jpg",
              enhancedSrc: "/examples/example-2-enhanced.jpg",
              fileName: "example-2.jpg",
            },
          ].map((example) => (
            <article
              key={example.key}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
            >
              <h3 className="mb-4 text-lg font-semibold">{example.name}</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-2 text-sm text-zinc-400">Imagen original</p>

                  <div className="flex min-h-48 items-center justify-center rounded-xl bg-zinc-950 p-2">
                    <img
                      src={example.src}
                      alt={`${example.name}, original`}
                      className="max-h-80 max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-sm text-zinc-400">
                    Resultado mejorado con IA · 4×
                  </p>

                  <div className="flex min-h-48 items-center justify-center rounded-xl bg-zinc-950 p-2">
                    <img
                      src={example.enhancedSrc}
                      alt={`${example.name}, mejorado con IA en 4×`}
                      className="max-h-80 max-w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      onLoad={(event) => {
                        event.currentTarget.style.display = "block";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleExampleChange(example.src, example.fileName)
                  }
                  disabled={processing || exampleProcessing !== null}
                  className="w-full cursor-pointer rounded-lg bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Probar esta imagen
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>

      {showScaleConfirm && processedScale !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowScaleConfirm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="scale-dialog-title"
            className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-white shadow-2xl sm:p-8"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-2xl">
              ↗
            </div>

            <h2
              id="scale-dialog-title"
              className="text-center text-xl font-semibold"
            >
              ¿Cambiar el escalado?
            </h2>

            <p className="mt-3 text-center text-sm leading-6 text-zinc-400">
              Ya tienes una imagen mejorada en{" "}
              <span className="font-semibold text-white">
                {processedScale}×
              </span>
              . Si continúas, generaremos una nueva versión en{" "}
              <span className="font-semibold text-white">{scale}×</span>.
            </p>

            <div className="mt-5 rounded-xl border border-amber-900/70 bg-amber-950/50 p-4">
              <p className="text-sm leading-5 text-amber-200">
                La imagen anterior seguirá disponible mientras se procesa la
                nueva. Si el procesamiento termina correctamente, se mostrará el
                nuevo resultado en su lugar.
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowScaleConfirm(false)}
                className="w-full cursor-pointer rounded-lg border border-zinc-700 px-4 py-3 font-medium text-white transition hover:bg-zinc-800"
              >
                No, conservar {processedScale}×
              </button>

              <button
                type="button"
                onClick={() => processImage(true)}
                className="w-full cursor-pointer rounded-lg bg-white px-4 py-3 font-medium text-black transition hover:bg-zinc-200"
              >
                Sí, cambiar a {scale}×
              </button>
            </div>
          </section>
        </div>
      )}
      <AgentChat
        isOpen={isAgentOpen}
        onToggle={() => setIsAgentOpen((open) => !open)}
      />
    </main>
  );
}
