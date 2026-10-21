# Lanzamiento y puesta en marcha del negocio

> El sitio ya está publicado. Lo que falta para **empezar a vender** son datos y
> cuentas que solo puede aportar el titular del negocio. Esta guía separa lo que ya
> está hecho de lo que hay que completar, en orden.

## Estado actual

- Sitio comercial: **https://aviech.avismael-eg.workers.dev/**
- Panel interno: **https://aviech.avismael-eg.workers.dev/panel**
- Formulario de solicitudes: funciona y guarda en Supabase.
- Talento, CRM, Prospección, Facturación y Reportes: operativos.
- Privacidad y términos: publicados en `/privacidad` y `/terminos`.
- Alertas por Telegram: implementadas; se activan al configurar los secretos.
- Costo actual: **US$0/mes** (Cloudflare y Supabase en planes gratuitos). El dominio
  es el único gasto nuevo recomendado.

## 1. Datos que hay que completar

Copia esta lista y complétala. Con esos datos actualizo la configuración y las páginas
legales.

```text
Razón social exacta:
RNC:
Dirección fiscal:
Teléfono comercial:
WhatsApp (con código de país, solo dígitos):
Correo comercial:
Dominio deseado:
Banco y cuenta para pagos:
¿Facturas con NCF/e-CF desde el inicio?:
```

Mientras no estén:

- El sitio **oculta** WhatsApp, correo y teléfono; el formulario sigue siendo el canal.
- Las facturas no deben entregarse a clientes sin RNC y datos fiscales reales
  (`src/lib/empresa.ts`).

## 2. Dominio propio (recomendado)

Opciones:

| Opción | Costo aproximado | Nota |
|---|---|---|
| **Cloudflare Registrar** | ~US$10–12/año por un `.com` | Venta a costo, DNS incluido, sin renovación sorpresa |
| Namecheap / Porkbun | ~US$10–15/año | Alternativa conocida |
| Subdominio gratis (`is-a.dev`, etc.) | US$0 | Se ve menos profesional; requiere aprobación externa |

Pasos con Cloudflare:

1. Comprar el dominio en **Cloudflare Dashboard → Domain Registration** (o registrar
   en otro proveedor y cambiar los nameservers a Cloudflare).
2. En **Workers & Pages → aviech → Settings → Domains & Routes**, agregar el dominio
   personalizado (por ejemplo `avitech.do` y `www.avitech.do`).
3. Actualizar el dominio en el código:
   - `VITE_SITIO_URL` en `.env.production` (y en el build de Cloudflare si se usa).
   - `public/robots.txt` (línea `Sitemap:`).
   - `public/sitemap.xml` (todas las `loc`).
   - `SITIO_URL` en `wrangler.jsonc` (para los enlaces de las alertas).
4. Hacer commit, push y esperar el despliegue.
5. Comprobar `https://TU-DOMINIO/`, `/panel`, `/privacidad` y `/terminos`.

## 3. Correo comercial

Opciones gratuitas:

1. **Cloudflare Email Routing + Gmail** (recomendado): crear
   `hola@tudominio.com`, reenviar a un Gmail y responder desde Gmail con la identidad
   del dominio. Requiere el dominio en Cloudflare.
2. **Zoho Mail Free**: hasta 5 usuarios y un dominio propio; interfaz completa.

Pasos con Cloudflare:

1. **Email → Email Routing** → habilitar.
2. Crear la dirección `hola@tudominio.com` y verificar el correo destino.
3. Agregar los registros MX/SPF/DKIM que indica Cloudflare.
4. Enviar una prueba desde otro correo y responder.

Después, poner el correo en `VITE_CONTACTO_CORREO` y en `EMPRESA.correo`.

## 4. WhatsApp Business

1. Instalar **WhatsApp Business** en un teléfono dedicado (o usar el número actual).
2. Completar el perfil: nombre comercial, categoría, descripción, dirección, horario,
   sitio web y correo.
3. Crear respuestas rápidas para: saludo, precios, plazo, formas de pago y despedida.
4. Configurar el número en `VITE_WHATSAPP` (solo dígitos, con código de país; por
   ejemplo `18095551234`). Sin ese valor, el botón flotante y el enlace del formulario
   no se muestran.
5. Probar el enlace `https://wa.me/18095551234?text=Hola` desde un teléfono.

## 5. Alertas de solicitudes por Telegram (gratis, 5 minutos)

1. En Telegram, abrir **@BotFather**, enviar `/newbot`, elegir nombre y usuario.
2. Copiar el **token** que entrega BotFather.
3. Abrir el bot y enviarle cualquier mensaje.
4. Visitar `https://api.telegram.org/bot<TOKEN>/getUpdates` y copiar el valor de
   `result[0].message.chat.id` (o usar **@userinfobot**).
5. Guardar los secretos en Cloudflare:
   ```powershell
   cd C:\Users\User\avitech\avitech-panel
   npx wrangler secret put TELEGRAM_BOT_TOKEN
   npx wrangler secret put TELEGRAM_CHAT_ID
   ```
   También se pueden pegar en **Cloudflare → Workers & Pages → aviech → Settings →
   Variables** como *secret*.
6. Probar con una solicitud real de prueba desde `/` (luego se puede borrar desde el
   panel). El mensaje debe llegar en segundos con el enlace a `/panel#solicitudes`.

El token no se escribe nunca en el repositorio ni en el chat.

## 6. Legal, fiscal y cobros

- Revisar `/privacidad` y `/terminos` con un abogado antes de firmar con clientes.
- Completar `src/lib/empresa.ts` con razón social, RNC, dirección, teléfono y correo.
- Definir la cuenta bancaria y el esquema de pago (propuesta inicial: 50% al inicio,
  50% contra entrega; mantenimiento mensual).
- Confirmar si se emitirán **NCF/e-CF** desde el primer cliente. El panel ya calcula
  ITBIS 18% y genera facturas; el timbrado electrónico con DGII requiere certificado y
  configuración aparte (`docs/FACTURACION.md`).
- Conservar contratos, propuestas aceptadas y comprobantes de pago.

## 7. Buscadores y presencia

1. Crear **Google Search Console** con la cuenta del negocio.
2. Verificar el dominio por DNS (registro TXT en Cloudflare).
3. Enviar `https://TU-DOMINIO/sitemap.xml`.
4. Crear/verificar el **Perfil de Empresa en Google** (dirección, horario, teléfono,
   categoría, fotos reales).
5. Usar la misma descripción y enlaces en Instagram, LinkedIn y WhatsApp Business.
6. Publicar contenido útil (casos demostrativos, guías de digitalización) sin inventar
   clientes ni resultados.

## 8. Primeros clientes (flujo de trabajo)

1. **Prospección:** buscar empresas locales con web y correo; guardarlas en el CRM.
2. **Contacto:** usar la plantilla de `docs/COMERCIAL.md`; ofrecer un diagnóstico breve,
   no una venta a presión.
3. **Solicitud:** pedir que completen el formulario del sitio (queda registrada con
   folio y alerta).
4. **Diagnóstico:** llamada de 20–30 minutos; entender proceso, dolores y presupuesto.
5. **Propuesta:** alcance, entregables, cronograma, precio, forma de pago y validez
   (15 días). Ver plantilla.
6. **Contrato/anticipo:** aceptación escrita y primer pago antes de empezar.
7. **Ejecución:** hitos semanales; el panel registra clientes, servicios y pagos.
8. **Entrega:** capacitación, documentación y garantía de 30 días por defectos.
9. **Factura:** emitir con los datos fiscales reales.
10. **Soporte:** ofrecer mantenimiento mensual; pedir referencia/testimonio **solo con
    autorización escrita**.

## 9. Seguridad y operación

- Revocar el token CLI de Supabase que ya no se usa y confirmar el respaldo semanal.
- Mantener el registro público cerrado; los usuarios del panel se crean a mano.
- No poner la `service_role` en el frontend ni en Git.
- Activar **Turnstile** cuando haya claves de Cloudflare (los formularios ya tienen
  límites en base y honeypot).
- Verificar el correo del portal de talento cuando exista proveedor (hoy se usa token
  en el navegador).
- Un solo servidor de desarrollo a la vez; `NODE_OPTIONS` ya está limitado a 4096 MB.

## 10. Métricas para la primera semana

- Solicitudes recibidas y tiempo de primera respuesta.
- Diagnósticos agendados / solicitudes.
- Propuestas enviadas / diagnósticos.
- Propuestas aceptadas / enviadas.
- Ticket promedio y anticipos cobrados.
- Visitas al sitio (cuando se active analítica) y origen del tráfico.

Revisar estos números cada viernes y ajustar el mensaje del sitio y el seguimiento.

## Checklist final

- [ ] Datos fiscales y de contacto completos.
- [ ] Dominio propio comprado y conectado.
- [ ] Correo `hola@` funcionando.
- [ ] WhatsApp Business con número en el sitio.
- [ ] Alertas de Telegram probadas.
- [ ] Privacidad y términos revisados.
- [ ] Cuenta bancaria y política de pagos definidas.
- [ ] Facturación con RNC/NCF probada.
- [ ] Search Console y sitemap enviados.
- [ ] Primer diagnóstico agendado.
