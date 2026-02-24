let cooldowns = {}

let handler = async (m, { conn, isPrems }) => {
    let user = global.db.data.users[m.sender]
    let emoji = '🛠️'
    let emoji3 = '⏳'
    let moneda = 'Coins'
    
    let tiempo = 5 * 60 // 5 minutos de espera

    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempo * 1000) {
        const tiempoRestante = Math.ceil((cooldowns[m.sender] + tiempo * 1000 - Date.now()) / 1000)
        const tiempoFormateado = segundosAHMS(tiempoRestante)
        return conn.reply(m.chat, `${emoji3} Debes esperar *${tiempoFormateado}* para usar *#w* de nuevo.`, m)
    }

    // --- NUEVA ECONOMÍA AUMENTADA ---
    // Ganancia aleatoria entre 2,000 y 15,000
    let rsl = Math.floor(Math.random() * (15000 - 2000 + 1)) + 2000 
    
    cooldowns[m.sender] = Date.now()
    
    // El mensaje ahora usa la lista larga de trabajos
    let mensaje = `${emoji} ${pickRandom(trabajo)} *${toNum(rsl)}* ( *${rsl}* ) ${moneda} 💸.`
    await conn.reply(m.chat, mensaje, m)
    
    user.coin = (user.coin || 0) + rsl
}

handler.help = ['trabajar']
handler.tags = ['economy']
handler.command = ['w','work', 'trabajar']
handler.group = true
handler.register = true

export default handler

function toNum(number) {
    let abs = Math.abs(number)
    if (abs >= 1000000) return (number / 1000000).toFixed(1) + 'M'
    if (abs >= 1000) return (number / 1000).toFixed(1) + 'k'
    return number.toString()
}

function segundosAHMS(segundos) {
    let minutos = Math.floor(segundos / 60)
    let segs = segundos % 60
    return `${minutos} minutos y ${segs} segundos`
}

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}

// Lista completa original + extras de alta paga
const trabajo = [
   "Trabajas como cortador de galletas de élite y ganas",
   "Trabaja para una empresa militar privada, ganando",
   "Organiza un evento de cata de vinos VIP y obtienes",
   "Limpias la chimenea de un palacio y encuentras",
   "Desarrollas juegos triple A para ganarte la vida y ganas",
   "Trabajaste en la oficina horas extras de alto nivel por",
   "Trabajas como secuestrador de novias profesional y ganas",
   "Alguien vino y representó una obra de teatro épica. Por mirar te dieron",
   "Compraste y vendiste artículos de lujo y ganaste",
   "Trabajas en el restaurante de la abuela como chef ejecutiva y ganas",
   "Trabajas 10 minutos en un Pizza Hut local con propinas gigantes. Ganaste",
   "Trabajas como escritor(a) de galletas de la fortuna místicas y ganas",
   "Revisas tu bolso y decides vender algunos artículos legendarios. Valían",
   "Trabajas todo el día en la corporación por",
   "Diseñaste un logo para una marca mundial por",
   "¡Trabajó lo mejor que pudo en una imprenta real y ganó su merecido!",
   "Trabajas como podador de arbustos artísticos y ganas",
   "Trabajas como actor de voz estrella para Bob Esponja y ganas",
   "Estabas cultivando plantas exóticas y Ganaste",
   "Trabajas como constructor de castillos de arena profesionales y ganas",
   "Trabajas como artista callejera famosa y ganas",
   "¡Hiciste trabajo social y recibiste una donación de!",
   "Reparaste un tanque T-60 averiado. La tripulación agradecida te pagó",
   "Trabajas como ecologista de anguilas raras y ganas",
   "Trabajas en Disneyland como un panda de edición limitada y ganas",
   "Reparas las máquinas recreativas antiguas y recibes",
   "Hiciste algunos trabajos importantes en la ciudad y ganaste",
   "Limpias moho tóxico espacial de la ventilación y ganas",
   "Resolviste el misterio del brote de cólera y el gobierno te recompensó con",
   "Trabajas como zoólogo de criaturas míticas y ganas",
   "Vendiste sándwiches de pescado gourmet y obtuviste",
   "Hackeaste un sistema de seguridad para una prueba y recibiste"
]