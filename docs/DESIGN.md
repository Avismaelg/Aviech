# Diseño — guía maestra del panel y del sitio (DESIGN.md)

> **Para qué sirve:** que cualquier persona (o IA) que toque la interfaz mantenga
> la misma línea visual sin leer todo el código. Si algo cambia aquí, debe cambiar
> también en `src/index.css` — y al revés.
>
> **Dos sistemas deliberados:** el **panel interno** es cálido y claro (lienzo crema,
> tinta y naranja, v4 «Open Design · Mastercard»); el **sitio comercial** en `/` usa la
> paleta azul del brief (marino, eléctrico y verde) y vive dentro de `.sitio-comercial`.
> Las **facturas, reportes y la impresión** conservan aspecto de papel blanco.

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
| `Sitio comercial` | Portada pública en `/` con su propia paleta. Cabecera sticky con nav de anclas, CTA y menú móvil; hero de dos columnas con composición CSS de navegador/panel (sin imágenes pesadas); tarjetas de servicio con entregables; sección oscura de necesidades; proceso en cuatro pasos; tres demostraciones con miniaturas CSS y etiqueta «Demostración»; equipo en tarjetas; cuatro paquetes (el destacado en marino); preguntas frecuentes con `<details>` nativos y formulario de contacto con consentimiento y detalles de privacidad. Las páginas `/privacidad` y `/terminos` reutilizan la marca y los tokens del sitio. Los textos pequeños en azul usan `electrico-texto` (`#005FCC`) para contraste AA. No reutiliza los tokens cálidos del panel. |
| `Asistente IA` | En escritorio se abre desde el botón **Asistente IA** de la barra de contexto; en móvil, desde el icono de destellos de la cabecera fija (junto al avatar y el menú). Panel de 400 px en escritorio y hoja inferior en móvil. Cabecera con estado, nueva conversación y cerrar; sugerencias iniciales, indicador de escritura y compositor con `Enter` para enviar y `Shift+Enter` para salto de línea. No guarda historial ni ve la base de datos. |
| `Login` | Dos columnas: panel de marca en tinta con órbita naranja + tarjeta de superficie con acceso. Píldora «Acceso privado», ver/ocultar contraseña y error legible. En móvil se apila. |
| `Inicio` | Hero editorial con saludo capitalizado, acciones rápidas, KPIs, gráfica de ingresos (barras de tinta + mes actual naranja), tarjeta de ingreso recurrente y anillo de cobro. |
| `CRM` | Pestañas accesibles (flechas ←/→), kanban horizontal, arrastre nativo y edición en modal. |
| `Talento` | Contenedor con 5 pestañas (Resumen, Candidatos, Empresas, Vacantes y Procesos), tarjetas de métricas y kanban de 6 etapas en rejilla de 3 columnas en escritorio (1 en móvil, 2 en tablet), con arrastre nativo y detalle en modal. El **Resumen** incluye la tarjeta **Solicitudes de empresas** (candidato, empresa, tipo entrevista/contratación y mensaje; botón a Procesos) y la tarjeta **Mantenimiento de CV** (busca PDF sin candidato en el bucket privado y los borra con confirmación). Reutiliza `Boton`, `Insignia`, `Tarjeta`, `Campo` y `Modal`. |
| `Talento público` | Página `/talento` sin sesión con dos modos tipo pestaña («Busco empleo» y «Busco talento»). Perfiles anónimos en tarjetas, shortlist flotante y solicitud en modal; formulario de CV con carga directa al bucket privado. Incluye la tarjeta **Postulación inteligente** (destellos, casilla de autorización, máximo 3) y el resultado de la IA con puntaje y motivo. Si el navegador ya guardó el token del perfil, bajo el correo aparece la nota verde «En este navegador ya guardamos tu perfil…» y el éxito se titula **Perfil actualizado**. Si el correo existe en otro dispositivo, se muestra el aviso informativo **Ese correo ya tiene un perfil** con el botón «Usar otro correo» (nunca se revelan datos del perfil). En móvil apila columnas y mantiene la barra de shortlist sobre el área segura. |
| `Auditor SEO` | Puntaje 0–100 (verde ≥ 80, ámbar ≥ 50, rojo < 50), comprobaciones agrupadas y columna de PageSpeed + ficha técnica. |
| `Prospección` | Validación en línea, hallazgos de correo/teléfono/redes y guardado en el CRM con aviso si la empresa ya existe. |
| `Solicitudes` | Bandeja con 4 tarjetas (2×2 en móvil), búsqueda, filtro por estado y filas con origen, urgencia, estado y acciones. El detalle muestra plan, confianza, datos pendientes, propuesta, correo, informe descargable y enlace a Servicios. |
| `Solicitud pública` | Página `/solicitud` sin sesión: panel de marca en tinta + formulario de superficie con consentimiento, honeypot invisible y pantalla de éxito con folio. En móvil se oculta el panel de marca y se muestra una cabecera compacta. |

- **Interactividad del sitio (12.ª sesión, 21-oct, local):** el hero usa un canvas de
  partículas (24 en móvil/equipos ligeros, 52 en escritorio), parallax 3D con el
  puntero sobre las capas del producto y una reacción de pulso al hacer clic. No se
  usa Three.js ni ninguna librería de animación: CSS 3D + canvas + `requestAnimationFrame`.
  Las tarjetas de servicio usan `useTilt` (`--rx`, `--ry`, `--mx`, `--my`), brillo radial
  y una línea de detalle que aparece con hover o `:focus-within`; en táctil el detalle
  queda visible y la inclinación se desactiva. Las secciones usan `[data-revelar]` con
  `IntersectionObserver` (una sola vez) y un `rootMargin` moderado. La navegación tiene
  subrayado degradado y los botones `boton-primario`/`boton-secundario` tienen press,
  foco y desplazamiento de icono.
- **Reglas de rendimiento y accesibilidad:** el canvas se pausa cuando el hero sale de
  pantalla o la pestaña se oculta; la inclinación y el parallax se desactivan con
  `prefers-reduced-motion`, puntero táctil o equipos con ≤ 4 núcleos/≤ 4 GB; todos los
  listeners y frames se limpian al desmontar. Con movimiento reducido las secciones se
  muestran de inmediato y los transforms quedan en `none`. La prueba
  `docs/pruebas/prueba-interaccion.js` verifica parallax, clic, partículas, tarjetas,
  foco, navegación, botones, scroll, móvil y reducción de movimiento.
- **Actualización PWA:** el service worker usa red primero para la página y caché para
  recursos; al detectar una versión nueva se activa y **recarga una sola vez**
  (`src/main.tsx`). Subir `VERSION` en `public/sw.js` con cada cambio de caché.
  Versión actual: `avitech-v2026-10-22-auditoria`.
- **Rendimiento (10.ª y 11.ª sesión):** `src/main.tsx` carga con `lazy` solo la página
  que toca (`/`, `/panel`, `/solicitud` o `/talento`) y `App.tsx` carga cada sección
  bajo `Suspense`; React y Supabase viajan en chunks de vendor separados
  (`vite.config.ts`) y las listas públicas responden con caché de navegador de 60 s.
  Al añadir una sección nueva, importarla con `lazy` y declarar su `<Suspense>` dentro
  del armazón.
- **Sitio comercial (11.ª sesión):** tokens propios en `@theme` (`marino`,
  `electrico`, `electrico-texto`, `electrico-suave`, `verde`, `verde-suave`,
  `grafito`, `acero`, `niebla`, `borde-azul`). El foco del sitio se pinta azul dentro de
  `.sitio-comercial`; la cuadrícula del hero es `.cuadricula-sitio`; el desplazamiento
  suave solo se activa con `html:has(.sitio-comercial)` y respeta
  `prefers-reduced-motion`. El manifest de la PWA abre en `/panel`.
- **Página 404 y metadatos (13.ª sesión):** las rutas desconocidas devuelven
  `404.html` con estado HTTP 404 y `robots: noindex`; `_redirects` sirve la portada
  con 200 para `/panel`, `/solicitud`, `/talento`, `/privacidad` y `/terminos`, con o
  sin barra final (`/` se sirve directamente como portada).
  En desarrollo, `main.tsx` conserva `NoEncontrada` como respaldo. `/talento` tiene
  canónica propia y ya no se excluye de buscadores; las páginas legales actualizan su
  canónica al entrar. La PWA usa `icon-192.png`, `icon-512.png` y
  `apple-touch-icon.png`, y `public/_headers` aplica seguridad (`nosniff`, `DENY`,
  `Referrer-Policy`, `Permissions-Policy`, HSTS) y caché larga a los activos con hash.
  El `og-image.png` (1200×630) sigue siendo la imagen social.

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

- ❌ Volver a la barra superior fija en escritorio o a la nav azul de la v3 **en el panel**.
- ❌ Usar azul/índigo como acento de marca **en el panel** o reintroducir degradados violeta. (El sitio comercial es la excepción deliberada: su paleta azul está aislada en `.sitio-comercial`.)
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
- [ ] Sitio comercial `/` sin recortes a 390 / 768 / 1024 / 1440, menú móvil accesible y formulario con validación y consentimiento
- [ ] Contraste AA en textos azules pequeños del sitio (usar `electrico-texto`, no `electrico` brillante)
- [ ] Portal `/talento` sin recortes a 390 px, perfiles sin datos de contacto y shortlist usable
- [ ] Postulación con IA: autorización explícita, máximo 3, resultado legible y sin exponer correo/CV
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
