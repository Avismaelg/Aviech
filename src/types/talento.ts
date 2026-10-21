// Tipos del módulo de Talento. Las relaciones (`talento_empresas`,
// `talento_candidatos`, `talento_vacantes`) llegan cuando la consulta las
// incluye con select(...), igual que en el CRM.

export interface CandidatoTalento {
  id: string
  nombre: string
  email: string
  telefono: string | null
  ubicacion: string | null
  puesto_objetivo: string
  seniority: string
  modalidad: string
  habilidades: string[] | null
  experiencia: string | null
  educacion: string | null
  disponibilidad: string | null
  expectativa_salarial: number | null
  cv_path: string | null
  cv_url: string | null
  cv_nombre: string | null
  estado: string
  visible_empresas: boolean
  consentimiento: boolean
  notas: string | null
  created_at: string
  updated_at: string
}

export interface EmpresaTalento {
  id: string
  nombre: string
  sector: string | null
  sitio_web: string | null
  ubicacion: string | null
  contacto_nombre: string
  contacto_email: string
  contacto_telefono: string | null
  estado: string
  consentimiento: boolean
  notas: string | null
  created_at: string
  updated_at: string
}

export interface VacanteTalento {
  id: string
  empresa_id: string
  titulo: string
  descripcion: string
  requisitos: string | null
  responsabilidades: string | null
  ubicacion: string | null
  modalidad: string
  seniority: string
  tipo_contrato: string
  salario_min: number | null
  salario_max: number | null
  estado: string
  publica: boolean
  created_at: string
  updated_at: string
  talento_empresas?: { id: string; nombre: string } | null
}

export interface PostulacionTalento {
  id: string
  candidato_id: string
  empresa_id: string
  vacante_id: string | null
  etapa: string
  origen: string
  solicitud_tipo: string | null
  match_score: number | null
  match_motivo: string | null
  notas: string | null
  fecha_entrevista: string | null
  entrevista_tipo: string | null
  entrevistador: string | null
  resultado_entrevista: string | null
  fecha_inicio: string | null
  salario_final: number | null
  comision: number | null
  created_at: string
  updated_at: string
  talento_candidatos?: {
    id: string
    nombre: string
    email: string
    telefono: string | null
    puesto_objetivo: string
    seniority: string
    modalidad: string
    ubicacion: string | null
    habilidades: string[] | null
    disponibilidad: string | null
    expectativa_salarial: number | null
    cv_path: string | null
    cv_url: string | null
    cv_nombre: string | null
  } | null
  talento_empresas?: { id: string; nombre: string } | null
  talento_vacantes?: { id: string; titulo: string } | null
}

// Formas que devuelve el portal público. No incluyen correo, teléfono ni la
// ruta del CV: la empresa solo ve un perfil anónimo y solicita la entrevista.
export interface VacantePublica {
  id: string
  titulo: string
  empresa_nombre: string
  sector: string | null
  ubicacion: string | null
  modalidad: string
  seniority: string
  tipo_contrato: string
  salario_min: number | null
  salario_max: number | null
  descripcion: string
  requisitos: string | null
  created_at: string
}

export interface CandidatoPublico {
  id: string
  nombre_publico: string
  puesto_objetivo: string
  seniority: string
  modalidad: string
  ubicacion: string | null
  habilidades: string[] | null
  experiencia: string | null
  disponibilidad: string | null
  expectativa_salarial: number | null
  cv_disponible: boolean
  created_at: string
}

export interface SugerenciaTalento {
  candidato_id: string
  nombre: string
  puntaje: number
  motivo: string
}

export interface PostulacionIA {
  vacante_id: string
  titulo: string
  empresa_nombre: string
  puntaje: number
  motivo: string
}

export interface ResultadoPostulacionIA {
  ok: boolean
  aplicadas: PostulacionIA[]
  existentes: number
  analizadas: number
  mensaje?: string
}
