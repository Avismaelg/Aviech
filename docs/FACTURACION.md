# Facturación (NCF / e-NCF)

## Cómo se usa

1. Entra a **Facturación** → **Nueva factura**.
2. Elige el cliente (su RNC se guarda en el comprobante), el **tipo de comprobante** y
   escribe el **NCF** (si ya lo tienes; en borrador puede ir vacío).
3. Agrega las **líneas** (descripción, cantidad, precio): el **ITBIS 18%** y el total se
   calculan solos.
4. Guarda como **borrador** (se puede editar o eliminar) o como **emitida**
   (exige NCF válido y ya no se edita).
5. En la lista:
   - 👁 **Ver / Imprimir** abre la factura lista para guardar en PDF.
   - ✔ **Marcar como pagada** (solo emitidas): registra el ingreso en **Pagos** automáticamente.
   - ✕ **Anular** (solo emitidas): la factura deja de contar en reportes; el registro se conserva.
   - ✎ / 🗑 solo para **borradores**.

## Reglas fiscales aplicadas

- **NCF tradicional**: `B` + 10 dígitos (ej. `B0200000001`); el prefijo debe coincidir con
  el tipo: B01 (crédito fiscal), B02 (consumo), B14 (regímenes especiales), B15 (gubernamental).
- **e-NCF**: `E` + 12 dígitos (ej. `E320000000001`); tipos E31, E32, E44 y E45.
- Una factura emitida **no se edita**: se anula y se reemite (así lo pide la práctica fiscal).
- Las facturas anuladas no cuentan en «Facturado» de los reportes.

## Qué falta para el e-CF real (DGII)

1. **Datos fiscales de la empresa** → completar `src/lib/empresa.ts` (razón social exacta,
   RNC, dirección, teléfono y correo). Salen impresos en el encabezado de cada factura.
2. **Certificado digital (.p12)** y la **certificación como emisor e-CF** ante DGII
   (trámite de la empresa, no del panel).
3. **Conectar el envío**: generar el XML del comprobante, firmarlo con el certificado y
   transmitirlo a DGII (se puede hacer con una función en la nube + credenciales seguras;
   requiere los pasos 1 y 2).

Hasta entonces, el panel **registra, imprime y controla** los comprobantes internamente;
no transmite nada a DGII por sí solo.
