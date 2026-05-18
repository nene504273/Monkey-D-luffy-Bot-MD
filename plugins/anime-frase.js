let handler = async (m, { conn }) => {
    let frases = [
        {
            personaje: '🦅 【 𝗝𝗜𝗚𝗢𝗥𝗢 𝗞𝗨𝗪𝗔𝗝𝗜𝗠𝗔 】 🦅',
            frase: 'Puedes llorar, eso está bien. ¡Solo no te des por vencido! cree en ti mismo.. seras recompensado sin dudar'
        },
        {
            personaje: '🌸【 𝐍𝐄𝐙𝐔𝐊𝐎 𝐊𝐀𝐌𝐀𝐃𝐎 】🌸',
            frase: 'No cargues con ese peso sin razón, hay cosas que están fuera de nuestro control. La felicidad solo depende de uno mismo. Lo único importante, es el presente.'
        },
        {
            personaje: '🔥【 𝐊𝐘𝐎𝐉𝐔𝐑𝐎 𝐑𝐄𝐍𝐆𝐎𝐊𝐔 】🔥',
            frase: '¡Vivan con el orgullo y la frente en alto! y No permitas que tus miedos y debilidades, te alejen de tus objetivos... Manten tu corazón ardiendo, no importa lo que pase Sigue avanzando y no te rindas, apesar de haberte caído. Recuerda que el tiempo no espera a nadie, no te hara compañía ni compartira tus penas.'
        },
        {
            personaje: '👑【 𝐋𝐄𝐋𝐎𝐔𝐂𝐇 𝐋𝐀𝐌𝐏𝐄𝐑𝐎𝐔𝐆𝐄 】👑',
            frase: 'Cuando hay maldad en este mundo que la justicia no puede vencer, ¿te mancharías las manos con el mal para vencerlo? ¿O te mantendrías firme y justo incluso si eso significa rendirte ante el mal?.'
        },
        {
            personaje: '⭐【 𝐍𝐀𝐑𝐔𝐓𝐎 𝐔𝐙𝐔𝐌𝐀𝐊𝐈 】⭐',
            frase: '¡Yo jamás me rindo, y jamás retrocederé a mi palabra, ese es mi Camino Ninja!'
        },
        {
            personaje: '👁️‍🗨️【 𝐈𝐓𝐀𝐂𝐇𝐈 𝐔𝐂𝐇𝐈𝐇𝐀 】👁️‍🗨️',
            frase: 'Las personas viven sus vidas siguiendo lo que ellos aceptan como correcto y cierto. Así es como las personas definen la “realidad”. Pero, ¿qué significa ser “correcto” o “cierto”? Son meramente conceptos vagos. Su “realidad” puede ser todo un espejismo. ¿Podemos considerar que ellos viven en su propio mundo, formado por sus creencias?'
        },
        {
            personaje: '⚡【 𝐊𝐈𝐋𝐋𝐔𝐀 𝐙𝐎𝐋𝐃𝐘𝐂𝐊 】⚡',
            frase: 'si ignoro a un amigo al que tengo capacidad de ayudar, ¿no lo estaría traicionando?.'
        },
        {
            personaje: '💔【 𝐌𝐀𝐊𝐈𝐌𝐀 】💔',
            frase: 'Los actos lujuriosos son mas placenteros cuanto mejor conoces a la otra persona.'
        },
        {
            personaje: '🍜【 𝐒𝐀𝐈𝐓𝐀𝐌𝐀 】🍜',
            frase: 'Si realmente quieres ser fuerte, deja de preocuparte por lo que otros piensen de ti. Vivir tu vida no tiene nada que ver con lo que otros piensan'
        },
        {
            personaje: '🌱【 𝐌𝐈𝐆𝐇𝐓 𝐆𝐔𝐘 】🌱',
            frase: 'Todo el esfuerzo es inúti, si no crees en ti mismo.'
        },
        {
            personaje: '♦️【 𝐓𝐀𝐍𝐉𝐈𝐑𝐎 𝐊𝐀𝐌𝐀𝐃𝐎 】♦️',
            frase: 'la vida sigue, debes continúar aunque hayas perdido a alguien, no importa que tan fuerte sea el golpe.'
        },
        {
            personaje: '👱🏻【 𝐌𝐄𝐋𝐈𝐎𝐃𝐀𝐒 】🗡',
            frase: 'puedes mentir lo que quieras pero jamas puedes engañar a tu corazón.'
        },
        {
            personaje: '🥷【 𝐊𝐀𝐊𝐀𝐒𝐇𝐈 𝐇𝐀𝐓𝐀𝐊𝐄 】❟❛❟',
            frase: 'En el mundo ninja, aquellos que rompen las reglas son escoria, es cierto, pero.. aquellos que abandonan a un amigo.. son peor que escoria.'
        },
        {
            personaje: '🐉【 𝐒𝐎𝐍 𝐆𝐎𝐊𝐔 】🉐',
            frase: 'si un perdedor hace muchos esfuerzos quizás pueda sobrepasar los poderes de un guerrero distinguido.'
        },
        {
            personaje: '🏴‍☠️【 𝐌𝐨𝐧𝐤𝐞𝐲 𝐃. 𝐋𝐮𝐟𝐟𝐲 】👒',
            frase: 'si no arriesgas tu vida, no puedes crear un futuro.'
        },
        {
            personaje: '🐼【 𝐆𝐞𝐧𝐦𝐚 𝐒𝐚𝐨𝐭𝐨𝐦 】🌹',
            frase: 'Es muy fácil herir a los demás sin darse cuenta, sobre todo cuando eres joven. Lo importante no es lo que los demás piensen de ti, sino cómo actúas frente a ello. Hay gente en este mundo que prefiere la soledad, pero no hay nadie que la soporte.'
        },
        {
            personaje: '🉐【 𝐒𝐨𝐧 𝐆𝐨𝐤𝐮 】悟',
            frase: 'Eres un ser increíble, diste lo mejor de ti y por eso te admiro. Pasaste por varias transformaciones, fuiste tan poderoso que todos nosotros te odiamos. Espero que renazcas como un buen tipo, te estaré esperando para pelear. Yo también entrenaré, entrenaré mucho para volverme más fuerte.'
        },
        {
            personaje: '(｡Ó﹏Ò｡)【 𝐈𝐙𝐔𝐊𝐔 𝐌𝐈𝐃𝐎𝐑𝐈𝐘𝐀 】🥦',
            frase: 'No todo es blanco y negro, la mayoría del mundo es gris, y esta lleno de ira y preocupación, por eso hay que tender la mano en esa dirección.'
        },
        {
            personaje: '🎸【 𝐇𝐢𝐭𝐨𝐫𝐢 𝐆𝐨𝐭𝐨 】🌸',
            frase: 'Los introvertidos siempre molestamos a los demás, hagamos lo que hagamos, si esperamos en un rincón, nos critican por no colaborar.'
        },
        {
            personaje: '👊【 𝐑𝐨𝐜𝐤 𝐋𝐞𝐞 】🥋',
            frase: 'el poder de creer en ti mismo puede ser el poder para cambiar el destino.'
        },
        {
            personaje: '🏺【 𝐆𝐚𝐚𝐫𝐚 】🧑‍🦰',
            frase: 'Solo porque alguien es importante para ti, no significa necesariamente que esa persona sea buena.'
        },
        {
            personaje: 'ཐི❤︎ཋྀ【 𝐏𝐀-𝐬𝐚𝐧 】🦇༉‧₊˚.',
            frase: 'Toca tu música para divertirte, si tocas solo por fama acabaras sufriendo.'
        },
        {
            personaje: '🧊【 𝐑𝐲𝐨 𝐘𝐚𝐦𝐚𝐝𝐚 】🩵ིྀ',
            frase: 'Perder tu personalidad es como morir en vida.'
        },
        {
            personaje: '🧊【 𝐑𝐲𝐨 𝐘𝐚𝐦𝐚𝐝𝐚 】🩵ིྀ',
            frase: 'La unión de distintas personalidades es lo que crea la música.'
        },
        {
            personaje: '🎭【 𝐋 】🎭',
            frase: 'No es que sea antisocial, ni solitario; es que conozco la estupidez humana y no me quiero contagiar.'
        }
    ];

    const elegido = frases[Math.floor(Math.random() * frases.length)];
    let str = ` *${elegido.personaje}* dice:\n\n_"${elegido.frase}"_`;

    m.react('🌟');
    conn.sendMessage(m.chat, { text: str }, { quoted: m });
}

handler.help = ['fraseanime'];
handler.tags = ['anime'];
handler.command = ['fraseanime', 'phraseanime'];

export default handler;