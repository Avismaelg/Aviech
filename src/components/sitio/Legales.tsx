import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useEffect } from 'react'
import { cx } from '../../lib/estilos'
import { CONTACTO, SITIO } from '../../lib/sitio'
import { MarcaSitio } from './Secciones'
import { CONTENEDOR, ETIQUETA } from './estilos'

type TipoLegal = 'privacidad' | 'terminos'

interface Bloque {
  titulo: string
  parrafos: string[]
}

interface Documento {
  titulo: string
  descripcion: string
  actualizado: string
  bloques: Bloque[]
}

const DOCUMENTOS: Record<TipoLegal, Documento> = {
  privacidad: {
    titulo: 'Política de privacidad',
    descripcion:
      'Qué datos recibe AviTech a través de este sitio, para qué se usan, con quién se comparten y cómo puedes ejercer tus derechos.',
    actualizado: '21 de octubre de 2026',
    bloques: [
      {
        titulo: 'Responsable del tratamiento',
        parrafos: [
          `${SITIO.nombre}, con domicilio en ${CONTACTO.ubicacion}, es responsable de los datos personales que se reciben a través de este sitio. El canal publicado para consultas y solicitudes es el formulario de contacto.`,
        ],
      },
      {
        titulo: 'Qué datos recopilamos',
        parrafos: [
          'A través del formulario comercial: nombre, empresa (opcional), correo, teléfono (opcional), servicio de interés, descripción del problema, plazo estimado, presupuesto orientativo y la aceptación del consentimiento.',
          'De forma técnica, nuestros proveedores registran la dirección IP, la fecha, el navegador y los eventos necesarios para operar el sitio, prevenir abuso y diagnosticar fallos. No usamos estos registros para publicidad.',
          'El portal de talento tiene su propio formulario y consentimiento. Los datos de candidatos y empresas se tratan por separado, no se mezclan con las solicitudes comerciales y se rigen por esta misma política.',
        ],
      },
      {
        titulo: 'Para qué usamos los datos',
        parrafos: [
          'Responder a la solicitud, preparar un diagnóstico inicial y una propuesta, coordinar el servicio, emitir facturas cuando corresponda y mantener la comunicación necesaria para ejecutar el proyecto.',
          'También usamos los datos para prevenir spam, abuso y fraude, y para cumplir obligaciones legales o fiscales cuando la relación se convierte en un servicio contratado.',
        ],
      },
      {
        titulo: 'Base legal',
        parrafos: [
          'La base principal es el consentimiento que otorgas al enviar el formulario. Cuando existe una relación contractual, también tratamos los datos necesarios para ejecutar el servicio y cumplir obligaciones legales.',
        ],
      },
      {
        titulo: 'Con quién se comparten',
        parrafos: [
          'Trabajamos con proveedores de infraestructura: Cloudflare (alojamiento del sitio y del Worker), Supabase (base de datos y almacenamiento privado) y Cloudflare Workers AI (asistencia para preparar el diagnóstico inicial). Si el equipo activa alertas internas por Telegram, el resumen de la solicitud también se envía a ese canal privado.',
          'Estos proveedores pueden procesar datos fuera de República Dominicana bajo sus propias condiciones de seguridad. No vendemos, alquilamos ni cedemos datos a terceros para publicidad.',
        ],
      },
      {
        titulo: 'Cuánto tiempo se conservan',
        parrafos: [
          'Las solicitudes que no se convierten en clientes se conservan hasta 24 meses para dar seguimiento y luego se eliminan o anonimizan. Los datos de clientes, facturas y pagos se conservan durante el tiempo que exijan las obligaciones fiscales y contables aplicables. Los perfiles del portal de talento se conservan mientras estén activos o hasta que la persona solicite su eliminación.',
        ],
      },
      {
        titulo: 'Tus derechos',
        parrafos: [
          'Puedes solicitar acceso, rectificación, actualización, eliminación u oposición al tratamiento de tus datos escribiendo por el formulario de contacto. Responderemos en un plazo razonable y eliminaremos lo que no debamos conservar por obligación legal.',
        ],
      },
      {
        titulo: 'Seguridad',
        parrafos: [
          'El sitio usa HTTPS, el acceso al panel es privado, la base aplica reglas de acceso por fila (RLS), los CV del portal de talento viven en un bucket privado y los formularios tienen límites antiabuso. Ningún sistema es infalible; si detectamos un incidente relevante, actuaremos para contenerlo y comunicarlo cuando corresponda.',
        ],
      },
      {
        titulo: 'Cookies y almacenamiento local',
        parrafos: [
          'No usamos cookies de publicidad ni rastreadores de terceros. La aplicación instalable guarda en el navegador los recursos necesarios para abrir sin conexión. El portal de talento guarda un token local para que una persona pueda actualizar su propio perfil; no se usa para seguirla en otros sitios.',
        ],
      },
      {
        titulo: 'Cambios',
        parrafos: [
          'Si cambia esta política, publicaremos la nueva versión con su fecha de actualización en esta misma página.',
        ],
      },
    ],
  },
  terminos: {
    titulo: 'Términos del servicio',
    descripcion:
      'Condiciones generales para cotizar, contratar y recibir los servicios de digitalización de AviTech. La propuesta y el contrato de cada proyecto prevalecen sobre este resumen.',
    actualizado: '21 de octubre de 2026',
    bloques: [
      {
        titulo: 'Servicios',
        parrafos: [
          'AviTech ofrece diseño y desarrollo de páginas web, portales y sistemas empresariales, automatización de procesos, mantenimiento y soporte tecnológico. El alcance concreto de cada proyecto se define en una propuesta escrita y aceptada por el cliente.',
        ],
      },
      {
        titulo: 'Propuestas y precios',
        parrafos: [
          'Los rangos publicados en el sitio son referencias comerciales iniciales y no constituyen una cotización vinculante. El precio final depende del alcance, las integraciones, el contenido y los requisitos técnicos. La propuesta aceptada indica entregables, cronograma, precio y condiciones de pago.',
          'Los montos se expresan en pesos dominicanos (RD$). Hosting, dominio, licencias, APIs y otros servicios de terceros se cotizan por separado, salvo que la propuesta diga lo contrario.',
        ],
      },
      {
        titulo: 'Forma de pago',
        parrafos: [
          'El esquema habitual es 50% al iniciar el proyecto y 50% contra la entrega, salvo que la propuesta acuerde otro calendario. Los servicios de mantenimiento se facturan mensualmente. El retraso en un pago puede pausar el trabajo hasta regularizarse.',
        ],
      },
      {
        titulo: 'Obligaciones del cliente',
        parrafos: [
          'El cliente se compromete a entregar la información, los contenidos y los accesos necesarios, a designar una persona responsable de las aprobaciones y a garantizar que los materiales que comparte no violan derechos de terceros.',
        ],
      },
      {
        titulo: 'Cambios de alcance',
        parrafos: [
          'Los cambios que no estén incluidos en la propuesta se cotizan y aprueban por separado antes de ejecutarse. Los retrasos causados por información o aprobaciones pendientes pueden ajustar el cronograma.',
        ],
      },
      {
        titulo: 'Entrega y garantía',
        parrafos: [
          'El trabajo se entrega por etapas según el cronograma acordado. Durante 30 días después de la entrega, AviTech corrige sin costo los defectos que impidan el funcionamiento de lo pactado. Las mejoras nuevas, los cambios de alcance y el mantenimiento continuo se contratan aparte.',
        ],
      },
      {
        titulo: 'Propiedad intelectual',
        parrafos: [
          'Una vez pagado el proyecto, el cliente recibe los derechos sobre sus contenidos y sobre los entregables finales acordados. AviTech conserva sus herramientas, componentes reutilizables y conocimiento previo. AviTech solo mostrará el proyecto en su portafolio con autorización escrita del cliente.',
        ],
      },
      {
        titulo: 'Confidencialidad y datos personales',
        parrafos: [
          'Ambas partes mantendrán confidencial la información sensible del proyecto. El tratamiento de datos personales se rige por la política de privacidad publicada en /privacidad.',
        ],
      },
      {
        titulo: 'Limitación de responsabilidad',
        parrafos: [
          'AviTech no garantiza resultados comerciales específicos, posiciones en buscadores ni volúmenes de venta. Salvo dolo o lo que impida la ley, la responsabilidad por un proyecto se limita al monto efectivamente pagado por ese proyecto.',
        ],
      },
      {
        titulo: 'Terminación',
        parrafos: [
          'Cualquiera de las partes puede terminar el proyecto con aviso escrito. El cliente paga el trabajo ejecutado y los compromisos adquiridos con terceros hasta la fecha de terminación; AviTech entrega lo producido y paga lo que corresponda.',
        ],
      },
      {
        titulo: 'Ley aplicable',
        parrafos: [
          'Estas condiciones se rigen por las leyes de la República Dominicana. Para cualquier controversia, las partes procurarán resolverla de buena fe y, si no fuera posible, se someterán a los tribunales competentes de Santo Domingo.',
        ],
      },
      {
        titulo: 'Contacto',
        parrafos: ['Para consultas sobre estos términos, escribe por el formulario de contacto del sitio.'],
      },
    ],
  },
}

export function PaginaLegal({ tipo }: { tipo: TipoLegal }) {
  const documento = DOCUMENTOS[tipo]

  useEffect(() => {
    const tituloAnterior = document.title
    document.title = `${documento.titulo} · ${SITIO.nombre}`
    const meta = document.querySelector('meta[name="description"]')
    const descripcionAnterior = meta?.getAttribute('content') ?? ''
    meta?.setAttribute('content', documento.descripcion)
    const canonicalAnterior = document.querySelector('link[rel="canonical"]')
    canonicalAnterior?.remove()
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = `${window.location.origin}${tipo === 'privacidad' ? '/privacidad' : '/terminos'}`
    document.head.appendChild(canonical)
    return () => {
      document.title = tituloAnterior
      if (meta) meta.setAttribute('content', descripcionAnterior)
      canonical.remove()
      if (canonicalAnterior) document.head.appendChild(canonicalAnterior)
    }
  }, [documento, tipo])

  return (
    <div className="sitio-comercial min-h-screen bg-white text-grafito">
      <header className="border-b border-borde-azul/70 bg-white">
        <div className={cx(CONTENEDOR, 'flex h-16 items-center justify-between gap-4')}>
          <a href="/" aria-label="AviTech Solutions Group, volver al sitio">
            <MarcaSitio />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-marino transition-colors hover:text-electrico-texto"
          >
            <ArrowLeft size={16} aria-hidden />
            Volver al sitio
          </a>
        </div>
      </header>

      <main className={cx(CONTENEDOR, 'max-w-3xl py-14 sm:py-20')}>
        <p className={ETIQUETA}>Legal</p>
        <h1 className="mt-3 text-[34px] leading-[1.08] font-semibold tracking-[-0.03em] text-marino sm:text-[42px]">
          {documento.titulo}
        </h1>
        <p className="mt-2 text-sm text-acero">Última actualización: {documento.actualizado}</p>
        <p className="mt-5 text-base leading-relaxed text-acero">{documento.descripcion}</p>

        <div className="mt-10 space-y-8">
          {documento.bloques.map((bloque) => (
            <section key={bloque.titulo}>
              <h2 className="text-lg font-semibold text-marino">{bloque.titulo}</h2>
              {bloque.parrafos.map((parrafo) => (
                <p key={parrafo} className="mt-2 text-sm leading-relaxed text-acero">
                  {parrafo}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-borde-azul bg-niebla p-5">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-acero">
            <LockKeyhole size={17} className="mt-0.5 shrink-0 text-verde" aria-hidden />
            <span>
              ¿Tienes dudas sobre este documento?{' '}
              <a
                href="/#contacto"
                className="font-semibold text-marino underline decoration-electrico/40 underline-offset-4 hover:text-electrico-texto"
              >
                Escríbenos por el formulario
              </a>
              .
            </span>
          </p>
        </div>
      </main>

      <footer className="border-t border-borde-azul/70 bg-white">
        <div
          className={cx(
            CONTENEDOR,
            'flex flex-col gap-2 py-6 text-xs text-acero sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p>
            © {SITIO.anio} {SITIO.nombre}. República Dominicana.
          </p>
          <div className="flex gap-4">
            <a href="/privacidad" className="transition-colors hover:text-marino">
              Privacidad
            </a>
            <a href="/terminos" className="transition-colors hover:text-marino">
              Términos
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function PaginaPrivacidad() {
  return <PaginaLegal tipo="privacidad" />
}

export function PaginaTerminos() {
  return <PaginaLegal tipo="terminos" />
}
