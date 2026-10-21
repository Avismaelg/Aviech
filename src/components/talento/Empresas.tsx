import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import {
  ESTADOS_EMPRESA_TALENTO,
  colorEstadoEmpresaTalento,
  etiquetaEstadoEmpresaTalento,
} from '../../lib/etiquetas'
import { iniciales } from '../../lib/formato'
import type { EmpresaTalento } from '../../types/talento'
import {
  AreaTexto,
  Boton,
  BotonIcono,
  Campo,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Insignia,
  Modal,
  Selector,
  Tarjeta,
  Vacio,
} from '../ui'
import type { PropsEmpresasTalento } from './tipos'

interface FormularioEmpresaTalento {
  nombre: string
  sector: string
  sitio_web: string
  ubicacion: string
  contacto_nombre: string
  contacto_email: string
  contacto_telefono: string
  estado: string
  consentimiento: boolean
  notas: string
}

const FORMULARIO_VACIO: FormularioEmpresaTalento = {
  nombre: '',
  sector: '',
  sitio_web: '',
  ubicacion: '',
  contacto_nombre: '',
  contacto_email: '',
  contacto_telefono: '',
  estado: 'activa',
  consentimiento: true,
  notas: '',
}

export function EmpresasTalento({
  empresas,
  vacantes,
  postulaciones,
  refrescar,
  onIrAVacantes,
}: PropsEmpresasTalento) {
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioEmpresaTalento>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<EmpresaTalento | null>(null)
  const [guardando, setGuardando] = useState(false)

  const vacantesPorEmpresa = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const vacante of vacantes) {
      mapa.set(vacante.empresa_id, (mapa.get(vacante.empresa_id) ?? 0) + 1)
    }
    return mapa
  }, [vacantes])

  const procesosPorEmpresa = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const proceso of postulaciones) {
      if (['contratada', 'rechazada'].includes(proceso.etapa)) continue
      mapa.set(proceso.empresa_id, (mapa.get(proceso.empresa_id) ?? 0) + 1)
    }
    return mapa
  }, [postulaciones])

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return empresas.filas.filter((empresa) => {
      if (!texto) return true
      return [
        empresa.nombre,
        empresa.sector,
        empresa.ubicacion,
        empresa.contacto_nombre,
        empresa.contacto_email,
        empresa.contacto_telefono,
        empresa.sitio_web,
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [empresas.filas, busqueda])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario(FORMULARIO_VACIO)
    setModalAbierto(true)
  }

  function abrirEdicion(empresa: EmpresaTalento) {
    setEditandoId(empresa.id)
    setFormulario({
      nombre: empresa.nombre,
      sector: empresa.sector ?? '',
      sitio_web: empresa.sitio_web ?? '',
      ubicacion: empresa.ubicacion ?? '',
      contacto_nombre: empresa.contacto_nombre,
      contacto_email: empresa.contacto_email,
      contacto_telefono: empresa.contacto_telefono ?? '',
      estado: empresa.estado,
      consentimiento: empresa.consentimiento,
      notas: empresa.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando) return
    if (!formulario.nombre.trim() || !formulario.contacto_nombre.trim() || !formulario.contacto_email.trim()) return
    setGuardando(true)
    const guardado = await empresas.guardar(
      {
        nombre: formulario.nombre.trim(),
        sector: formulario.sector.trim() || null,
        sitio_web: formulario.sitio_web.trim() || null,
        ubicacion: formulario.ubicacion.trim() || null,
        contacto_nombre: formulario.contacto_nombre.trim(),
        contacto_email: formulario.contacto_email.trim().toLowerCase(),
        contacto_telefono: formulario.contacto_telefono.trim() || null,
        estado: formulario.estado,
        consentimiento: formulario.consentimiento,
        notas: formulario.notas.trim() || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  async function eliminarEmpresa() {
    if (!porEliminar) return
    await empresas.eliminar(porEliminar.id)
    setPorEliminar(null)
    await refrescar()
  }

  function abrirSitio(url: string) {
    const destino = /^https?:\/\//i.test(url) ? url : `https://${url}`
    window.open(destino, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por empresa, sector o contacto…"
            className="pl-9"
          />
        </div>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nueva empresa
        </Boton>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtradas.length} empresa{filtradas.length === 1 ? '' : 's'} en pantalla
      </p>

      <Tarjeta>
        {empresas.error && <ErrorTabla mensaje={empresas.error} />}
        {empresas.cargando && !empresas.error && <FilasCargando />}
        {!empresas.cargando && !empresas.error && filtradas.length === 0 && (
          empresas.filas.length === 0 ? (
            <Vacio
              icono={<Building2 size={22} />}
              titulo="Todavía no hay empresas empleadoras"
              texto="Registra una empresa o recibe su perfil desde el portal para publicar vacantes y gestionar solicitudes."
              accion={
                <Boton variante="secundario" onClick={abrirNuevo}>
                  <Plus size={16} /> Registrar empresa
                </Boton>
              }
            />
          ) : (
            <Vacio
              icono={<Search size={22} />}
              titulo="Sin resultados"
              texto="Prueba otra búsqueda."
              accion={
                <Boton variante="secundario" onClick={() => setBusqueda('')}>
                  Limpiar búsqueda
                </Boton>
              }
            />
          )
        )}

        {!empresas.cargando && !empresas.error && filtradas.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtradas.map((empresa) => {
              const numVacantes = vacantesPorEmpresa.get(empresa.id) ?? 0
              const numProcesos = procesosPorEmpresa.get(empresa.id) ?? 0
              return (
                <li
                  key={empresa.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-arena text-xs font-semibold text-clay">
                    {iniciales(empresa.nombre)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-tinta">{empresa.nombre}</p>
                      <Insignia color={colorEstadoEmpresaTalento[empresa.estado]}>
                        {etiquetaEstadoEmpresaTalento[empresa.estado] ?? empresa.estado}
                      </Insignia>
                      {empresa.consentimiento && <Insignia color="blue">Portal</Insignia>}
                    </div>
                    <p className="truncate text-xs text-tinta-suave">
                      {[empresa.sector, empresa.ubicacion, empresa.sitio_web].filter(Boolean).join(' · ') ||
                        'Sin datos de la empresa'}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-tinta-tenue">
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={11} /> {empresa.contacto_nombre}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Mail size={11} /> {empresa.contacto_email}
                      </span>
                      {empresa.contacto_telefono && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={11} /> {empresa.contacto_telefono}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-tinta-tenue">
                      {numVacantes} vacante{numVacantes === 1 ? '' : 's'} · {numProcesos} proceso
                      {numProcesos === 1 ? '' : 's'} activo{numProcesos === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {empresa.sitio_web && (
                      <BotonIcono etiqueta="Abrir sitio web" onClick={() => abrirSitio(empresa.sitio_web ?? '')}>
                        <ExternalLink size={15} />
                      </BotonIcono>
                    )}
                    {numVacantes > 0 && (
                      <BotonIcono etiqueta="Ver vacantes" onClick={onIrAVacantes}>
                        <BriefcaseBusiness size={15} />
                      </BotonIcono>
                    )}
                    <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(empresa)}>
                      <Pencil size={15} />
                    </BotonIcono>
                    <BotonIcono
                      etiqueta="Eliminar"
                      onClick={() => setPorEliminar(empresa)}
                      className="hover:bg-peligro-suave hover:text-peligro"
                    >
                      <Trash2 size={15} />
                    </BotonIcono>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar empresa empleadora' : 'Nueva empresa empleadora'}
        onCerrar={() => setModalAbierto(false)}
        ancho="sm:max-w-2xl"
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre de la empresa *" className="sm:col-span-2">
            <Entrada
              required
              maxLength={160}
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              placeholder="Ej. Grupo del Norte SRL"
            />
          </Campo>
          <Campo etiqueta="Sector">
            <Entrada
              maxLength={120}
              value={formulario.sector}
              onChange={(evento) => setFormulario({ ...formulario, sector: evento.target.value })}
              placeholder="Finanzas, salud, retail…"
            />
          </Campo>
          <Campo etiqueta="Ubicación">
            <Entrada
              maxLength={160}
              value={formulario.ubicacion}
              onChange={(evento) => setFormulario({ ...formulario, ubicacion: evento.target.value })}
              placeholder="Santo Domingo, RD"
            />
          </Campo>
          <Campo etiqueta="Sitio web" className="sm:col-span-2">
            <Entrada
              inputMode="url"
              maxLength={300}
              value={formulario.sitio_web}
              onChange={(evento) => setFormulario({ ...formulario, sitio_web: evento.target.value })}
              placeholder="https://tuempresa.com"
            />
          </Campo>
          <Campo etiqueta="Contacto *">
            <Entrada
              required
              maxLength={120}
              value={formulario.contacto_nombre}
              onChange={(evento) => setFormulario({ ...formulario, contacto_nombre: evento.target.value })}
              placeholder="Nombre y apellido"
            />
          </Campo>
          <Campo etiqueta="Correo del contacto *">
            <Entrada
              required
              type="email"
              maxLength={160}
              value={formulario.contacto_email}
              onChange={(evento) => setFormulario({ ...formulario, contacto_email: evento.target.value })}
              placeholder="rrhh@empresa.com"
            />
          </Campo>
          <Campo etiqueta="Teléfono del contacto">
            <Entrada
              type="tel"
              maxLength={40}
              value={formulario.contacto_telefono}
              onChange={(evento) => setFormulario({ ...formulario, contacto_telefono: evento.target.value })}
              placeholder="809 555 0101"
            />
          </Campo>
          <Campo etiqueta="Estado">
            <Selector
              value={formulario.estado}
              onChange={(evento) => setFormulario({ ...formulario, estado: evento.target.value })}
            >
              {ESTADOS_EMPRESA_TALENTO.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstadoEmpresaTalento[estado]}
                </option>
              ))}
            </Selector>
          </Campo>
          <label className="flex items-start gap-2.5 rounded-[18px] border border-arena-borde bg-arena/50 p-3 text-xs leading-relaxed text-tinta-suave sm:col-span-2">
            <input
              type="checkbox"
              checked={formulario.consentimiento}
              onChange={(evento) => setFormulario({ ...formulario, consentimiento: evento.target.checked })}
              className="mt-0.5 h-4 w-4 rounded border-borde accent-acento"
            />
            La empresa autoriza el uso de estos datos para gestionar vacantes y procesos de selección.
          </label>
          <Campo etiqueta="Notas internas" className="sm:col-span-2">
            <AreaTexto
              maxLength={2000}
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Contexto, cultura, condiciones, historial…"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear empresa'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar empresa empleadora"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarEmpresa()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar <strong className="text-tinta">{porEliminar.nombre}</strong>? Se eliminarán
              sus vacantes y todos sus procesos de selección. Esta acción no se puede deshacer.
            </>
          ) : null
        }
      />
    </div>
  )
}
