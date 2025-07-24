// lib/botones.js
import { proto } from '@whiskeysockets/baileys'

/**
 * Maneja respuestas de botones (solo en grupos) modificando el mensaje 'm'
 * para que se procese como un comando textual por el manejador principal.
 *
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {proto.IWebMessageInfo} m
 * @returns {Promise<boolean>} Retorna true si el mensaje fue una respuesta de botón y se modificó para procesamiento.
 */
export async function manejarRespuestasBotones(conn, m) {
  try {
    const btnMsg =
      m?.message?.buttonsResponseMessage ||
      m?.message?.templateButtonReplyMessage
    if (!btnMsg) return false

    // Solo procesar si es un mensaje de grupo
    if (!m.key.remoteJid || !m.key.remoteJid.endsWith('@g.us')) {
      return false
    }

    const command = btnMsg.selectedButtonId
    if (!command) return false

    // Modificamos directamente el objeto 'm' para que el handler principal
    // lo procese como si fuera un mensaje de conversación con el comando.
    // Esto evita la duplicación y el ReferenceError.
    m.message = {
      conversation: command
    };
    // También ajustamos otras propiedades si es necesario para la coherencia
    m.text = command; // Aseguramos que m.text también refleje el comando
    m.pushName = m.pushName || ''; // Mantener el pushName
    m.sender = m.participant || m.key.participant || m.key.remoteJid; // Asegurar el remitente

    // Si existe la función global externa personalizada, la llamamos.
    // Esta función podría ser un punto de monitoreo o de lógica adicional.
    // No debería duplicar el despacho del comando si el flujo de `handler.js`
    // ya lo va a procesar a través de `m.message.conversation`.
    if (typeof global.dispatchCommandFromButton === 'function') {
      // Pasamos el mensaje modificado para que el dispatcher lo vea como un comando
      await global.dispatchCommandFromButton(m); // Pasamos 'm' directamente, ya modificado
    }

    // Retornamos true para indicar que el mensaje fue procesado como botón
    // y para que el handler principal continúe procesando 'm' (ahora modificado)
    // como un mensaje de conversación, sin duplicación.
    return true;

  } catch (err) {
    console.error('❌ Error en manejarRespuestasBotones:', err);
    return false;
  }
}