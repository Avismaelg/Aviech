# Prospección (módulo del panel)

> Integrado en el panel el 19-oct-2026 (3.ª sesión). Costo: **US$0** (sin claves ni suscripciones).

## Qué hace

Escribe la dirección de una web y busca, **como lo haría un visitante**, sus **correos,
teléfonos y redes sociales**. El módulo visita la página principal y hasta **2 páginas de
contacto / nosotros** del mismo dominio, muestra el nombre del sitio y las páginas revisadas,
y con un clic guarda una **empresa y un contacto en el CRM** (o añade el contacto a la
empresa si ya existe ese dominio).

## Cómo se usa

1. Abre el panel → **Prospección** (o directo: `https://aviech.avismael-eg.workers.dev/#prospeccion`).
2. Escribe la dirección (`tusitio.com` o `https://tusitio.com`) y pulsa **Buscar contactos**
   (tarda entre 2 y 10 segundos).
3. Revisa los hallazgos: cada correo, teléfono y red indica **en qué página apareció**;
   correos y teléfonos son enlaces directos (`mailto:` / `tel:`).
4. Pulsa **Guardar en el CRM**: revisa o edita el nombre de la empresa, el nombre del
   contacto, el correo y el teléfono principal, y confirma. Si la empresa ya estaba en el
   CRM (mismo dominio), se avisa y **solo se añade el contacto**.

Consejos:

- Las webs que cargan todo con **JavaScript** (catálogos, bancos) pueden no mostrar sus datos
  al analizarse; en ese caso, míralas a mano.
- Se descartan correos de relleno (`your@email.com`, `noreply@…`) y se **deduplican**
  teléfonos y redes.
- Es información **pública**: úsala conforme a las leyes de protección de datos al contactar.
- El botón **Ver en el CRM** salta directo a la sección CRM tras guardar.

## Cómo funciona por dentro

- **API**: `worker/index.js` (el mismo Worker de Cloudflare que publica el panel) atiende
  `GET /api/scraper/contactos?url=…`. **Exige la sesión de Supabase** (`Authorization:
  Bearer …`); sin ella responde `401`.
- **Seguridad (SSRF)**: solo `http`/`https`, sin direcciones privadas; solo sigue enlaces
  del **mismo dominio**; máximo **3 páginas** por búsqueda; **12 s por página** y **20 s en
  total**.
- **Extracción**: con expresiones regulares (el plan gratis de Cloudflare da 10 ms de CPU):
  enlaces `mailto:`/`tel:`, correos en el texto, JSON-LD (schema.org), teléfonos con formato
  dominicano primero (`(809) 555-1234`) y enlaces a LinkedIn, Instagram, Facebook, X/Twitter,
  TikTok, YouTube y WhatsApp (las **páginas de empresa** de LinkedIn van primero y se
  descartan enlaces de "compartir").
- **HTML**: se recorta a **200 000 caracteres por página** conservando el inicio **y el
  final** (el pie de página suele tener los contactos).
- **CRM**: usa las tablas `crm_empresas` y `crm_contactos` con RLS — **no hizo falta
  migración**. Las notas del contacto guardan el resumen del hallazgo con la fecha.
- **Límite del plan gratis**: si Cloudflare se queda corto de CPU en sitios gigantes, el
  panel lo avisa con un error claro; se puede ajustar el límite o pasar al plan de
  US$5/mes (solo si algún día hace falta).

## Costo

**US$0 adicionales.** No usa APIs de terceros ni claves de pago: la descarga y el análisis
corren en el Worker (plan gratis de Cloudflare) y los datos se guardan en la base del panel.

## Atribución

Módulo propio del panel. El flujo «pegar una web → contactos → CRM» es común en herramientas
de prospección (por ejemplo, los *lead finders* de los CRM); no se copió código de terceros.

## Prueba

- **Automática, con datos simulados**: `docs/pruebas/prueba-prospeccion.js` (instrucciones en
  `docs/pruebas/README.md`). Verifica búsqueda, guardado (empresa nueva y empresa existente),
  validación, recarga y vista móvil; deja 7 capturas en `capturas-prospeccion`.
- **Worker (real, con Node)**: probado contra sitios reales — `openseo.so` (2 correos, 1
  teléfono y 6 redes) y `banreservas.com` (3 correos, 2 teléfonos en formato dominicano y 5
  redes); errores correctos: `401` sin sesión, `400` sin dirección o privada, `404` ruta
  desconocida y `405` método no permitido.
- **Real (producción)**: busca un sitio conocido del cliente y revisa los hallazgos antes de
  guardar nada.
