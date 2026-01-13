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

  if (!btnMsg) return !0; // Continuar flujo si no hay botón

  // 2. Filtro estricto: Solo procesar si es un mensaje de grupo
  // Usamos m.isGroup que ya viene definido en la mayoría de handlers
  if (!m.isGroup) return !0;

  try {
    // 3. Obtener el ID seleccionado (el comando)
    const command = btnMsg.selectedButtonId || btnMsg.singleSelectReply?.selectedRowId;
    if (!command) return !0;

    // 4. Modificar el objeto 'm' para que el bot lo procese como texto
    // Esto es lo que permite que el handler principal ejecute el comando
    m.message = {
      conversation: command
    };
    
    // Sincronización de propiedades para coherencia en todos los plugins
    m.text = command; 
    
    // Aseguramos el remitente (quien presionó el botón)
    m.sender = m.participant || m.key.participant || m.key.remoteJid;

    // Log opcional para debug (puedes comentarlo)
    // console.log(`[ButtonResponse] ${m.sender} ejecutó: ${command}`);

  } catch (err) {
    console.error('❌ Error en el manejador de botones:', err);
  }

  return !0; // Retornar true para que el flujo siga y el bot ejecute el comando inyectado
};

export default handler;
