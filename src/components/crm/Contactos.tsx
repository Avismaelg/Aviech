import { Building2, Pencil, Plus, Search, Trash2, UserRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { iniciales } from '../../lib/formato'
import type { ContactoCrm } from '../../types/crm'
import {
  AreaTexto,
  Boton,
  BotonIcono,
  Campo,
  Confirmar,
  Entrada,
  ErrorTabla,
  FilasCargando,
  Modal,
  Selector,
  Tarjeta,
  Vacio,
} from '../ui'
import type { PropsContactos } from './tipos'

interface FormularioContacto {
  empresa_id: string
  nombre: string
  cargo: string
  email: string
  telefono: string
  linkedin: string
  notas: string
}

const FORMULARIO_VACIO: FormularioContacto = {
  empresa_id: '',
  nombre: '',
  cargo: '',
  email: '',
  telefono: '',
  linkedin: '',
  notas: '',
}

export function Contactos({ contactos, empresas, refrescar, onIrAEmpresas }: PropsContactos) {
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<FormularioContacto>(FORMULARIO_VACIO)
  const [porEliminar, setPorEliminar] = useState<ContactoCrm | null>(null)
  const [guardando, setGuardando] = useState(false)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return contactos.filas.filter((contacto) => {
      if (!texto) return true
      return [
        contacto.nombre,
        contacto.cargo,
        contacto.email,
        contacto.telefono,
        contacto.linkedin,
        contacto.crm_empresas?.nombre,
      ].some((valor) => valor?.toLowerCase().includes(texto))
    })
  }, [contactos.filas, busqueda])

  function abrirNuevo() {
    setEditandoId(null)
    setFormulario({ ...FORMULARIO_VACIO, empresa_id: empresas.length === 1 ? empresas[0].id : '' })
    setModalAbierto(true)
  }

  function abrirEdicion(contacto: ContactoCrm) {
    setEditandoId(contacto.id)
    setFormulario({
      empresa_id: contacto.empresa_id,
      nombre: contacto.nombre,
      cargo: contacto.cargo ?? '',
      email: contacto.email ?? '',
      telefono: contacto.telefono ?? '',
      linkedin: contacto.linkedin ?? '',
      notas: contacto.notas ?? '',
    })
    setModalAbierto(true)
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (guardando || !formulario.nombre.trim() || !formulario.empresa_id) return
    setGuardando(true)
    const guardado = await contactos.guardar(
      {
        empresa_id: formulario.empresa_id,
        nombre: formulario.nombre.trim(),
        cargo: formulario.cargo.trim() || null,
        email: formulario.email.trim() || null,
        telefono: formulario.telefono.trim() || null,
        linkedin: formulario.linkedin.trim() || null,
        notas: formulario.notas.trim() || null,
      },
      editandoId ?? undefined,
    )
    setGuardando(false)
    if (guardado) setModalAbierto(false)
  }

  async function eliminarContacto() {
    if (!porEliminar) return
    await contactos.eliminar(porEliminar.id)
    setPorEliminar(null)
    await refrescar()
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-tenue" />
          <Entrada
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre, cargo, empresa o correo…"
            className="pl-9"
          />
        </div>
        <Boton onClick={abrirNuevo}>
          <Plus size={16} /> Nuevo contacto
        </Boton>
      </div>

      {empresas.length === 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Los contactos pertenecen a una empresa. Crea una primero en{' '}
          <button type="button" onClick={onIrAEmpresas} className="font-medium underline underline-offset-2">
            Empresas
          </button>
          .
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {filtrados.length} contacto{filtrados.length === 1 ? '' : 's'} en pantalla
      </p>

      <Tarjeta>
        {contactos.error && <ErrorTabla mensaje={contactos.error} />}
        {contactos.cargando && !contactos.error && <FilasCargando />}
        {!contactos.cargando && !contactos.error && filtrados.length === 0 && (
          contactos.filas.length === 0 ? (
            <Vacio
              icono={empresas.length === 0 ? <Building2 size={22} /> : <UserRound size={22} />}
              titulo={empresas.length === 0 ? 'Primero crea una empresa' : 'Todavía no hay contactos'}
              texto={
                empresas.length === 0
                  ? 'Cada contacto pertenece a una empresa. Registra la empresa y luego a sus personas.'
                  : 'Agrega a las personas con las que hablas en cada empresa.'
              }
              accion={
                empresas.length === 0 ? (
                  <Boton variante="secundario" onClick={onIrAEmpresas}>
                    <Building2 size={16} /> Ir a Empresas
                  </Boton>
                ) : (
                  <Boton variante="secundario" onClick={abrirNuevo}>
                    <Plus size={16} /> Nuevo contacto
                  </Boton>
                )
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
        {!contactos.cargando && !contactos.error && filtrados.length > 0 && (
          <ul className="divide-y divide-borde-suave">
            {filtrados.map((contacto) => (
              <li key={contacto.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-semibold text-cyan-700">
                  {iniciales(contacto.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-tinta">{contacto.nombre}</p>
                  <p className="truncate text-xs text-tinta-suave">
                    {[contacto.cargo, contacto.crm_empresas?.nombre].filter(Boolean).join(' · ') || 'Sin cargo'}
                  </p>
                  <p className="truncate text-[11px] text-tinta-tenue">
                    {[contacto.email, contacto.telefono, contacto.linkedin].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <BotonIcono etiqueta="Editar" onClick={() => abrirEdicion(contacto)}>
                    <Pencil size={15} />
                  </BotonIcono>
                  <BotonIcono
                    etiqueta="Eliminar"
                    onClick={() => setPorEliminar(contacto)}
                    className="hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 size={15} />
                  </BotonIcono>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <Modal
        abierto={modalAbierto}
        titulo={editandoId ? 'Editar contacto' : 'Nuevo contacto'}
        onCerrar={() => setModalAbierto(false)}
      >
        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Empresa *" className="sm:col-span-2">
            <Selector
              required
              value={formulario.empresa_id}
              onChange={(evento) => setFormulario({ ...formulario, empresa_id: evento.target.value })}
            >
              <option value="">Selecciona una empresa…</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </Selector>
          </Campo>
          {empresas.length === 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 sm:col-span-2">
              No hay empresas registradas.{' '}
              <button
                type="button"
                onClick={() => {
                  setModalAbierto(false)
                  onIrAEmpresas()
                }}
                className="font-medium underline underline-offset-2"
              >
                Crear una empresa
              </button>
            </p>
          )}
          <Campo etiqueta="Nombre *">
            <Entrada
              required
              value={formulario.nombre}
              onChange={(evento) => setFormulario({ ...formulario, nombre: evento.target.value })}
              placeholder="Nombre y apellidos"
            />
          </Campo>
          <Campo etiqueta="Cargo">
            <Entrada
              value={formulario.cargo}
              onChange={(evento) => setFormulario({ ...formulario, cargo: evento.target.value })}
              placeholder="Gerente, contador, dueño…"
            />
          </Campo>
          <Campo etiqueta="Correo">
            <Entrada
              type="email"
              value={formulario.email}
              onChange={(evento) => setFormulario({ ...formulario, email: evento.target.value })}
              placeholder="nombre@correo.com"
            />
          </Campo>
          <Campo etiqueta="Teléfono">
            <Entrada
              value={formulario.telefono}
              onChange={(evento) => setFormulario({ ...formulario, telefono: evento.target.value })}
              placeholder="809 555 1234"
            />
          </Campo>
          <Campo etiqueta="LinkedIn" className="sm:col-span-2">
            <Entrada
              value={formulario.linkedin}
              onChange={(evento) => setFormulario({ ...formulario, linkedin: evento.target.value })}
              placeholder="https://linkedin.com/in/…"
            />
          </Campo>
          <Campo etiqueta="Notas" className="sm:col-span-2">
            <AreaTexto
              value={formulario.notas}
              onChange={(evento) => setFormulario({ ...formulario, notas: evento.target.value })}
              placeholder="Preferencias, horarios, contexto…"
            />
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Boton variante="secundario" type="button" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Boton>
            <Boton type="submit" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Crear contacto'}
            </Boton>
          </div>
        </form>
      </Modal>

      <Confirmar
        abierto={porEliminar !== null}
        titulo="Eliminar contacto"
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={() => {
          void eliminarContacto()
        }}
        mensaje={
          porEliminar ? (
            <>
              ¿Seguro que quieres eliminar a <strong className="text-tinta">{porEliminar.nombre}</strong>? Las
              oportunidades y actividades vinculadas quedarán sin contacto.
            </>
          ) : null
        }
      />
    </div>
  )
}
