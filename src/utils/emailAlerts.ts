import emailjs from '@emailjs/browser';

export interface DatosAlertaCaja {
  usuario: string; // Nombre del especialista u operador que cierra la caja
  montoEfectivoEsperado: number;
  montoEfectivoReal: number;
  diferencia: number; // Faltante (negativo) o Sobrante (positivo)
  fechaHora?: string;
  totalVentas?: number;
  observaciones?: string;
}

export interface DatosAlertaStock {
  producto: string;
  stockActual: number;
  stockMinimo?: number;
  categoria?: string;
}

const metaEnv = (import.meta as any).env || {};

// Configuración de credenciales de EmailJS obtenidas de variables de entorno (Vite)
const SERVICE_ID = metaEnv.VITE_EMAILJS_SERVICE_ID || 'service_nas_studio';
const TEMPLATE_ID_CAJA = metaEnv.VITE_EMAILJS_TEMPLATE_ID_CAJA || 'template_alerta_caja';
const TEMPLATE_ID_STOCK = metaEnv.VITE_EMAILJS_TEMPLATE_ID_STOCK || 'template_alerta_stock';
const PUBLIC_KEY = metaEnv.VITE_EMAILJS_PUBLIC_KEY || 'user_nas_public_key';

/**
 * Envía una alerta por correo sobre un cierre de caja o descuadre de dinero en efectivo.
 */
export async function enviarAlertaCaja(datos: DatosAlertaCaja): Promise<{ success: boolean; message: string }> {
  const templateParams = {
    usuario: datos.usuario,
    efectivo_esperado: `$${datos.montoEfectivoEsperado.toFixed(2)} USD`,
    efectivo_real: `$${datos.montoEfectivoReal.toFixed(2)} USD`,
    diferencia: `$${datos.diferencia.toFixed(2)} USD`,
    estado_descuadre: datos.diferencia !== 0 ? (datos.diferencia < 0 ? 'FALTANTE EN CAJA' : 'SOBRANTE EN CAJA') : 'CUADRADO CORRECTO',
    fecha_hora: datos.fechaHora || new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
    total_ventas: datos.totalVentas ? `$${datos.totalVentas.toFixed(2)} USD` : 'N/A',
    observaciones: datos.observaciones || 'Sin observaciones.',
  };

  try {
    if (!metaEnv.VITE_EMAILJS_SERVICE_ID) {
      console.info('📧 [EmailJS Simulado - Alerta Caja]:', templateParams);
      return { success: true, message: 'Alerta de caja procesada (Modo simulación EmailJS)' };
    }

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_CAJA, templateParams, PUBLIC_KEY);
    console.log('📧 EmailJS Alerta Caja enviado exitosamente:', response.status, response.text);
    return { success: true, message: 'Alerta de correo enviada correctamente.' };
  } catch (error: any) {
    console.warn('⚠️ Error al enviar alerta de caja con EmailJS:', error);
    return { success: false, message: error?.text || 'Error en envío de correo EmailJS' };
  }
}

/**
 * Envía una alerta por correo cuando un producto/insumo alcanza un nivel crítico de stock.
 */
export async function enviarAlertaStock(
  producto: string,
  cantidad: number,
  stockMinimo: number = 5,
  categoria: string = 'General'
): Promise<{ success: boolean; message: string }> {
  const templateParams = {
    producto,
    cantidad_actual: cantidad,
    stock_minimo: stockMinimo,
    categoria,
    fecha_hora: new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
  };

  try {
    if (!metaEnv.VITE_EMAILJS_SERVICE_ID) {
      console.info('📧 [EmailJS Simulado - Alerta Stock Crítico]:', templateParams);
      return { success: true, message: 'Alerta de stock procesada (Modo simulación EmailJS)' };
    }

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_STOCK, templateParams, PUBLIC_KEY);
    console.log('📧 EmailJS Alerta Stock enviado exitosamente:', response.status, response.text);
    return { success: true, message: 'Alerta de stock enviada correctamente.' };
  } catch (error: any) {
    console.warn('⚠️ Error al enviar alerta de stock con EmailJS:', error);
    return { success: false, message: error?.text || 'Error al enviar alerta de stock' };
  }
}
