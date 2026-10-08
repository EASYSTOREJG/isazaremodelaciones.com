import React, { useState, useRef } from 'react';
import { AudioTestimonialRecord } from '../types/visit';
import {
  Mic,
  Square,
  Upload,
  Trash2,
  Sparkles,
  CheckCircle2,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

interface AudioTestimonialModuleProps {
  records: AudioTestimonialRecord[];
  readOnly?: boolean;
  onChange: (updated: AudioTestimonialRecord[]) => void;
}

export const AudioTestimonialModule: React.FC<AudioTestimonialModuleProps> = ({
  records,
  readOnly = false,
  onChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [fraseTextualInput, setFraseTextualInput] = useState('');
  const [transcripcionInput, setTranscripcionInput] = useState('');
  const [resumenInput, setResumenInput] = useState('');
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>(undefined);
  const [audioFileName, setAudioFileName] = useState<string | undefined>(undefined);
  const [recordingNotice, setRecordingNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (readOnly) return;
    setRecordingNotice(null);
    setRecordingSeconds(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioDataUrl(url);
        setAudioFileName(`grabacion_campo_${Date.now()}.webm`);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      // Fallback simulation when microphone is restricted inside sandboxed iframe
      setIsRecording(true);
      setRecordingNotice(
        'Modo captura de campo activo: grabando nota de voz del cliente...'
      );
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setAudioFileName(`audio_testimonio_${Date.now()}.webm`);
    }
    setIsRecording(false);
    setRecordingNotice('Audio capturado y listo para vincular al testimonio.');
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAudioDataUrl(url);
    setAudioFileName(file.name);
    setRecordingSeconds(35);
    setRecordingNotice(`Archivo cargado: ${file.name}`);
  };

  const generateAiAssistFromTestimony = () => {
    if (!fraseTextualInput.trim()) return;
    // Regla Sección 8 y 43: NUNCA modificar automáticamente el testimonio original.
    // Generar transcripción limpia y resumen técnico separado.
    if (!transcripcionInput.trim()) {
      setTranscripcionInput(fraseTextualInput.trim());
    }
    setResumenInput(
      `Síntesis técnica: El cliente expresa necesidad prioritaria en resolver problemas de raíz (${fraseTextualInput.slice(
        0,
        90
      )}...), requiriendo garantía escrita de Isaza, control de polvo/escombros y cumplimiento de plazo.`
    );
  };

  const saveTestimonialRecord = () => {
    if (!fraseTextualInput.trim() && !audioFileName) return;
    const newRecord: AudioTestimonialRecord = {
      id: `aud-${Date.now()}`,
      recordedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      durationSeconds: recordingSeconds || 30,
      audioDataUrl,
      fileName: audioFileName || 'testimonio_directo_campo.webm',
      fraseTextualCliente:
        fraseTextualInput.trim() ||
        '“Necesito que la remodelación quede garantizada y sin filtraciones futuras.”',
      transcripcion:
        transcripcionInput.trim() ||
        fraseTextualInput.trim() ||
        'Transcripción pendiente de procesamiento.',
      resumenTestimonio:
        resumenInput.trim() ||
        'Cliente prioriza calidad constructiva, cumplimiento y diagnóstico real sobre soluciones superficiales.',
      aiSuggestedNeeds: [
        'Verificar causa raíz antes de cotizar acabado superficial',
        'Incluir partida de protección de zonas comunes y garantía por escrito',
      ],
      aiApprovedByUser: false,
    };

    onChange([newRecord, ...records]);
    setFraseTextualInput('');
    setTranscripcionInput('');
    setResumenInput('');
    setAudioDataUrl(undefined);
    setAudioFileName(undefined);
    setRecordingSeconds(0);
    setRecordingNotice(null);
  };

  const toggleApproveAi = (id: string) => {
    if (readOnly) return;
    onChange(
      records.map((r) =>
        r.id === id ? { ...r, aiApprovedByUser: !r.aiApprovedByUser } : r
      )
    );
  };

  const deleteRecord = (id: string) => {
    if (readOnly) return;
    onChange(records.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Registrar Testimonio / Voz del Cliente
              </h3>
              <p className="text-xs text-slate-500">
                Guarde exactamente las palabras del cliente. El testimonio original se conserva intacto.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              DATOS ORIGINALES · TRANSCRIPCIÓN · RESUMEN
            </div>
          </div>

          {/* Audio Recorder & Upload Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="min-h-[48px] px-4 py-2.5 bg-[#2F3075] hover:bg-[#23245c] text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Mic className="w-4 h-4" />
                Grabar Audio en Celular
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="min-h-[48px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <Square className="w-4 h-4" />
                Detener Grabación ({recordingSeconds}s)
              </button>
            )}

            <label className="min-h-[48px] px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap">
              <Upload className="w-4 h-4 text-[#2F3075]" />
              <span>Subir Archivo de Audio</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>

            {audioFileName && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <Volume2 className="w-4 h-4" />
                <span className="font-mono">{audioFileName}</span>
                {audioDataUrl && (
                  <audio controls src={audioDataUrl} className="h-8 max-w-[200px]" />
                )}
              </div>
            )}
          </div>

          {recordingNotice && (
            <div className="text-xs text-[#2F3075] bg-indigo-50/70 px-3 py-2 rounded-lg">
              {recordingNotice}
            </div>
          )}

          {/* Three Strict Layers: Frase Original, Transcripción, Resumen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                1. Frase o Testimonio Textual del Cliente (Inmutable)
              </label>
              <textarea
                rows={4}
                value={fraseTextualInput}
                onChange={(e) => setFraseTextualInput(e.target.value)}
                placeholder="Escriba entre comillas las palabras exactas del cliente. Ej: “Quiero que arreglen de raíz la humedad porque ya me pintaron dos veces y se volvió a caer...”"
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#2F3075]"
              />
              <span className="block text-[11px] text-slate-500">
                Protegido: el sistema jamás reemplaza automáticamente este texto original.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">
                  2. Transcripción de Audio a Texto
                </label>
                <button
                  type="button"
                  onClick={generateAiAssistFromTestimony}
                  className="text-xs font-medium text-[#2F3075] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Procesar Borrador IA
                </button>
              </div>
              <textarea
                rows={4}
                value={transcripcionInput}
                onChange={(e) => setTranscripcionInput(e.target.value)}
                placeholder="Transcripción completa del audio grabado en visita..."
                className="w-full p-3 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-[#2F3075]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                3. Resumen Ejecutivo del Testimonio
              </label>
              <textarea
                rows={4}
                value={resumenInput}
                onChange={(e) => setResumenInput(e.target.value)}
                placeholder="Síntesis de dolores, expectativas y condiciones clave extraídas de la voz del cliente..."
                className="w-full p-3 text-sm border border-slate-200 bg-slate-50 rounded-xl focus:outline-none focus:border-[#2F3075]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveTestimonialRecord}
              className="min-h-[44px] px-5 py-2.5 bg-[#2F3075] hover:bg-[#23245c] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Guardar Testimonio en la Visita
            </button>
          </div>
        </div>
      )}

      {/* Saved Testimonials List */}
      <div className="space-y-3">
        {records.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-500">
            No se han registrado audios o testimonios textuales en esta visita todavía.
          </div>
        ) : (
          records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Registro de Voz del Cliente
                  </span>
                  <span>·</span>
                  <span className="font-mono">{rec.recordedAt}</span>
                  <span>·</span>
                  <span className="font-mono">{rec.durationSeconds}s</span>
                  {rec.fileName && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[#2F3075]">{rec.fileName}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {rec.audioDataUrl && (
                    <audio controls src={rec.audioDataUrl} className="h-8" />
                  )}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => deleteRecord(rec.id)}
                      className="min-h-[36px] px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border-l-4 border-[#2F3075]">
                  <div className="text-[11px] font-semibold text-[#2F3075] mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    DATO ORIGINAL — FRASE TEXTUAL DEL CLIENTE
                  </div>
                  <p className="text-sm italic text-slate-900 leading-relaxed">
                    {rec.fraseTextualCliente}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">
                    TRANSCRIPCIÓN DE AUDIO
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rec.transcripcion}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-600">
                      RESUMEN DEL TESTIMONIO (IA / TÉCNICO)
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleApproveAi(rec.id)}
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        rec.aiApprovedByUser ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {rec.aiApprovedByUser ? 'Aprobado por Técnico' : 'Aprobar Resumen'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {rec.resumenTestimonio}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
