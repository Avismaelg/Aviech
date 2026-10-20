# Diseño del panel — guía maestra (DESIGN.md)

> **Para qué sirve:** que cualquier persona (o IA) que toque la interfaz mantenga
> la misma línea visual sin leer todo el código. Si algo cambia aquí, debe cambiar
> también en `src/index.css` — y al revés.
>
> **Regla de oro:** la app es **clara** (tipo app moderna); las **facturas y la
> impresión** conservan aspecto de papel blanco.

---

## 1. Identidad

- **Concepto (v3 «Claro profesional», 19-oct-2026):** panel luminoso de herramienta
  financiera — fondo gris azulado muy suave, tarjetas blancas, un solo acento azul,
  navegación superior y titulares geométricos. Se abandonó la barra lateral oscura de la v2.
- **Acento de marca:** azul (`blue-600` para acciones y selección); marca gráfica en
  degradado `sky-400 → blue-600`.
- **Personalidad:** seria (auditoría y consultoría), moderna, espaciosa y legible.
- **Tipografía:** **Inter Variable** para el cuerpo y **Sora Variable** para titulares,
  ambas autoalojadas (`@fontsource-variable/…`): sin CDN, funcionan offline y en la PWA.

## 2. Tokens de color (fuente única: `src/index.css` → `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#f4f6fa` | Fondo general de la app |
| `--color-superficie` | `#ffffff` | Tarjetas, modales, barras |
| `--color-superficie-2` | `#edf1f7` | Hover, chips, esqueletos |
| `--color-borde` | `#dbe3ee` | Bordes principales |
| `--color-borde-suave` | `#e9eef5` | Divisores internos |
| `--color-tinta` | `#0d1b33` | Texto principal |
| `--color-tinta-suave` | `#4d5d75` | Texto secundario |
| `--color-tinta-tenue` | `#79879d` | Texto terciario, placeholders |

Se usan como utilidades semánticas de Tailwind v4: `bg-superficie`, `text-tinta`,
`border-borde`, `bg-superficie-2`… **Nunca** poner hex crudos para superficies o texto.

### Acentos (paleta Tailwind, patrón claro: fondo `50` + borde `200` + texto `700`)

| Acento | Significado | Ejemplo |
|---|---|---|
| blue | Marca, selección, botón primario | `bg-blue-600`, `bg-blue-50` |
| cyan | Etapas intermedias (CRM/actividades) | "Negociación", "Reunión" |
| emerald | Cobrado, pagado, positivo | insignia "Pagado" |
| amber | Pendiente, advertencia | insignia "Pendiente", gastos |
| rose / red | Vencido, peligro, anulado | "vencido hace 9 días", botón peligro |
| sky | Informativo (servicios) | icono de servicios |
| slate | Neutro | insignia por defecto |

## 3. Fondos y atmósfera (`body`)

- Dos resplandores radiales azul/cian muy tenues arriba (≤ 10 %), fijos; sin rejilla.
- Barras (`header`) **blancas y sólidas** con borde inferior; sin `backdrop-blur`.
- Selección de texto: azul al 18 %. Foco de teclado: azul `#2563eb`.
- Tarjetas sobre blanco con sombra baja; nada de superficies oscuras salvo:
  el panel de marca del **Login**, el *tooltip* del gráfico y el velo del modal.

## 4. Tipografía y datos

- **Titulares:** Sora (`--font-display`), aplicada globalmente a `h1–h4` y a la marca.
- **Cuerpo:** Inter (`--font-sans`). Jerarquía: título de sección 27–30 px;
  descripción `text-sm text-tinta-suave`; etiquetas `text-xs`; detalles `text-[11px]`.
- **Números:** `tabular-nums` global en `body` (los montos no bailan al animarse).
- **Montos y fechas** siempre con `lib/formato.ts`:
  `formatoDinero` (es-DO, `RD$1,234.56`), `formatoFecha` ("18 oct 2026"),
  `fechaCompleta`, `formatoMes`. Nunca formatear a mano.
- Etiquetas cortas y con `truncate` + `title` cuando puedan ser largas.

## 5. Formas, sombras y movimiento

- **Radios:** botones e insignias `rounded-full`; campos `rounded-xl`; tarjetas,
  modales y menú móvil `rounded-2xl`/`rounded-3xl`; panel de acceso `rounded-[2rem]`.
- **Sombras:** bajas y neutras (`0 1px 2px` + `0 12px 32px -22px` en tarjetas;
  `shadow-2xl shadow-slate-900/10` en modales y acceso).
- **Animaciones** (`index.css`): `aparecer`, `escalar`, `deslizar`, `fundido`,
  `crecer-barra`. Duraciones 0.2–0.6 s con *ease-out*.
- **Interacción:** hover con elevación leve en tarjetas de datos; botones con
  `active:scale-[0.98]`; transiciones de 150 ms.
- `prefers-reduced-motion`: todas las animaciones se desactivan. ✅

## 6. Componentes (usar SIEMPRE `src/components/ui.tsx`)

| Componente | Notas |
|---|---|
| `Boton` | `rounded-full`. Variantes: `primario` (azul sólido `bg-blue-600`, hover `blue-700`), `secundario` (blanco con borde), `peligro` (rojo sólido), `fantasma`. |
| `Insignia` | Pill pastel con borde; recibe `color` del mapa de acentos. |
| `Tarjeta` | `rounded-2xl`, borde `--color-borde`, `bg-superficie` y sombra neutra baja. |
| `CabeceraSeccion` | Título grande + descripción + acciones. |
| `Campo` / `Entrada` / `Selector` / `AreaTexto` | `claseEntrada` (`lib/estilos.ts`): fondo blanco, borde gris, hover gris medio y foco azul con anillo suave de 4 px. |
| `Modal` | Velo `bg-slate-900/40` + blur; panel `rounded-2xl`; se cierra con Escape, clic fuera o la X; cabecera fija blanca; bloquea el scroll y auto-enfoca el primer campo. |
| `Confirmar` | Modal pequeño con botón de peligro. |
| `BotonIcono` | Círculo con etiqueta accesible (`title` + `aria-label`). |
| `Vacio`, `FilasCargando`, `ErrorTabla` | Estado vacío, esqueleto `animate-pulse` y aviso ámbar claro. |
| `Layout` | **Barra superior blanca**: marca + cuenta + Salir, y navegación por grupos (Operación / Herramientas / Finanzas) con píldora azul activa. En móvil/tablet (`< lg`) se sustituye por un **menú desplegable** con las 11 secciones. Enlaces profundos con `#seccion`. |
| `Asistente IA` | Botón flotante azul abajo a la derecha. En escritorio abre un panel blanco de 400 px; en móvil, una hoja inferior. Cabecera con estado, nueva conversación y cerrar; burbujas azul/blanco, sugerencias iniciales, indicador de escritura y compositor con `Enter` para enviar y `Shift+Enter` para salto de línea. No guarda el historial y avisa que no ve los datos del panel. |
| `Login` | Dos columnas: panel de marca azul marino (escritorio) + tarjeta blanca de acceso. Incluye píldora «Acceso privado», ver/ocultar contraseña y error legible. |
| `CRM` | Pestañas accesibles (flechas ←/→), kanban horizontal de 16 rem, arrastre nativo y edición en modal. |
| `Auditor SEO` | Puntaje 0–100 (verde ≥ 80, ámbar ≥ 50, rojo < 50), comprobaciones agrupadas y columna de PageSpeed + ficha técnica. |
| `Prospección` | Validación en línea, hallazgos de correo/teléfono/redes, guardado en el CRM con aviso si la empresa ya existe. |

- **Enlaces profundos:** la sección activa vive en la URL (`#inicio`, `#clientes`…).
- **Actualización PWA:** el service worker usa red primero para la página y caché para
  recursos; al detectar una versión nueva se activa y **recarga una sola vez**
  (`src/main.tsx`). Subir `VERSION` en `public/sw.js` con cada cambio de caché.

## 7. Regla de oro: factura e impresión en claro

- `.documento-factura` fija tokens de papel incluso en pantalla.
- `@media print`: fondo blanco, se ocultan `header` y `.no-imprimir`, se quitan sombras,
  los acentos vuelven a tonos legibles sobre papel
  (`#047857`, `#b45309`, `#be123c`, `#b91c1c`, `#1d4ed8`, `#0369a1`, `#0e7490`, `#0f766e`),
  insignias en gris claro y `@page` con margen de 12 mm.
- `.solo-impresion`: bloques que solo existen en el papel.

## 8. Do's

- Reutilizar componentes y tokens antes de crear nada nuevo.
- Íconos: `lucide-react` (nada de emojis como íconos 😉).
- Probar en **375 / 768 / 1024 / 1440 px** y con **Ctrl+P**.
- Mantener contraste: texto normal ≥ 4.5:1; foco visible en todo lo interactivo.
- Mantener el menú móvil cerrado al elegir una sección.

## 9. Don'ts (anti-patrones)

- ❌ Hex de Tailwind crudos para superficies/texto (usar tokens).
- ❌ Volver al tema oscuro, a la barra lateral o a los degradados violeta/índigo.
- ❌ Mezclar botones cuadrados con píldoras o radios arbitrarios.
- ❌ Texto tenue como color principal o texto blanco sobre fondos claros.
- ❌ Sombras duras, bordes negros o resplandores de color.
- ❌ `backdrop-blur` en barras y tarjetas (solo en velo de modal y avisos).
- ❌ Animaciones de más de 0.6 s o que ignoren `prefers-reduced-motion`.
- ❌ Guardar conversaciones de IA en localStorage/Supabase sin decisión explícita.
- ❌ Enviar datos del panel al asistente sin que el usuario los pegue o lo autorice.

## 10. Checklist antes de entregar

- [ ] Contraste de texto ≥ 4.5:1
- [ ] Focus visible en botones, campos y enlaces
- [ ] Responsive 375 / 768 / 1024 / 1440 sin recortes (menú móvil incluido)
- [ ] Impresión: fondo blanco, sin menús, acentos legibles
- [ ] `prefers-reduced-motion` respetado
- [ ] Montos en RD$ y fechas en es-DO (usar `lib/formato.ts`)
- [ ] Asistente IA: Enter envía, Shift+Enter salta línea, foco visible y móvil sin desbordes
- [ ] 0 errores de consola

## 11. Cómo cambiar el tema

1. Tocar **solo los tokens** en `src/index.css`: `@theme`, `:root`,
   `.documento-factura` y `@media print`.
2. Actualizar la tabla de tokens de este documento.
3. Verificar pantalla, móvil, menú móvil e impresión (checklist 10).

---

> Enfoque de sistema de diseño: tokens → componentes → reglas → checklist.
> Última revisión: 19-oct-2026 (v3 «Claro profesional»).
