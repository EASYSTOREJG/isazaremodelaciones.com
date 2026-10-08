import React, { useState } from 'react';
import {
  TechnicalVisit,
  MaterialCatalogItem,
  MeasureUnit,
  QualityLevel,
} from '../types/visit';
import { ALL_UNITS, ISAZA_ADVISORS } from '../data/initialData';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Edit3,
  Download,
  Database,
  Code2,
  ShieldCheck,
  Copy,
  Check,
  Search,
} from 'lucide-react';

interface CalendarViewProps {
  visits: TechnicalVisit[];
  onSelectVisit: (visitId: string) => void;
  onCreateNewVisit: (defaultDate?: string) => void;
  onUpdateVisit: (updated: TechnicalVisit, logMsg?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  visits,
  onSelectVisit,
  onCreateNewVisit,
  onUpdateVisit,
}) => {
  const [rescheduleVisitId, setRescheduleVisitId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newAdvisor, setNewAdvisor] = useState('');

  const sortedVisits = [...visits].sort((a, b) =>
    `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
  );

  const exportIcsCalendar = (v: TechnicalVisit) => {
    const cleanDate = v.fecha.replace(/-/g, '');
    const cleanTime = v.hora.replace(':', '') + '00';
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Isaza Remodelaciones y Acabados//Visitas Tecnicas//ES',
      'BEGIN:VEVENT',
      `UID:${v.codigo}@isazaremodelaciones.com`,
      `SUMMARY:Visita Técnica ${v.codigo} - ${v.cliente}`,
      `DESCRIPTION:Servicios: ${v.serviciosSolicitados.join(', ')}. Asesor: ${v.asesorTecnico}`,
      `LOCATION:${v.direccion}, ${v.localidadMunicipio}`,
      `DTSTART:${cleanDate}T${cleanTime}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${v.codigo}_agenda_isaza.ics`;
    link.click();
  };

  const handleSaveReschedule = (v: TechnicalVisit) => {
    onUpdateVisit(
      {
        ...v,
        fecha: newDate || v.fecha,
        hora: newTime || v.hora,
        asesorTecnico: newAdvisor || v.asesorTecnico,
        estado: 'Programada',
      },
      `Visita reprogramada para ${newDate || v.fecha} a las ${newTime || v.hora} (${
        newAdvisor || v.asesorTecnico
      })`
    );
    setRescheduleVisitId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Calendario y Programación de Visitas Técnicas
          </h2>
          <p className="text-xs text-slate-500">
            Gestione la agenda de asesores en Bogotá y Sabana, reprograme citas o sincronice con Google Calendar / Outlook (.ics).
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCreateNewVisit('2026-10-08')}
          className="min-h-[44px] px-4 py-2 bg-[#2F3075] hover:bg-[#23245c] text-white rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agendar Visita en Calendario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVisits.map((v) => {
          const isEditing = rescheduleVisitId === v.id;
          return (
            <div
              key={v.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="font-bold text-[#2F3075]">{v.codigo}</span>
                  <span>·</span>
                  <span>{v.estado}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-mono font-semibold text-slate-900">
                  <CalendarIcon className="w-4 h-4 text-[#2F3075]" />
                  <span>{v.fecha}</span>
                  <span>·</span>
                  <Clock className="w-4 h-4 text-[#2F3075]" />
                  <span>{v.hora} hrs</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {v.cliente}
                </h3>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {v.direccion} ({v.localidadMunicipio})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Técnico: {v.asesorTecnico}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-1">
                  Servicios: {v.serviciosSolicitados.join(' · ')}
                </div>
              </div>

              {isEditing ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                  <div className="text-xs font-semibold text-slate-800">
                    Reprogramar / Reasignar Visita
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="min-h-[38px] px-2 py-1 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="min-h-[38px] px-2 py-1 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <select
                    value={newAdvisor}
                    onChange={(e) => setNewAdvisor(e.target.value)}
                    className="w-full min-h-[38px] px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {ISAZA_ADVISORS.map((adv) => (
                      <option key={adv} value={adv}>
                        {adv}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRescheduleVisitId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveReschedule(v)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#2F3075] text-white rounded-lg"
                    >
                      Guardar Cambio
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectVisit(v.id)}
                    className="min-h-[38px] px-3 py-1.5 bg-[#2F3075] text-white rounded-lg text-xs font-semibold hover:bg-[#23245c]"
                  >
                    Abrir Ficha
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleVisitId(v.id);
                        setNewDate(v.fecha);
                        setNewTime(v.hora);
                        setNewAdvisor(v.asesorTecnico);
                      }}
                      className="min-h-[38px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Reprogramar
                    </button>
                    <button
                      type="button"
                      onClick={() => exportIcsCalendar(v)}
                      className="min-h-[38px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      title="Exportar a Google Calendar / Outlook"
                    >
                      <Download className="w-3.5 h-3.5" />
                      .ICS
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface MaterialsCatalogViewProps {
  catalog: MaterialCatalogItem[];
  onAddCatalogItem: (item: MaterialCatalogItem) => void;
}

export const MaterialsCatalogView: React.FC<MaterialsCatalogViewProps> = ({
  catalog,
  onAddCatalogItem,
}) => {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Pisos y Enchapes');
  const [material, setMaterial] = useState('');
  const [marca, setMarca] = useState('');
  const [referencia, setReferencia] = useState('');
  const [unidad, setUnidad] = useState<MeasureUnit>('m²');
  const [calidad, setCalidad] = useState<QualityLevel>('Superior');
  const [proveedor, setProveedor] = useState('');
  const [precioReferencia, setPrecioReferencia] = useState(85000);
  const [observacion, setObservacion] = useState('');

  const filtered = catalog.filter(
    (c) =>
      c.material.toLowerCase().includes(search.toLowerCase()) ||
      c.categoria.toLowerCase().includes(search.toLowerCase()) ||
      c.marca.toLowerCase().includes(search.toLowerCase()) ||
      c.referencia.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.trim()) return;
    onAddCatalogItem({
      id: `MAT-${Date.now().toString().slice(-4)}`,
      categoria,
      material: material.trim(),
      marca: marca.trim() || 'Estándar Isaza',
      referencia: referencia.trim() || 'Ref. General',
      unidad,
      calidad,
      proveedor: proveedor.trim() || 'Proveedor Autorizado Bogotá',
      precioReferencia,
      observacion: observacion.trim(),
    });
    setMaterial('');
    setMarca('');
    setReferencia('');
    setObservacion('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Catálogo Maestro de Materiales y Especificaciones Isaza
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Este catálogo alimenta la selección rápida en campo y la estructura futura de precios unitarios para cotizaciones.
        </p>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Categoría (ej: Impermeabilización)"
            className="min-h-[42px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Nombre del Material *"
            required
            className="min-h-[42px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Marca (ej: Sika / Pintuco / Corona)"
            className="min-h-[42px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Referencia técnica"
            className="min-h-[42px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value as MeasureUnit)}
            className="min-h-[42px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            {ALL_UNITS.map((u) => (
              <option key={u} value={u}>
                Unidad: {u}
              </option>
            ))}
          </select>
          <select
            value={calidad}
            onChange={(e) => setCalidad(e.target.value as QualityLevel)}
            className="min-h-[42px] px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="Estándar">Calidad: Estándar</option>
            <option value="Superior">Calidad: Superior</option>
            <option value="Premium">Calidad: Premium</option>
          </select>
          <input
            type="number"
            value={precioReferencia}
            onChange={(e) => setPrecioReferencia(Number(e.target.value) || 0)}
            placeholder="Precio Ref. COP"
            className="min-h-[42px] px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
          />
          <button
            type="submit"
            className="min-h-[42px] px-4 py-2 bg-[#2F3075] hover:bg-[#23245c] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Agregar al Catálogo
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por material, marca, categoría o referencia..."
              className="w-full min-h-[40px] pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg"
            />
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filtered.length} materiales registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Material / Especificación</th>
                <th className="py-2.5 px-3">Marca & Ref.</th>
                <th className="py-2.5 px-3">Calidad</th>
                <th className="py-2.5 px-3">Unidad</th>
                <th className="py-2.5 px-3 text-right">Precio Ref. (COP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-semibold text-[#2F3075]">
                    {item.id}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{item.categoria}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{item.material}</div>
                    {item.observacion && (
                      <div className="text-[11px] text-slate-500">{item.observacion}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {item.marca} · <span className="font-mono">{item.referencia}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{item.calidad}</td>
                  <td className="py-3 px-3 font-mono">{item.unidad}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    ${item.precioReferencia.toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const ArchitectureBlueprintView: React.FC = () => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const sqlSchema = `-- ESTRUCTURA RELACIONAL DE BASE DE DATOS: ISAZA VISITAS TÉCNICAS (MySQL / MariaDB / WordPress Custom Tables)
CREATE TABLE wp_isaza_visits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(32) NOT NULL UNIQUE, -- Ej: VT-2026-00125
  client_id BIGINT UNSIGNED NOT NULL,
  advisor_user_id BIGINT UNSIGNED NOT NULL,
  commercial_user_id BIGINT UNSIGNED,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  tipo_inmueble VARCHAR(60) NOT NULL,
  localidad_municipio VARCHAR(120),
  estado VARCHAR(50) NOT NULL DEFAULT 'Solicitud recibida',
  origen_cliente VARCHAR(100),
  punto_dolor_cliente TEXT,
  sueno_resultado_esperado TEXT,
  rango_presupuesto VARCHAR(80),
  incluye_materiales VARCHAR(20),
  presupuesto_ideal_cop DECIMAL(15,2) DEFAULT 0,
  fecha_deseada_inicio DATE,
  fecha_limite DATE,
  nivel_urgencia VARCHAR(40),
  puntaje_comercial INT DEFAULT 0,
  prioridad_comercial VARCHAR(40),
  recomendacion_isaza_json LONGTEXT,
  checklist_json LONGTEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tablas Relacionales Hijas (1:N):
-- 1. users (Roles: ADMINISTRADOR, ASESOR_TECNICO, ADMINISTRATIVO)
-- 2. clients (Datos de contacto, WhatsApp, historial de inmuebles)
-- 3. visit_areas (Solicitud cliente vs Diagnóstico técnico vs Recomendación por área)
-- 4. measurements (Largo, Ancho, Altura, m2, m3, ml, bloqueo de override manual y JSON de croquis)
-- 5. photos & videos (Evidencia categorizada por área y patología)
-- 6. audio_records & testimonials (Audio original intacto + Transcripción + Resumen IA aprobado)
-- 7. current_conditions & desired_conditions (Matriz automática HOY -> PROPUESTA)
-- 8. activities & materials (Partidas vinculadas a catálogo de precios unitarios)
-- 9. risks (Alertas con severidad y fotografía asociada)
-- 10. visit_budget, visit_schedule, visit_notes, visit_history (Trazabilidad completa de auditoría)`;

  const wpPluginCode = `<?php
/**
 * Plugin Name: Isaza Remodelaciones - Módulo de Visitas Técnicas
 * Description: Módulo mobile-first de campo para Visitas Técnicas, Diagnóstico, Levantamiento y Cotizaciones.
 * Version: 2.6.0
 * Author: Isaza Remodelaciones y Acabados
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// 1. Shortcode para incrustar el APP interno: [isaza_visitas_tecnicas]
add_shortcode( 'isaza_visitas_tecnicas', function() {
    if ( ! is_user_logged_in() ) {
        return '<div class="isaza-auth-notice">Acceso exclusivo para personal técnico y comercial de Isaza Remodelaciones.</div>';
    }
    wp_enqueue_script( 'isaza-visitas-app', plugin_dir_url( __FILE__ ) . 'dist/assets/index.js', array(), '2.6.0', true );
    wp_localize_script( 'isaza-visitas-app', 'ISAZA_WP_CONFIG', array(
        'rest_url' => esc_url_raw( rest_url( 'isaza/v1/' ) ),
        'nonce'    => wp_create_nonce( 'wp_rest' ),
        'user_id'  => get_current_user_id(),
    ) );
    return '<div id="root" class="isaza-visitas-wrapper"></div>';
});

// 2. Endpoints REST API protegidos con Nonce y Control de Permisos RBAC
add_action( 'rest_api_init', function () {
    register_rest_route( 'isaza/v1', '/visits', array(
        'methods'             => array( 'GET', 'POST' ),
        'callback'            => 'isaza_handle_visits_endpoint',
        'permission_callback' => function () {
            return current_user_can( 'read' );
        },
    ) );
});`;

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
        <h2 className="text-lg font-bold text-slate-900">
          Arquitectura Relacional (18 Entidades), Seguridad y Plugin WordPress Isaza
        </h2>
        <p className="text-xs text-slate-600">
          Especificación lista para producción del módulo de Visitas Técnicas e integración con los módulos de Usuarios, Obras, Herramientas, Materiales y Mantenimiento de Isaza Remodelaciones y Acabados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Database className="w-4 h-4 text-[#2F3075]" />
              <span>Esquema Relacional de Base de Datos (18 Tablas)</span>
            </div>
            <button
              type="button"
              onClick={() => copyText('sql', sqlSchema)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
            >
              {copiedTab === 'sql' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedTab === 'sql' ? 'Copiado' : 'Copiar DDL SQL'}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
            {sqlSchema}
          </pre>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Code2 className="w-4 h-4 text-[#2F3075]" />
              <span>Integración WordPress (Shortcode + REST API + Nonce)</span>
            </div>
            <button
              type="button"
              onClick={() => copyText('wp', wpPluginCode)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
            >
              {copiedTab === 'wp' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedTab === 'wp' ? 'Copiado' : 'Copiar Plugin PHP'}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
            {wpPluginCode}
          </pre>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#2F3075]" />
          <span>Controles de Seguridad, Permisos y Reglas de IA implementados</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900 mb-1">
              Control de Roles (RBAC)
            </div>
            Administrador (acceso total y conversión a obra), Asesor/Técnico (trabajo de campo, fotos, medidas, audio) y Administrativo (consulta y documentos sin alterar diagnósticos técnicos).
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900 mb-1">
              Inmutabilidad de Datos Originales
            </div>
            Las medidas manuales bloqueadas no se sobrescriben sin autorización y el testimonio textual del cliente se almacena separado de la transcripción y del resumen asistido por IA.
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900 mb-1">
              Auditoría e Integración Modular
            </div>
            Cada modificación, cambio de estado, cierre o conversión a Cotización (`COT-2026-XXX`) y Obra (`OB-2026-XXX`) registra usuario, rol y marca de tiempo exacta.
          </div>
        </div>
      </div>
    </div>
  );
};
