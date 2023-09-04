const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
  },
});
const fs = require('fs');

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Conexión exitosa nenes');
});

// Función para eliminar tildes de las palabras
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Palabras clave con respuestas aleatorias y secuencias de mensajes
const keywordResponses = [
  {
    keywords: ["hola", "hl", "noches", "buenas", "saludos", "dias", "tarde", "mañana", "hla", "ola"],
    responses: ['Hola amor', 'Hola papi', 'Hola como ests','Hola','Hola Rey','Como estás mi vida'],
  },
  {
    keywords: ["como estas", "esta", "tal"],
    responses: ['Estoy, bien gracias', 'Bastante bien.', 'Muy bien Gracias', 'Bien, gracias.', 'Estoy de maravilla, Amor❤️.'],
  },

  {
    keywords: ["soltera", "comprometida", "casada", "hijos","marido", "novio", "esposo", "pareja"],
    responses: ['Estoy soltera y no tengo hijos vivo con mi mamá amor.'],
  },
  {
    keywords: ["reina", "atractiva", "guapa", "belleza", "amor", "bb", "hermosa", "preciosa", "te amo", "amo", "adoro", "te quiero", "belleza", "bellezima", "belleza","encantadora", "fascinante", "atractiva", "hermosa", "maravillosa", "carismática", "espléndida", "elegante", "agradable", "deslumbrante", "deslumbradora", "encantadoramente", "atractivamente", "fascinantemente", "guapa", "encanto", "adorable", "adoracion", "cariñosa", "amorosa"],
    responses: ['Gracias amor', 'Enserio', 'Eso siii todo natural amor', 'De verdad q eres super lindo',  'Tu eres tan lindo de verdad', 'tu me gustas mucho', 'Gracias amor 💞', 'Gracias mí corazón', 'Y eso q no me conoces','Es usted muy amable.', 'Gracias rey', 'Gracias por ser tan bello', 'Gracias mí amor', 'Gracias bb', 'Usted también es hermoso mi amor', 'Ya bello 🤩', 'Gracias 🥴', 'Bello mi amor', 'Hay BB eres la mejor persona 💗', 'Tú eres perfecto', 'Todo hermoso mi BB ❣️', 'Bello 🤩 meeeee encantaaaaaas', '❤️ tan bello', 'Gracias rey', 'Gracias cielo ❤️', 'Hay amor que lindo 😻', 'Gracias mi vida', 'Tan lindo me agradas mucho', 'Hay cielo que lindo', 'Besos mi amor', 'Hay amor tan lindo 😍', 'Te mando un beso y un abrazo fuerte', 'Tan bello mi amor', 'Gracias me encabtas amor', 'Es usted un amor', 'Te amo más mi bb', 'Yo a usted lo quiero mucho mucho', 'Siii Loo seee mi rey', 'Bueno mi vida pueden existir muchas más hermosas', 'Y gracias mi  amor 😍😍❤️💘', 'Y gracias', 'Te amooooo como loca', 'Aww te amo 😍😍', 'Te amo', 'Si de algo puedes estar seguro es q yo te amo más', 'Tii amo💘', '❤️💘 yo lo amo más', 'Yo también te quiero 😘', 'Te quiero 💖'],
  },
  {
    keywords: ["edad", "años"],
    responses: ['Tengo 32 años'],
  },
    {
      keywords: ["mamar", "cuca", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito", "meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito","meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas ", "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito", "meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja","cenos"],
      responses: ['Así me encanta el huevo rico 🤤 Ami me gusta mucho', 'Cree q con esas labias de q me va hacer feliz', 'Q Rico Eso Me Encanta', 'Ay No Se Que Decir🤭', 'Super rico❤️❤️', 'divino papasito', 'Uf, qué rico. Me encantaría. 😋😋😋😋', 'Ayyy Q RiKo sii', 'Qué delicia 😘😘❤😍😍😍', 'Dime que me harías', 'Q rico seriaa amor 😍😍❤️🤤😈', 'Huuuuy q ricoo Mii bb', 'mee encantaa q ricooo mi amor', '😋😋😋q riicooo me encantaaaaaa', 'yaaa quiroo sentirlooo', 'Aaaaahh uufhssss q ricoooo', 'Riiicooo 😋😋👅', 'Ricooo riicoo ricoooo', 'Uufhsss dioossssss q ricoooooo 😍😍😍😍😍😈😈😈', 'q me deje las piernas temblando sexo rudo contigo amor seria perfectoo', 'Huy q riiicooo uffhsss', 'Quierooo esooo paraaa mi, sentirloo dentro de miii😍😍😍😍', 'Q ricooo sería super😈😋😋😋', 'Mee encantaria sentirlo dentro d mii 😈😋😋', '😋😋😋 seriaaaa ricooo', 'yoo quierooo 😈😈', 'sii Bebé y me mandas videos yoo quiero ver 😋😋😋😈😍😍', 'Waooo q ricoooo bb', 'Q ricooo bb meee encantaaas', 'huy q ricoo bb', 'Uf q ricooooooo mee encantaria tu penee😋😋😋😋', '😋😋😋 ufsss ricoooo', 'Pero no me mandas', '😮😮😋😋😋😈q riiicoooo mee encantaaa'],
    },

    {
  keywords: ['rico', 'rica','muestrame','llamando','contesta','llama', 'provocativa', 'ricota', 'lechita', 'haces', 'aces','desnuda', 'trabajas','trabajando','dedicas', 'que haces', 'deliciosa'],
  sequences: [
    [
      ['Enviame a mi nequi 3164909368 50mil', 6000],
      ['y nos vido llamamos todo el mes y nos conosemos mejor', 6000],
      ['no te pedire mas es que los nesecitaba amor', 6000],
      ['Te envire fotos y vídeos amor', 6000],
      ['ahi se ve el interes amor', 6000],
    ],
    [
      ['Enviame a mi nequi 3164909368 50mil Pesos, te enviare fotos y videos, podras verme por video llamada Amor❤️🔥.', 6000],
      ['Amor yo espero pasar mucho tiempo a su lado', 6000],
      ['tengo muchos gastos me colaboras Amor🔥.', 6000],
      ['Dígame si me ayudara yo confío en usted', 6000],

    ],
  ],
},
{
  keywords: ['dinero', 'mañana', 'despues', 'nequi', 'plata', 'pagen', 'pago', 'bloquada', 'funciona', 'abrir'],
  sequences: [
    [
      ['Ajá y entonces por qué no me hazmandado a mi nequi 3164909368', 6000],
      ['Ahi se ve el interes', 6000],
      ['Nada te cuesta', 6000],
      ['me darías algo de plata después te enviare lo que quieras y contestare tus llamadas amor', 6000],
      ['ni que yo te fuera a estafar oh alejarme', 6000],
    ],
    [
      ['Me estás es vacilando usted no va a mandar nada a mi nequi 3164909368', 6000],
      ['Pero tienes mucho rodeo', 6000],
      ['De verdad que yo necesito', 6000],
      ['Pero usted no me apoya ni me ayuda', 6000],
      ['Aún que sea 50$', 6000],
      ['De verdad', 6000],
      ['Te lo suplico', 6000],
      ['Los necesito', 6000],
    ],
  ],
},
// Agregar más palabras clave y sus respuestas/secuencias asociadas aquí
{
  keywords: ['foto', 'video', 'videos', 'mandame', 'enviame', 'hago', 'llamada', 'audio'],
  sequences: [
    [
      ['Sii Amor', 6000],
      ['Enviame a mi nequi 3164909368 50mil', 6000],
      ['Y yo cumplo con videos y muchas fotos', 6000],
      ['Puedes verme en Cámara las veces que quieras amor', 6000],
      ['Todo el mes Amor❤️.', 6000],
      ['Para pagar unas cosas que nesecito', 6000],
    ],
    [
      ['Bien Amor🔥.', 6000],
      ['Amor necesito 50 mil pesos, si me los envías a mi nequi nos podemos vídeo llamar todo el el mes y no te pediré mas dinero amor❤️🔥.', 6000],
      ['Te envió lindas fotos y vídeos muy bellos de mi amor😉.  ', 6000],
      ['Cuando me puedes enviar el dinero', 6000],
    ],
  ],
},
{
  keywords: ["donde estas", "parte", "vives", "ciudad", "lugar", "pais", "dnde", "dónde", "país", "sitio"],
  sequences: [
    [
      ['Soy Venezolana y estoy aquí en Medellín en la calle 34B # 65D a una cuadra del centro comercial Unicentro, frente al salon de belleza San Ángel VIP🥹.', 6000],
      ['enviar imagen calle1.jpg', 6000],
      ['enviar imagen calle2.jpg', 6000],
      ['enviar imagen calle3.jpg', 6000],
    ],
    [
      ['Vengo de Venezuela recien llegada y estoy en Medellín, en la Calle 34B #65D, a una cuadra del centro comercial Unicentro. Frente al salón de belleza San Ángel VIP 🥹', 6000],
      ['enviar imagen calle2.jpg', 6000],
      ['enviar imagen calle1.jpg', 6000],
      ['enviar imagen calle3.jpg', 6000],
    ],
  ],
},
];

// Diccionario de secuencias y sus imágenes asociadas
const sequences = {
// Agregar más secuencias aquí si es necesario
// secuencia3: [ ... ]
};

// Respuestas aleatorias para mensajes desconocidos
const randomResponses = [
  'Bueno pero tiene q enviarme algo de dinero',
  'Sii mándame dinero',
  'Si es que no tienes oh no puedes',
  'Te e pedido dinero y nada',
  'Pero dame algo de dinero💔💔♥💔💔💔',
  'Shiiii 🥰❤️',
  'Ok amor',
  '❤️super rico 🤤',
  'Hay dios 😁',
  'Que bueno saber eso 😊',
  'Vale está bien',
  'Woow',
  'Vale',
  'Que finooo',
  'Ahhh yaa que chevere',
  'Sip',
  'Si claro',
  '❤️super rico 🤤',
  'Ya entiendo',
  'Ok me parece bien',
  'Unnm eso es bueno',
  'Muy bien',
  'Si Rey',
  'Está muy bien',
  'Eso es bueno',
  'Si ya',
  'Bueno Amor❤️',
  'Lindo',
  'Eres mío Amor',
  'Un ya',
  'Me alegro',
  'Ajá y entonces',
  'Un ya cielo',
  'Vale cielo está bien',
  'Vale mí amor ❤️😍',
  'Por q no me ayudas ni que yo te fuera a estafar oh alejarme',
  'Vale amor está Bien que haces horita',
  'Tu sabrás de verdad eso no cuesta nada mandar 50$',
  'Hay se ve el interés de una persona',
  'Que bueno mi amor',
  'Mándame dinero y te envío unos vídeos súper ricos',
  'mi amorsito rico',
  'Q te implica en enviarme el dinero a mi nequi 3164909368 amor',
  'Trasferirls. Y listo',
  'Y no veo tu interés',
  'Me ayudarás',
  'Para mí sería un gusto y un placer trasar metas y triunfar a tu lado',
  'Disculpa q te pida tanto solo q cumplo el 29 y quiero hacer algo bonito',
  ];

// Función para obtener una respuesta aleatoria de una lista
function getRandomResponse(responsesList) {
  const randomIndex = Math.floor(Math.random() * responsesList.length);
  return responsesList[randomIndex];
}

// Función para verificar si el mensaje incluye alguna de las palabras clave asociadas con una secuencia
function findSequence(message) {
  const lowercaseMessage = removeAccents(message.toLowerCase()); // Eliminamos los acentos del mensaje
  for (const response of keywordResponses) {
    const keywords = response.keywords;
    const found = keywords.some(keyword => {
      const lowercaseKeyword = removeAccents(keyword.toLowerCase()); // Eliminamos los acentos de la palabra clave
      return lowercaseMessage.includes(lowercaseKeyword);
    });
    if (found) {
      return response;
    }
  }
  return null;
}

// Función para enviar mensajes con intervalos de tiempo y seleccionar una secuencia aleatoria
async function sendSequenceMessages(chatId, sequences) {
  const randomSequenceIndex = Math.floor(Math.random() * sequences.length);
  const randomSequence = sequences[randomSequenceIndex];

  for (const [message, interval] of randomSequence) {
    if (message.startsWith('enviar imagen')) {
      // Es una solicitud para enviar una imagen o video
      const imagePath = message.substring(14).trim();
      if (fs.existsSync(imagePath)) {
        const media = MessageMedia.fromFilePath(imagePath);
        await client.sendMessage(chatId, media);
      } else {
        await client.sendMessage(chatId, 'No se encontró la imagen.');
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, interval));
      await client.sendMessage(chatId, message);
    }
  }
}

async function handleIncomingMessage(message) {
  console.log(message.body);
  const matchedResponse = findSequence(message.body);
  if (matchedResponse) {
    if (matchedResponse.responses) {
      const randomResponse = getRandomResponse(matchedResponse.responses);
      await sendDelayedMessage(message.from, randomResponse);
    } else if (matchedResponse.sequences) {
      const sequences = matchedResponse.sequences;
      await sendSequenceMessages(message.from, sequences);
    }
  } else {
    const randomResponse = getRandomResponse(randomResponses);
    await sendDelayedMessage(message.from, randomResponse);
  }
}

// Función para enviar un mensaje con una demora aleatoria antes de enviarlo
async function sendDelayedMessage(chatId, message) {
  const delay = Math.floor(Math.random() * 8000) + 4000; // Delay entre 1 y 5 segundos
  await new Promise(resolve => setTimeout(resolve, delay));
  await client.sendMessage(chatId, message);
}



// Manejar eventos de mensajes
client.on('message', handleIncomingMessage);

// Función para inicializar el cliente y navegar a WhatsApp Web con opciones de espera
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    client.initialize(browser);
})();
