# Diseño del panel — guía maestra (DESIGN.md)

> **Para qué sirve:** que cualquier persona (o IA) que toque la interfaz mantenga
> la misma línea visual sin tener que leer todo el código. Si algo cambia aquí,
> debe cambiar también en `src/index.css` — y al revés.
>
> **Regla de oro:** la app es **oscura**; las **facturas y la impresión son
> siempre claras** (aspecto de papel).

---

## 1. Identidad

- **Concepto:** oscuro premium tecnológico — azul noche profundo, auroras suaves,
  rejilla tenue de fondo y cristal (desenfoque) en barras y flotantes.
- **Acento de marca:** violeta / índigo (gradiente `indigo-500 → violet-600`).
- **Personalidad:** seria (auditoría y consultoría), moderna, legible y rápida.
- **Tipografía de marca:** **Inter** (variable, autoalojada con `@fontsource-variable/inter` — sin CDN, funciona offline y en la PWA) con respaldo a fuentes del sistema.

## 2. Tokens de color (fuente única: `src/index.css` → `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#070b15` | Fondo general de la app |
| `--color-superficie` | `#0d1424` | Tarjetas, modales, paneles |
| `--color-superficie-2` | `#172139` | Zonas elevadas, hover, chips, esqueletos |
| `--color-borde` | `#21304f` | Bordes principales |
| `--color-borde-suave` | `#182238` | Divisores internos |
| `--color-tinta` | `#eef2fb` | Texto principal |
| `--color-tinta-suave` | `#9aa7c4` | Texto secundario |
| `--color-tinta-tenue` | `#6b7ca0` | Texto terciario, placeholders |

Se usan como utilidades semánticas de Tailwind v4: `bg-superficie`, `text-tinta`,
`border-borde`, `bg-fondo/70`… **Nunca** poner hex crudos para superficies o texto.

### Acentos (paleta Tailwind, patrón: fondo `/10` + borde `/25` + texto `300`)

| Acento | Significado | Ejemplo |
|---|---|---|
| indigo / violet | Marca, selección, botón primario | `bg-indigo-500/10`, barra activa |
| emerald | Cobrado, pagado, positivo | insignia "Pagado" |
| amber | Pendiente, advertencia | insignia "Pendiente", gastos |
| rose / red | Vencido, peligro, anulado | "vencido hace 9 días", botón peligro |
| sky | Informativo (servicios) | icono de servicios |
| slate | Neutro | insignia por defecto |

## 3. Fondos y atmósfera (`body`)

- Tres **auroras radiales**: índigo 22 % arriba-izquierda, violeta 16 % arriba-derecha,
  celeste 8 % abajo — + **rejilla** de `3.25rem` al 5 % de opacidad, fija.
- Barras (`aside`, `header`): `#0a1120` al 75–85 % con `backdrop-blur-2xl` y un
  brillo radial índigo arriba (constante `BRILLO_LATERAL` en `Layout.tsx`).
- Selección de texto: índigo al 40 %.

## 4. Tipografía y datos

- **Familia:** Inter Variable (`--font-sans` en `index.css`), autoalojada: cero llamadas a CDN y disponible sin internet.
- Jerarquía: título de sección `text-2xl font-semibold tracking-tight`;
  descripción `text-sm text-tinta-suave`; etiquetas `text-xs`; detalles `text-[11px]`.
- **Números**: monedas con `tabular-nums` (no bailan al animarse).
- **Montos y fechas** siempre con `lib/formato.ts`:
  `formatoDinero` (es-DO, `RD$1,234.56`), `formatoFecha` ("18 oct 2026"),
  `fechaCompleta`, `formatoMes`. Nunca formatear a mano.
- Etiquetas cortas y con `truncate` + `title` cuando puedan ser largas
  (ej.: el correo del usuario en la barra lateral).

## 5. Formas, sombras y movimiento

- **Radios:** controles `rounded-xl`; tarjetas y modales `rounded-2xl`;
  insignias y avatares `rounded-full`.
- **Sombras:** suaves y profundas solo en tarjetas/modales
  (`shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)]`, `shadow-2xl`). En impresión se eliminan.
- **Animaciones** (definidas en `index.css`): `aparecer` (entradas),
  `escalar` (modales), `deslizar` (avisos), `fundido`, `crecer-barra` (gráfico).
  Duraciones 0.2–0.6 s con `ease-out` o `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Interacción:** hover `-translate-y-0.5` en tarjetas; botones con
  `active:scale-[0.97]`; transiciones de 150 ms.
- Las tarjetas de datos del Inicio usan **contador animado** (`useContador`).
- `prefers-reduced-motion`: todas las animaciones se desactivan. ✅

## 6. Componentes (usar SIEMPRE `src/components/ui.tsx`)

| Componente | Notas |
|---|---|
| `Boton` | Variantes: `primario` (gradiente índigo), `secundario` (cristal), `peligro` (gradiente rojo), `fantasma`. `rounded-xl`, `px-3.5 py-2`, `text-sm`. |
| `Insignia` | Pill con borde + fondo translúcido. Recibe `color` del mapa de acentos. |
| `Tarjeta` | `rounded-2xl`, borde, `bg-superficie/90`, `backdrop-blur-sm`. |
| `CabeceraSeccion` | Título + descripción + acciones alineadas. |
| `Campo` / `Entrada` / `Selector` / `AreaTexto` | Comparten `claseEntrada` (`lib/estilos.ts`): foco con borde y anillo índigo. |
| `Modal` | Fondo `#03060d/75` + blur; se cierra con Escape, clic fuera o la X; cabecera fija; entrada `animar-modal`; **bloquea el scroll del fondo** y **auto-enfoca el primer campo** al abrir. |
| `Confirmar` | Modal pequeño con botón de peligro. |
| `BotonIcono` | Acción de solo icono con etiqueta accesible (`title` + `aria-label`). Obligatorio en tablas en vez de botones sueltos. |
| `Vacio`, `FilasCargando`, `ErrorTabla` | Estado vacío (acepta `accion` opcional para un CTA), esqueleto `animate-pulse` y aviso ámbar. |
| `Layout` | Barra lateral fija con navegación (activo: fondo índigo 10 % + barra lateral con brillo + `aria-current`), chip de usuario; en móvil, cabecera con blur + navegación desplazable (utilidades `.sin-barra` y `.mascara-desvanecida`). |
| `CRM` | Pestañas accesibles (`role="tablist"`, flechas ←/→) para Pipeline, Empresas, Contactos y Actividades. El pipeline es un kanban horizontal con columnas de 16 rem, arrastre nativo y edición en modal; en móvil la etapa se cambia desde el modal. Las tarjetas y métricas usan `tabular-nums`. |
| `Auditor SEO` | Formulario de dirección + informe con **puntaje 0–100** (verde ≥ 80, ámbar ≥ 50, rojo < 50) y comprobaciones agrupadas en contenido / técnico / archivos. Columna lateral con la tarjeta de **PageSpeed** (4 puntajes + LCP/CLS) y ficha técnica. El informe se anuncia con `aria-live="polite"` y el historial usa `BotonIcono` para ver, medir, reanalizar y eliminar. |

- **Enlaces profundos:** la sección activa vive en la URL (`#inicio`, `#clientes`, `#igualas`…). Recargar, compartir el enlace o usar Atrás conserva la sección.

## 7. Regla de oro: factura e impresión en claro

- `.documento-factura` redefine los tokens a valores de papel **incluso en pantalla**
  (la factura se ve como una hoja blanca dentro de la app oscura).
- `@media print`: tokens claros, se ocultan `aside`, `header` y `.no-imprimir`,
  se quitan sombras, los acentos vuelven a tonos legibles sobre papel
  (`#047857`, `#b45309`, `#be123c`, `#b91c1c`, `#4338ca`, `#0369a1`, `#6d28d9`, `#0f766e`),
  insignias en gris claro, y `@page` con margen de 12 mm.
- `.solo-impresion`: bloques que solo existen en el papel.

## 8. Do's

- Reutilizar los componentes y tokens existentes antes de crear nada nuevo.
- Íconos: `lucide-react` (nada de emojis como íconos 😉 — salvo guiños de texto).
- Probar siempre en **375 / 768 / 1024 / 1440 px** y con **Ctrl+P** (impresión).
- Mantener el contraste: texto normal ≥ 4.5:1, texto grande ≥ 3:1.
- Focus visible en todo lo interactivo: anillo índigo en campos + regla global `:focus-visible` para botones y enlaces de icono.

## 9. Don'ts (anti-patrones)

- ❌ Hex de Tailwind crudos para superficies/texto (usar tokens).
- ❌ Gradientes saturados a pantalla completa o más de ~2 acentos por pantalla.
- ❌ Sombras duras, bordes negros, radios mezclados por componente.
- ❌ Texto tenue sobre fondo tenue (`tinta-tenue` como texto principal).
- ❌ Animaciones de más de 0.6 s o que ignoren `prefers-reduced-motion`.
- ❌ Quitar el cristal (blur) de las barras o el fondo con auroras: es la firma visual.

## 10. Checklist antes de entregar

- [ ] Contraste de texto ≥ 4.5:1
- [ ] Focus visible en botones, campos y enlaces
- [ ] Responsive 375 / 768 / 1024 / 1440 sin recortes
- [ ] Impresión: fondo blanco, sin menús, acentos legibles
- [ ] `prefers-reduced-motion` respetado
- [ ] Montos en RD$ y fechas en es-DO (usar `lib/formato.ts`)
- [ ] 0 errores de consola

## 11. Cómo cambiar el tema (si algún día se quiere)

1. Tocar **solo los tokens** en `src/index.css`: bloque `@theme`, `:root`,
   `.documento-factura` y `@media print`.
2. Actualizar la tabla de tokens de este documento.
3. Verificar pantalla, móvil e impresión (los cuatro puntos del checklist 10).

---

> Esta guía sigue el enfoque de "sistema de diseño" que promueven las
> herramientas modernas (tokens → componentes → reglas → checklist).
> Última revisión: 19-oct-2026.
