"use client";

import { useState } from "react";

type VideoInfo = {
  resolution: string;
  fps: string;
  duration: string;
  format: string;
  codec: string;
};

export default function Home() {
  const [video, setVideo] = useState<File | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedFileName, setProcessedFileName] = useState("");
  const [error, setError] = useState("");

  const [outputSettings, setOutputSettings] = useState({
    resolution: "1080p",
    fps: "30",
    format: "MP4",
    audio: "AAC",
  });

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setVideo(file);
      setVideoInfo(null);
      setError("");
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoInfo(null);
    setError("");
  };

  const analyzeVideo = async () => {
    if (!video) {
      return;
    }

    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await fetch("http://localhost:3333/api/videos/analyze", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo analizar el video");
      }

      setVideoInfo(data.video);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al analizar el video",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const processVideo = async () => {
    if (!video) {
      return;
    }

    setProcessing(true);
    setProcessedFileName("");
    setError("");

    const formData = new FormData();
    formData.append("video", video);

    try {
      const response = await fetch("http://localhost:3333/api/videos/process", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo procesar el video");
      }

      setProcessedFileName(data.video.fileName);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al procesar el video",
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatFps = (fps: string) => {
    const [frames, time] = fps.split("/");

    if (!frames || !time) {
      return fps;
    }

    return `${Math.round(Number(frames) / Number(time))} FPS`;
  };

  const formatDuration = (duration: string) => {
    const seconds = Number(duration);

    if (seconds < 60) {
      return `${seconds.toFixed(1)} segundos`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    return `${minutes} min ${remainingSeconds} s`;
  };

  const formatContainer = (format: string) => {
    if (format.includes("mp4")) {
      return "MP4";
    }

    if (format.includes("webm")) {
      return "WebM";
    }

    if (format.includes("matroska")) {
      return "MKV";
    }

    if (format.includes("mov")) {
      return "MOV";
    }

    return format.toUpperCase();
  };

  const formatCodec = (codec: string) => {
    const codecs: Record<string, string> = {
      h264: "H.264",
      hevc: "H.265 / HEVC",
      vp9: "VP9",
      av1: "AV1",
    };

    return codecs[codec] || codec.toUpperCase();
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Video Enhancer</h1>

          <p className="mt-3 text-zinc-400">
            Mejora y optimiza tus videos fácilmente
          </p>
        </div>

        <section className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 px-6 text-center">
            <h2 className="text-xl font-semibold">
              {video ? video.name : "Selecciona un video"}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {video
                ? `${(video.size / 1024 / 1024).toFixed(2)} MB`
                : "Sube un video para comenzar a analizarlo"}
            </p>

            {!video && (
              <label className="mt-6 cursor-pointer rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200">
                Seleccionar video
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}

            {video && (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={analyzeVideo}
                  disabled={analyzing}
                  className="rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {analyzing ? "Analizando..." : "Analizar video"}
                </button>

                <button
                  type="button"
                  onClick={removeVideo}
                  disabled={analyzing}
                  className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Quitar video
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-6 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          {videoInfo && (
            <>
              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-lg font-semibold">Información del video</h3>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Resolución</p>
                    <p className="mt-1">
                      {videoInfo.resolution.replace("x", " × ")} px
                    </p>
                  </div>

                  <div>
                    <p className="text-zinc-500">FPS</p>
                    <p className="mt-1">{formatFps(videoInfo.fps)}</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">Duración</p>
                    <p className="mt-1">{formatDuration(videoInfo.duration)}</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">Formato</p>
                    <p className="mt-1">{formatContainer(videoInfo.format)}</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">Códec</p>
                    <p className="mt-1">{formatCodec(videoInfo.codec)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-lg font-semibold">
                  Configuración de salida
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Resolución</p>
                    <p className="mt-1">1080p</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">FPS</p>
                    <p className="mt-1">30 FPS</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">Formato</p>
                    <p className="mt-1">MP4</p>
                  </div>

                  <div>
                    <p className="text-zinc-500">Audio</p>
                    <p className="mt-1">AAC</p>
                  </div>
                </div>
                {!processedFileName && (
                  <button
                    type="button"
                    onClick={processVideo}
                    disabled={processing}
                    className="mt-6 w-full rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processing ? "Procesando..." : "Mejorar video"}
                  </button>
                )}
                {processedFileName && (
                  <div className="mt-6 rounded-lg border border-green-900 bg-green-950 p-4 text-center">
                    <p className="text-sm text-green-300">
                      Video procesado correctamente
                    </p>

                    <a
                      href={`http://localhost:3333/api/videos/download/${processedFileName}`}
                      download={processedFileName}
                      className="mt-4 inline-block rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-zinc-200"
                    >
                      Descargar video
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
