/**
 * Contenido y configuración del sitio comercial.
 *
 * Todo lo que se repite en la página (servicios, paquetes, proceso, plazos)
 * vive aquí para poder ajustarlo sin tocar los componentes. Los datos de
 * contacto salen de `empresa.ts` o de variables de entorno públicas:
 *
 *   VITE_WHATSAPP          Número con código de país, solo dígitos (ej. 1809...).
 *   VITE_CONTACTO_CORREO   Correo comercial.
 *   VITE_CONTACTO_TELEFONO Teléfono comercial.
 *
 * Si una variable está vacía, el canal correspondiente no se muestra: nunca se
 * inventan números ni correos.
 */
import { EMPRESA } from './empresa'

export type IdServicio = 'web' | 'portales' | 'automatizacion' | 'soporte'

export type TipoInternoSolicitud =
  | 'auditoria'
  | 'consultoria'
  | 'implementacion'
  | 'capacitacion'
  | 'seo'
  | 'contabilidad'
  | 'otro'

export type UrgenciaSolicitud = 'baja' | 'media' | 'alta'

export interface ServicioSitio {
  id: IdServicio
  numero: string
  nombre: string
  problema: string
  descripcion: string
  entregables: string[]
  publico: string
  tipoInterno: TipoInternoSolicitud
  icono: 'globo' | 'panel' | 'flujo' | 'soporte'
}

export const SERVICIOS: ServicioSitio[] = [
  {
    id: 'web',
    numero: '01',
    nombre: 'Páginas web y presencia digital',
    problema: 'Tu empresa no aparece o su sitio no explica lo que hace.',
    descripcion:
      'Diseñamos sitios corporativos, landing pages y catálogos digitales rápidos, claros y preparados para convertir visitas en solicitudes.',
    entregables: [
      'Diseño responsive y accesible',
      'Formulario comercial y enlace a WhatsApp',
      'SEO técnico básico',
      'Publicación y capacitación',
    ],
    publico: 'Negocios que necesitan una presencia digital profesional.',
    tipoInterno: 'implementacion',
    icono: 'globo',
  },
  {
    id: 'portales',
    numero: '02',
    nombre: 'Portales y sistemas empresariales',
    problema: 'La información vive en hojas de cálculo y correos sueltos.',
    descripcion:
      'Construimos paneles y portales para centralizar clientes, solicitudes, proyectos y equipos, con accesos según el rol de cada persona.',
    entregables: [
      'Base de datos y reglas de acceso',
      'Panel administrativo',
      'Registro y seguimiento de solicitudes',
      'Informes y exportaciones',
    ],
    publico: 'Empresas cuya operación ya no cabe en Excel.',
    tipoInterno: 'implementacion',
    icono: 'panel',
  },
  {
    id: 'automatizacion',
    numero: '03',
    nombre: 'Automatización de procesos',
    problema: 'El equipo repite tareas manuales que consumen tiempo.',
    descripcion:
      'Conectamos formularios, bases de datos, notificaciones y documentos para que los flujos repetitivos se ejecuten solos y con menos errores.',
    entregables: [
      'Mapeo del proceso actual',
      'Integraciones y notificaciones',
      'Generación de documentos e informes',
      'Monitoreo y registro de actividad',
    ],
    publico: 'Equipos con tareas repetitivas y varias herramientas desconectadas.',
    tipoInterno: 'implementacion',
    icono: 'flujo',
  },
  {
    id: 'soporte',
    numero: '04',
    nombre: 'Mantenimiento y soporte tecnológico',
    problema: 'Tu web o sistema funciona, pero nadie lo atiende cuando falla.',
    descripcion:
      'Nos encargamos de correcciones, mejoras, actualizaciones y respaldos según el nivel de servicio acordado, para que la operación no se detenga.',
    entregables: [
      'Corrección de errores',
      'Mejoras funcionales',
      'Actualizaciones y respaldos',
      'Soporte técnico recurrente',
    ],
    publico: 'Negocios que ya tienen un sitio o sistema en operación.',
    tipoInterno: 'consultoria',
    icono: 'soporte',
  },
]

export interface NecesidadSitio {
  etiqueta: string
  servicio: IdServicio
}

export const NECESIDADES: NecesidadSitio[] = [
  { etiqueta: 'Necesito una página web', servicio: 'web' },
  { etiqueta: 'Quiero recibir solicitudes por Internet', servicio: 'portales' },
  { etiqueta: 'Necesito organizar clientes y proyectos', servicio: 'portales' },
  { etiqueta: 'Quiero automatizar tareas repetitivas', servicio: 'automatizacion' },
  { etiqueta: 'Necesito conectar herramientas y bases de datos', servicio: 'automatizacion' },
  { etiqueta: 'Quiero mejorar un sistema existente', servicio: 'soporte' },
]

export interface PreguntaSitio {
  pregunta: string
  respuesta: string
}

export const PREGUNTAS: PreguntaSitio[] = [
  {
    pregunta: '¿Cuánto cuesta un proyecto?',
    respuesta:
      'Depende del alcance. Los paquetes de esta página son rangos de referencia: después de un diagnóstico breve te damos una propuesta con entregables, cronograma y precio final. Hosting, dominio, licencias y APIs se cotizan aparte.',
  },
  {
    pregunta: '¿Cuánto tiempo toma?',
    respuesta:
      'Una landing o un sitio corporativo suele tomar semanas, no meses; un portal o una automatización depende de las integraciones. En la propuesta queda un cronograma por etapas y sabes qué falta en cada una.',
  },
  {
    pregunta: '¿Cómo se paga?',
    respuesta:
      'Con transferencia bancaria en pesos dominicanos. El esquema habitual es 50% al iniciar y 50% contra la entrega, acordado en la propuesta. Los proyectos de mantenimiento se facturan mensuales.',
  },
  {
    pregunta: '¿Trabajan fuera de Santo Domingo?',
    respuesta:
      'Sí. Coordinamos reuniones y avances de forma remota; la entrega y la capacitación también pueden ser virtuales. Si el proyecto requiere presencia física, se acuerda en la propuesta.',
  },
  {
    pregunta: '¿Qué necesita mi empresa para empezar?',
    respuesta:
      'Una persona responsable de aprobar, la información del negocio y los accesos a las herramientas que haya que integrar. Nosotros nos encargamos del resto: alcance, diseño, desarrollo, pruebas y puesta en marcha.',
  },
  {
    pregunta: '¿Qué pasa después de la entrega?',
    respuesta:
      'Documentamos, capacitamos a tu equipo y cubrimos durante 30 días los defectos del alcance entregado. Después puedes contratar un plan de mantenimiento para correcciones, mejoras, actualizaciones y respaldos.',
  },
  {
    pregunta: '¿Cómo protegen mis datos?',
    respuesta:
      'Los formularios piden consentimiento, los datos viajan por HTTPS y el acceso al panel es privado. No vendemos datos ni los usamos para publicidad. Puedes leer la política de privacidad completa en /privacidad.',
  },
  {
    pregunta: '¿Puedo pagar en otra moneda?',
    respuesta:
      'Los precios se cotizan en RD$. Si necesitas otra moneda, se acuerda por escrito en la propuesta, con la tasa y la fecha de referencia.',
  },
]

export interface GarantiaSitio {
  titulo: string
  descripcion: string
  icono: 'escudo' | 'consentimiento' | 'dinero' | 'flujo'
}

/** Garantías que el código actual sí cumple; no son promesas comerciales. */
export const GARANTIAS: GarantiaSitio[] = [
  {
    titulo: 'Seguridad desde el diseño',
    descripcion: 'La información viaja cifrada por HTTPS y el panel exige inicio de sesión.',
    icono: 'escudo',
  },
  {
    titulo: 'Consentimiento claro',
    descripcion: 'Ningún formulario se envía sin tu autorización explícita.',
    icono: 'consentimiento',
  },
  {
    titulo: 'Dinero bajo control',
    descripcion: 'Facturas con NCF, pagos y gastos en RD$, con reportes para revisar.',
    icono: 'dinero',
  },
  {
    titulo: 'Procesos automáticos',
    descripcion: 'Notificaciones y flujos que trabajan solos, sin tareas repetidas a mano.',
    icono: 'flujo',
  },
]

export interface PasoSitio {
  titulo: string
  descripcion: string
}

export const PROCESO: PasoSitio[] = [
  {
    titulo: 'Diagnóstico y levantamiento',
    descripcion: 'Escuchamos el problema, revisamos el proceso actual y definimos juntos el alcance.',
  },
  {
    titulo: 'Propuesta técnica y comercial',
    descripcion: 'Entregamos una propuesta clara: entregables, cronograma y precio antes de empezar.',
  },
  {
    titulo: 'Desarrollo, pruebas y validación',
    descripcion: 'Construimos por etapas y validamos con tu equipo antes de publicar cada avance.',
  },
  {
    titulo: 'Entrega, capacitación y soporte',
    descripcion: 'Documentamos lo construido, capacitamos al equipo y acordamos el soporte posterior.',
  },
]

export interface DemoSitio {
  nombre: string
  descripcion: string
  etiquetas: string[]
  enlace: string | null
  textoEnlace: string
  visual: 'panel' | 'talento' | 'solicitud'
}

/**
 * Demostraciones construidas por AviTech dentro de esta plataforma. No son
 * clientes, testimonios ni casos comerciales: el sitio lo dice explícitamente.
 */
export const DEMOS: DemoSitio[] = [
  {
    nombre: 'Panel de gestión AviTech',
    descripcion:
      'Panel interno con clientes, solicitudes, CRM, facturación y reportes. Muestra el tipo de portal administrativo que podemos construir.',
    etiquetas: ['React', 'Supabase', 'Cloudflare'],
    enlace: '/panel',
    textoEnlace: 'Requiere acceso',
    visual: 'panel',
  },
  {
    nombre: 'Portal de talento',
    descripcion:
      'Portal público de empleo con perfiles anónimos, postulación asistida y un panel interno para gestionar candidatos y vacantes.',
    etiquetas: ['Portal público', 'PWA', 'Privacidad'],
    enlace: '/talento',
    textoEnlace: 'Ver portal',
    visual: 'talento',
  },
  {
    nombre: 'Solicitudes con IA',
    descripcion:
      'Formulario público que registra una solicitud y prepara un diagnóstico inicial automáticamente para que el equipo la revise.',
    etiquetas: ['Formularios', 'Automatización', 'Base de datos'],
    enlace: '/solicitud',
    textoEnlace: 'Ver formulario',
    visual: 'solicitud',
  },
]

export interface PaqueteSitio {
  nombre: string
  rango: string
  sufijo?: string
  resumen: string
  incluye: string[]
  ideal: string
  servicio: IdServicio
  destacado?: boolean
}

export const PAQUETES: PaqueteSitio[] = [
  {
    nombre: 'Presencia Digital',
    rango: 'RD$15,000 – 30,000',
    resumen: 'Sitio corporativo o landing page para empezar a vender en línea.',
    incluye: [
      'Diseño responsive',
      'Hasta 5 secciones',
      'Formulario y WhatsApp',
      'SEO técnico básico',
      'Publicación',
    ],
    ideal: 'Negocios que necesitan una presencia profesional cuanto antes.',
    servicio: 'web',
  },
  {
    nombre: 'Empresa Digital',
    rango: 'RD$35,000 – 75,000',
    resumen: 'Portal o sistema a medida para ordenar la operación.',
    incluye: [
      'Análisis del proceso',
      'Base de datos y accesos por rol',
      'Panel administrativo',
      'Informes y seguimiento',
      'Capacitación',
    ],
    ideal: 'Empresas que ya tienen volumen y necesitan centralizar la información.',
    servicio: 'portales',
    destacado: true,
  },
  {
    nombre: 'Automatización Empresarial',
    rango: 'RD$25,000 – 100,000+',
    resumen: 'Flujos e integraciones para eliminar tareas manuales.',
    incluye: [
      'Mapeo del proceso',
      'Integraciones entre herramientas',
      'Notificaciones automáticas',
      'Generación de documentos',
      'Monitoreo',
    ],
    ideal: 'Equipos que repiten las mismas tareas cada semana.',
    servicio: 'automatizacion',
  },
  {
    nombre: 'Mantenimiento',
    rango: 'RD$2,000 – 8,000',
    sufijo: 'por mes',
    resumen: 'Soporte continuo para un sitio o sistema en operación.',
    incluye: [
      'Correcciones',
      'Mejoras funcionales',
      'Actualizaciones',
      'Respaldos según contrato',
      'Soporte acordado',
    ],
    ideal: 'Negocios que ya tienen una plataforma y quieren mantenerla sana.',
    servicio: 'soporte',
  },
]

export interface PlazoContacto {
  id: string
  etiqueta: string
  urgencia: UrgenciaSolicitud
}

export const PLAZOS_CONTACTO: PlazoContacto[] = [
  { id: 'inmediato', etiqueta: 'Lo antes posible', urgencia: 'alta' },
  { id: '1_mes', etiqueta: 'En 1 mes', urgencia: 'media' },
  { id: '3_meses', etiqueta: 'En 3 meses', urgencia: 'baja' },
  { id: 'flexible', etiqueta: 'Flexible', urgencia: 'media' },
]

export interface RolEquipo {
  titulo: string
  descripcion: string
  icono: 'coordinacion' | 'software' | 'desarrollo' | 'diseno'
}

export const ROLES: RolEquipo[] = [
  {
    titulo: 'Coordinación de proyectos',
    descripcion: 'Levantamiento de requisitos, alcance y seguimiento con el cliente.',
    icono: 'coordinacion',
  },
  {
    titulo: 'Ingeniería de software y datos',
    descripcion: 'Arquitectura, bases de datos, integraciones y análisis.',
    icono: 'software',
  },
  {
    titulo: 'Desarrollo web y móvil',
    descripcion: 'Implementación de sitios, portales y aplicaciones.',
    icono: 'desarrollo',
  },
  {
    titulo: 'Diseño y contenido',
    descripcion: 'Interfaz, identidad visual y materiales de comunicación.',
    icono: 'diseno',
  },
]

export interface EnlaceNav {
  href: string
  etiqueta: string
}

export const ENLACES_NAV: EnlaceNav[] = [
  { href: '#soluciones', etiqueta: 'Soluciones' },
  { href: '#necesidades', etiqueta: 'Necesidades' },
  { href: '#proceso', etiqueta: 'Proceso' },
  { href: '#portafolio', etiqueta: 'Portafolio' },
  { href: '#paquetes', etiqueta: 'Paquetes' },
  { href: '#preguntas', etiqueta: 'Preguntas' },
  { href: '#nosotros', etiqueta: 'Nosotros' },
]

const entorno = import.meta.env as Record<string, string | undefined>
const soloDigitos = (valor: string) => valor.replace(/\D/g, '')

/** Canales reales de contacto. Si están vacíos, la interfaz no los muestra. */
export const CONTACTO = {
  correo: (entorno.VITE_CONTACTO_CORREO || EMPRESA.correo || '').trim(),
  telefono: (entorno.VITE_CONTACTO_TELEFONO || EMPRESA.telefono || '').trim(),
  whatsapp: soloDigitos(entorno.VITE_WHATSAPP || ''),
  ubicacion: EMPRESA.direccion || 'Santo Domingo, República Dominicana',
}

export const SITIO = {
  nombre: EMPRESA.nombre,
  eslogan: 'Digitalización empresarial',
  descripcion:
    'Diseñamos páginas web, portales empresariales y automatizaciones para que las empresas organicen sus procesos, atiendan mejor a sus clientes y trabajen con mayor eficiencia.',
  // Cambiar con VITE_SITIO_URL cuando se conecte el dominio propio.
  url: (entorno.VITE_SITIO_URL || 'https://aviech.avismael-eg.workers.dev').replace(/\/+$/, ''),
  anio: new Date().getFullYear(),
}
