/**
 * Plugin centralizado para manejar respuestas de botones.
 * Se ejecuta en cada mensaje (handler.all) igual que el sistema de audios.
 */

const handler = m => m;

handler.all = async function (m) {
  // 1. Detectar si el mensaje es una respuesta de botón
  const btnMsg =
    m.message?.buttonsResponseMessage ||
    m.message?.templateButtonReplyMessage ||
    m.message?.listResponseMessage;

  if (!btnMsg) return !0; 

  if (!m.isGroup) return !0;

  try {
    // 2. Obtener el ID seleccionado
    const command = btnMsg.selectedButtonId || btnMsg.singleSelectReply?.selectedRowId;
    if (!command) return !0;

    // 3. Modificar el mensaje para que el bot lo procese como texto
    m.message = {
      conversation: command
    };

    m.text = command; 

    // ✅ SOLUCIÓN AL ERROR: Redefinimos la propiedad de forma segura
    const senderId = m.participant || m.key.participant || m.key.remoteJid;
    Object.defineProperty(m, 'sender', {
      value: senderId,
      writable: true,
      configurable: true,
      enumerable: true
    });

  } catch (err) {
    console.error('❌ Error en el manejador de botones:', err);
  }

  return !0; 
};

export default handler;