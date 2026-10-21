# Diseño del panel — guía maestra (DESIGN.md)

> **Para qué sirve:** que cualquier persona (o IA) que toque la interfaz mantenga
> la misma línea visual sin leer todo el código. Si algo cambia aquí, debe cambiar
> también en `src/index.css` — y al revés.
>
> **Regla de oro:** la app es **cálida y clara** (lienzo crema, tinta y naranja);
> las **facturas, reportes y la impresión** conservan aspecto de papel blanco.

---

## 1. Identidad

- **Concepto (v4 «Open Design · Mastercard», 20-oct-2026):** sistema fintech cálido
  importado de Open Design. Lienzo crema, tinta casi negra, un naranja de señal,
  formas de píldora y tipografía editorial. La estructura sigue la plantilla
  **`dashboard`**: barra lateral flotante en escritorio y cabecera tipo píldora en móvil.
- **Vínculo Open Design:** `.open-design.json` fija `designSystem: mastercard` y
  `skill: dashboard` (modo prototipo). No es una dependencia de ejecución: es la
  referencia de diseño del proyecto.
- **Acento de marca:** naranja `#cf4500` para focos, puntos de señal y enlaces de
  énfasis. Las **acciones primarias van en tinta** (`#141413`), no en naranja: el
  naranja se reserva para acentos y estados activos.
- **Personalidad:** seria (auditoría y consultoría), cálida, editorial y directa.
- **Tipografía:** **Sofia Sans Variable** como única familia, autoalojada con
  `@fontsource-variable/sofia-sans` (sustituto abierto de la tipografía MarkForMC de
  la referencia). **Inter Variable** queda como respaldo. Sin CDN: funciona offline y
  en la PWA.

## 2. Tokens de color (fuente única: `src/index.css` → `@theme`)

| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#f3f0ee` | Lienzo general crema |
| `--color-superficie` | `#fcfbfa` | Tarjetas, modales, barras |
| `--color-superficie-2` | `#ece6df` | Hover, chips, esqueletos |
| `--color-borde` | `#d1cdc7` | Bordes principales |
| `--color-borde-suave` | `#e7e1dc` | Divisores internos |
| `--color-tinta` | `#141413` | Texto principal y botón primario |
| `--color-tinta-suave` | `#5d5852` | Texto secundario |
| `--color-tinta-tenue` | `#6f6963` | Texto terciario, placeholders |
| `--color-accion` | `#141413` | Fondo de acciones primarias y nav activa |
| `--color-accion-hover` | `#2c2a27` | Hover de acciones primarias |
| `--color-arena` | `#f7ece2` | Rellenos cálidos, hover, avatares |
| `--color-arena-borde` | `#e8d4c4` | Borde de rellenos cálidos |
| `--color-clay` | `#9a3a0a` | Enlaces y texto de énfasis sobre arena |
| `--color-acento` | `#cf4500` | Naranja de señal, foco y puntos activos |
| `--color-acento-claro` | `#f37338` | Punto de la nav activa y detalles |

Se usan como utilidades semánticas de Tailwind v4: `bg-superficie`, `text-tinta`,
`border-borde`, `bg-arena`, `text-clay`, `bg-acento`… **Nunca** poner hex crudos
para superficies, texto o marca.

### Estados (semánticos, no marca)

| Token | Significado | Ejemplo |
|---|---|---|
| `exito` | Cobrado, pagado, positivo | insignia «Pagado», balance positivo |
| `aviso` | Pendiente, advertencia, gasto | insignia «Pendiente» |
| `peligro` | Vencido, anulado, eliminar | «Vencido hace 9 días», botón peligro |
| `info` | Informativo o etapa intermedia | «Nueva», servicios en curso |

Los estados conservan su color funcional (verde, ámbar, rojo, azul apagado). No se
usan como acento de marca ni para botones primarios.

## 3. Fondos y atmósfera (`body`)

- Fondo crema sólido, sin rejilla ni degradados. La calidez la aportan las tarjetas,
  los bordes y los rellenos `arena`.
- Las superficies oscuras se limitan a:
  - el panel de marca del **Login** y del **formulario público**;
  - los botones primarios y la píldora de navegación activa;
  - el *tooltip* del gráfico, el velo de los modales y el menú móvil.
- Selección de texto: naranja al 18 %. Foco de teclado: contorno naranja
  `#cf4500` con 3 px de separación.
- Barras y tarjetas usan sombras cálidas y muy bajas; no hay `backdrop-blur` salvo
  en el velo de modales y menús.

## 4. Tipografía y datos

- **Una sola familia:** Sofia Sans (`--font-sans` y `--font-display`), con pesos
  450–600. Titulares con `font-medium` y `tracking-[-0.025em]`.
- **Jerarquía:** título de sección 28–32 px; título de tarjeta 15 px; descripción
  `text-sm text-tinta-suave`; etiquetas `text-[11px]` en mayúsculas con tracking;
  detalles `text-[11px]`.
- **Números:** `tabular-nums` global en `body` (los montos no bailan al animarse).
- **Montos y fechas** siempre con `lib/formato.ts`:
  `formatoDinero` (es-DO, `RD$1,234.56`), `formatoFecha` ("18 oct 2026"),
  `fechaCompleta`, `formatoMes`. Nunca formatear a mano.
- Etiquetas cortas y con `truncate` + `title` cuando puedan ser largas.

## 5. Formas, sombras y movimiento

- **Radios:**
  - botones, insignias y avatares: `rounded-full`;
  - campos: `rounded-[20px]` (textareas `24px`);
  - filas y elementos de nav: `rounded-[18px]`;
  - tarjetas: `rounded-[28px]`;
  - modales: `rounded-[32px]` / `36px` en escritorio;
  - barra lateral: `rounded-[36px]`.
- **Sombras:** cálidas y difusas, nunca duras:
  `0 1px 0 rgba(20,20,19,.03), 0 24px 48px -34px rgba(20,20,19,.3)` en tarjetas;
  `0 40px 90px -40px rgba(20,20,19,.55)` en modales.
- **Animaciones** (`index.css`): `aparecer`, `escalar`, `deslizar`, `fundido`,
  `crecer-barra`. Duraciones 0.2–0.6 s con *ease-out*.
- **Interacción:** hover con elevación leve en tarjetas de datos; botones con
  `active:scale-[0.98]`; transiciones de 150 ms.
- `prefers-reduced-motion`: todas las animaciones se desactivan. ✅

## 6. Componentes (usar SIEMPRE `src/components/ui.tsx`)

| Componente | Notas |
|---|---|
| `Boton` | `rounded-[20px]`. Variantes: `primario` (tinta sólida, hover `accion-hover`), `secundario` (superficie con borde), `peligro` (rojo sólido), `fantasma`. |
| `Insignia` | Píldora pastel con borde; recibe `color` del mapa de estados. |
| `Tarjeta` | `rounded-[28px]`, borde `--color-borde`, `bg-superficie` y sombra cálida baja. |
| `CabeceraSeccion` | Título 28–32 px + descripción + acciones. |
| `Campo` / `Entrada` / `Selector` / `AreaTexto` | `claseEntrada` (`lib/estilos.ts`): superficie, borde cálido, hover tinta/30 y foco naranja con anillo de 4 px. En móvil el texto base es 16 px para evitar el zoom de iOS. |
| `Modal` | Velo `bg-tinta/45` + blur; panel `rounded-[32px]`/`36px`; se cierra con Escape, clic fuera o la X; cabecera fija, bloqueo del scroll y auto-foco. Se monta en un **portal al `body`** para que ninguna animación de sección lo recorte. |
| `Confirmar` | Modal pequeño con botón de peligro. |
| `BotonIcono` | Círculo con etiqueta accesible (`title` + `aria-label`). |
| `Vacio`, `FilasCargando`, `ErrorTabla` | Estado vacío con icono en `arena`, esqueleto `animate-pulse` y aviso ámbar claro. |

### Layout y navegación

- **Escritorio (≥ 1024 px):** barra lateral flotante de 256 px, separada 16 px del
  borde, con marca, navegación agrupada (**Operación / Herramientas / Finanzas**),
  tarjeta de usuario y «Sistema privado».
- **Móvil/tablet (< 1024 px):** cabecera flotante tipo píldora con marca, avatar y
  menú; el menú se abre como hoja modal a dos columnas con los mismos grupos.
- **Nav activa:** píldora de tinta con texto claro y punto naranja a la derecha.
  Los grupos llevan un punto naranja como señal.
- **Barra de contexto:** sobre el contenido, ruta «AviTech · Sección · descripción»,
  fecha en español y acceso al **Asistente IA** en escritorio.
- **Enlaces profundos:** la sección activa vive en la URL (`#inicio`, `#clientes`…).

### Componentes de producto

| Componente | Notas |
|---|---|
| `Asistente IA` | En escritorio se abre desde el botón **Asistente IA** de la barra de contexto; en móvil, desde el icono de destellos de la cabecera fija (junto al avatar y el menú). Panel de 400 px en escritorio y hoja inferior en móvil. Cabecera con estado, nueva conversación y cerrar; sugerencias iniciales, indicador de escritura y compositor con `Enter` para enviar y `Shift+Enter` para salto de línea. No guarda historial ni ve la base de datos. |
| `Login` | Dos columnas: panel de marca en tinta con órbita naranja + tarjeta de superficie con acceso. Píldora «Acceso privado», ver/ocultar contraseña y error legible. En móvil se apila. |
| `Inicio` | Hero editorial con saludo capitalizado, acciones rápidas, KPIs, gráfica de ingresos (barras de tinta + mes actual naranja), tarjeta de ingreso recurrente y anillo de cobro. |
| `CRM` | Pestañas accesibles (flechas ←/→), kanban horizontal, arrastre nativo y edición en modal. |
| `Talento` | Contenedor con 5 pestañas (Resumen, Candidatos, Empresas, Vacantes y Procesos), tarjetas de métricas y kanban de 6 etapas en rejilla de 3 columnas en escritorio (1 en móvil, 2 en tablet), con arrastre nativo y detalle en modal. Reutiliza `Boton`, `Insignia`, `Tarjeta`, `Campo` y `Modal`. |
| `Talento público` | Página `/talento` sin sesión con dos modos tipo pestaña («Busco empleo» y «Busco talento»). Perfiles anónimos en tarjetas, shortlist flotante y solicitud en modal; formulario de CV con carga directa al bucket privado. En móvil apila columnas y mantiene la barra de shortlist sobre el área segura. |
| `Auditor SEO` | Puntaje 0–100 (verde ≥ 80, ámbar ≥ 50, rojo < 50), comprobaciones agrupadas y columna de PageSpeed + ficha técnica. |
| `Prospección` | Validación en línea, hallazgos de correo/teléfono/redes y guardado en el CRM con aviso si la empresa ya existe. |
| `Solicitudes` | Bandeja con 4 tarjetas (2×2 en móvil), búsqueda, filtro por estado y filas con origen, urgencia, estado y acciones. El detalle muestra plan, confianza, datos pendientes, propuesta, correo, informe descargable y enlace a Servicios. |
| `Solicitud pública` | Página `/solicitud` sin sesión: panel de marca en tinta + formulario de superficie con consentimiento, honeypot invisible y pantalla de éxito con folio. En móvil se oculta el panel de marca y se muestra una cabecera compacta. |

- **Actualización PWA:** el service worker usa red primero para la página y caché para
  recursos; al detectar una versión nueva se activa y **recarga una sola vez**
  (`src/main.tsx`). Subir `VERSION` en `public/sw.js` con cada cambio de caché.
  Versión actual: `avitech-v2026-10-21-talento`.

## 7. Regla de oro: factura e impresión en claro

- `.documento-factura` fija tokens de papel incluso en pantalla.
- `@media print`: fondo blanco, se ocultan `aside`, `header`, la barra de contexto
  y todo `.no-imprimir`; se quitan sombras, `main.area-impresion` pierde el margen
  de la barra lateral y `.area-impresion-contenido` pierde el padding.
- La factura ocupa todo el ancho imprimible: sin borde de tarjeta, sin radio y sin
  padding interno; el margen de papel lo aporta `@page`.
- Los acentos de estado vuelven a tonos legibles sobre papel
  (`#047857`, `#b45309`, `#b91c1c`, `#1d4ed8`), las insignias pasan a gris claro
  y `@page` fija un margen de 12 mm.
- `.solo-impresion`: bloques que solo existen en el papel.
- **Nunca** imprimir la barra lateral flotante, el menú móvil, el asistente ni los
  botones de acción.

## 8. Do's

- Reutilizar componentes y tokens antes de crear nada nuevo.
- Íconos: `lucide-react` (nada de emojis como íconos 😉).
- Reservar la tinta para lo primario y el naranja para señal/foco.
- Probar en **375 / 768 / 1024 / 1440 px** y con **Ctrl+P**.
- Mantener contraste: texto normal ≥ 4.5:1; foco visible en todo lo interactivo.
- Mantener el menú móvil cerrado al elegir una sección.
- Capitalizar nombres visibles (correo → «María»), no dejarlos en minúscula.

## 9. Don'ts (anti-patrones)

- ❌ Volver a la barra superior fija en escritorio o a la nav azul de la v3.
- ❌ Usar azul/índigo como acento de marca o reintroducir degradados violeta.
- ❌ Poner botones primarios naranjas: el naranja es señal, no acción.
- ❌ Hex crudos de Tailwind para superficies/texto (usar tokens).
- ❌ Mezclar botones cuadrados con píldoras o radios arbitrarios.
- ❌ Texto tenue como color principal o texto blanco sobre fondos claros.
- ❌ Sombras duras, bordes negros o resplandores de color.
- ❌ `backdrop-blur` en barras y tarjetas (solo en velo de modal y menús).
- ❌ Animaciones de más de 0.6 s o que ignoren `prefers-reduced-motion`.
- ❌ Guardar conversaciones de IA en localStorage/Supabase sin decisión explícita.
- ❌ Enviar datos del panel al asistente sin que el usuario los pegue o lo autorice.

## 10. Checklist antes de entregar

- [ ] Contraste de texto ≥ 4.5:1
- [ ] Focus visible en botones, campos y enlaces
- [ ] Responsive 375 / 768 / 1024 / 1440 sin recortes (menú móvil incluido)
- [ ] Formulario público `/solicitud` sin recortes a 390 px y con consentimiento visible
- [ ] Portal `/talento` sin recortes a 390 px, perfiles sin datos de contacto y shortlist usable
- [ ] Modales abiertos desde cualquier sección sin recortes (portal al `body`)
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
4. Si se cambia la tipografía, instalar la fuente con `@fontsource-variable/…`
   (autoalojada) y actualizar `--font-sans` / `--font-display`.

---

> Enfoque de sistema de diseño: tokens → componentes → reglas → checklist.
> Última revisión: 20-oct-2026 (v4 «Open Design · Mastercard» + barra lateral flotante).
