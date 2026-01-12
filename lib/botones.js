/**
 * Función desactivada para ceder el control al nuevo plugin de botones.
 * Retorna siempre false para que el handler principal ignore la respuesta de botón aquí.
 */
export async function manejarRespuestasBotones(conn, m) {
  // Simplemente retornamos false para que el bot no procese el botón desde el lib/handler
  // y deje que el nuevo plugin se encargue de todo.
  return false;
}
