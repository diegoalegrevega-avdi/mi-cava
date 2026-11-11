import type { WineType } from '@/db/schema'

/**
 * Food pairing suggestions for each wine type.
 * Based on traditional Spanish gastronomy and sommelier recommendations.
 * Sources: Decanter, Vinetur, Sherry.org, OCU, Scoolinary, El Comidista, Spanish wine academies.
 */

export interface FoodPairing {
  category: string
  dishes: string[]
  description?: string
}

export interface WineTypePairing {
  type: WineType
  label: string
  description: string
  servingTemp: string
  pairings: FoodPairing[]
  avoid?: string[]
  tip?: string
}

export const WINE_FOOD_PAIRINGS: Record<WineType, WineTypePairing> = {
  tinto: {
    type: 'tinto',
    label: 'Tinto',
    description: 'Vinos elaborados con uvas negras. Cuerpo medio-alto, taninos presentes. Intensidad variable según crianza.',
    servingTemp: 'Joven 12-15°C · Crianza 14-16°C · Reserva/Gran Reserva 16-18°C',
    pairings: [
      {
        category: 'Carnes rojas y asados',
        dishes: ['Chuletón a la brasa', 'Cordero lechal asado', 'Cochinillo asado', 'Solomillo de ternera', 'Entrecot', 'Carne de caza (jabalí, ciervo, corzo)'],
        description: 'Taninos y estructura limpian la grasa y realzan el sabor ahumado.'
      },
      {
        category: 'Guisos y platos de cuchara',
        dishes: ['Cocido madrileño', 'Fabada asturiana', 'Lentejas con chorizo', 'Estofado de ternera', 'Rabo de toro', 'Guiso de cordero al chilindrón'],
        description: 'Crianza (6-12 meses barrica) equilibra intensidad y notas de madera con la untuosidad del guiso.'
      },
      {
        category: 'Embutidos y quesos curados',
        dishes: ['Jamón ibérico de bellota', 'Chorizo, salchichón, lomo', 'Queso manchego curado', 'Idiazábal', 'Parmigiano Reggiano'],
        description: 'La sequedad del vino contrasta con la grasa infiltrada del ibérico y la intensidad de quesos curados.'
      },
      {
        category: 'Arroces y legumbres contundentes',
        dishes: ['Arroz con bogavante', 'Arroz meloso de setas', 'Arroz con verduras y carne', 'Alubias con sacramentos'],
        description: 'Vinos con cuerpo (Reserva/Gran Reserva) acompañan la complejidad del arroz caldoso.'
      }
    ],
    avoid: ['Pescados delicados', 'Mariscos crudos', 'Ensaladas con vinagreta fuerte', 'Postres dulces'],
    tip: 'A mayor crianza, mayor temperatura de servicio. Un Gran Reserva a 18°C expresa mejor sus aromas terciarios.'
  },

  blanco: {
    type: 'blanco',
    label: 'Blanco',
    description: 'Elaborados con uvas blancas. Ligeros a medios, acidez refrescante. Versátiles: jóvenes, fermentados en barrica, sobre lías.',
    servingTemp: 'Joven 6-8°C · Fermentado en barrica 8-10°C · Sobre lías 10-12°C',
    pairings: [
      {
        category: 'Pescados y mariscos',
        dishes: ['Merluza a la plancha / en salsa verde', 'Rodaballo al horno', 'Vieiras a la gallega', 'Gambas al ajillo', 'Boquerones fritos', 'Anchoas', 'Ceviche', 'Sashimi'],
        description: 'Acidez y frescura limpian el paladar y realzan el sabor yodado sin enmascararlo.'
      },
      {
        category: 'Arroces marineros y fideuás',
        dishes: ['Paella de marisco', 'Arroz caldoso de bogavante', 'Fideuá de Gandía', 'Arroz a banda', 'Arroz negro'],
        description: 'Blancos con cuerpo (fermentados en barrica, Godello, Chardonnay) aguantan la intensidad del caldo y el azafrán.'
      },
      {
        category: 'Verduras, hortalizas y conservas',
        dishes: ['Espárragos de Navarra', 'Pimientos del piquillo rellenos', 'Ensalada de tomate y ventresca', 'Alcachofas confitadas', 'Conservas de atún/caballa'],
        description: 'Blancos aromáticos (Albariño, Verdejo, Sauvignon Blanc) o suaves (Viura, Albillo) según intensidad del plato.'
      },
      {
        category: 'Aperitivos y cocina fría',
        dishes: ['Gazpacho y salmorejo', 'Ajo blanco', 'Ensaladas con vinagreta suave', 'Quesos frescos (burgos, mozzarella, ricotta)', 'Tabla de ibéricos (jamón, lomo)'],
        description: 'Fino/Manzanilla funcionan mejor con jamón, pero blancos secos jóvenes son alternativa versátil.'
      }
    ],
    avoid: ['Carnes rojas potentes', 'Guisos muy grasos', 'Quesos azules intensos', 'Postres muy dulces'],
    tip: 'Blancos con barrica (Rioja, Rueda, Somontano) ganan cuerpo para arroces y pescados en salsa; jóvenes van mejor con crudos y aperitivos.'
  },

  rosado: {
    type: 'rosado',
    label: 'Rosado',
    description: 'Maceración breve de uva tinta. Frescura de blanco + fruta roja y cuerpo ligero de tinto. El gran comodín gastronómico.',
    servingTemp: 'Seco y ligero 6-8°C · Con cuerpo 8-10°C · Con toque dulzor 8-10°C',
    pairings: [
      {
        category: 'Arroces y paellas (el comodín perfecto)',
        dishes: ['Paella valenciana', 'Paella mixta (pollo + marisco)', 'Paella de verduras', 'Fideuá', 'Arroz con pollo y conejo'],
        description: 'Acidez para el marisco, cuerpo para la carne, frescura para el azafrán y el socarrat. Garnacha de Navarra o Pinot Noir rosado.'
      },
      {
        category: 'Tapas con tomate, vinagre y especias suaves',
        dishes: ['Pan con tomate', 'Patatas bravas', 'Pimientos de Padrón', 'Pulpo a la gallega', 'Ensaladilla rusa', 'Tosta de tomate y anchoa'],
        description: 'Tomate y pimentón piden acidez y fruta roja; el rosado no choca con vinagretas ni especias suaves.'
      },
      {
        category: 'Carnes blancas, embutidos suaves y quesos semicurados',
        dishes: ['Pollo al ajillo', 'Conejo al ajillo', 'Jamón ibérico', 'Lomo embuchado', 'Queso semicurado', 'Tortilla de patatas'],
        description: 'Versatilidad: cuerpo para la carne, frescura para la grasa del jamón y el huevo.'
      },
      {
        category: 'Cocina asiática y picante moderado',
        dishes: ['Sushi y sashimi', 'Pad thai suave', 'Curry verde ligero', 'Gyozas', 'Tempura'],
        description: 'Dulzor natural y baja tannicidad equilibran el picante sin avivar el alcohol (como pasaría con un tinto).'
      }
    ],
    avoid: ['Arroces muy yodados (negro, a banda concentrado)', 'Carnes de caza', 'Quesos azules potentes', 'Postres muy dulces'],
    tip: 'Si no sabes qué paella te espera, lleva un rosado seco de Garnacha o Pinot Noir a 8-10°C: aciertas el 90% de las veces.'
  },

  espumoso: {
    type: 'espumoso',
    label: 'Espumoso',
    description: 'Segunda fermentación en botella (método tradicional) o tanque (Charmat). Burbuja fina, acidez viva. Brut Nature (0 g/L), Extra Brut, Brut, Extra Seco, Seco, Semiseco, Dulce.',
    servingTemp: 'Joven/Brut Nature 6-8°C · Reserva/Gran Reserva 8-10°C · Rosado 6-8°C',
    pairings: [
      {
        category: 'Aperitivo y entrantes fríos (rey del inicio)',
        dishes: ['Jamón ibérico', 'Aceitunas y frutos secos', 'Tabla de quesos variados', 'Ostras y marisco crudo', 'Sushi', 'Ceviche', 'Hummus con crudités'],
        description: 'Burbujas y acidez limpian el paladar entre bocado y bocado, estimulan el apetito.'
      },
      {
        category: 'Platos principales versátiles',
        dishes: ['Cocido madrileño (Brut Nature Reserva)', 'Cordero asado (Gran Reserva)', 'Cochinillo asado (Extra Brut Gran Reserva)', 'Zarzuela de pescado y marisco', 'Canelones / lasaña', 'Arroz caldoso de bogavante'],
        description: 'Crianza (Reserva 18m, Gran Reserva 30m) aporta cuerpo y notas tostadas para platos contundentes.'
      },
      {
        category: 'Postres (según dulzor del espumoso)',
        dishes: ['Turrón de almendra (Extra Brut Gran Reserva)', 'Turrón de chocolate (Rosado)', 'Panettone de chocolate (Semiseco)', 'Roscón de reyes (Brut Reserva)', 'Tarta de manzana / crema de limón (Semiseco)'],
        description: 'Dulce con dulce: Semiseco/Dulce para postres azucarados; Brut Rosé para chocolate; Extra Brut para frutos secos.'
      },
      {
        category: 'Comida picante y exótica',
        dishes: ['Curry tailandés', 'Comida mexicana (tacos, mole suave)', 'Cocina india no extrema', 'Poke bowl'],
        description: 'Burbujas y acidez refrescan el paladar frente al picante; azúcar residual (Extra Seco/Semiseco) calma el chile.'
      }
    ],
    avoid: ['Postres muy dulces con Brut Nature (amargor)', 'Carnes de caza muy potentes con Brut joven', 'Quesos azules con espumosos secos'],
    tip: 'No solo para brindar: un Brut Nature Reserva acompaña todo un menú. Sirve 6-8°C (joven) o 8-10°C (Gran Reserva); nunca helado (pierde aromas).'
  },

  dulce: {
    type: 'dulce',
    label: 'Dulce',
    description: 'Azúcar residual >45 g/l (en España 100-200 g/l). Moscatel, Pedro Ximénez, Malvasía, Mistela, Vino de hielo, Vendimia tardía. Untuosos, aromáticos, graduación 15-17%.',
    servingTemp: 'Moscatel/Malvasía 8-10°C · Pedro Ximénez 10-13°C · Vendimia tardía 8-10°C',
    pairings: [
      {
        category: 'Postres por afinidad (dulce con dulce)',
        dishes: ['Chocolate negro (70%+ cacao)', 'Tarta de Santiago', 'Creme brûlée', 'Tarta Tatin', 'Helado de vainilla con PX', 'Flan de huevo', 'Tocino de cielo', 'Yemas de Santa Teresa'],
        description: 'El azúcar del vino iguala al del postre; notas de pasas, dátiles, higos y frutos secos complementan.'
      },
      {
        category: 'Quesos azules y de pasta blanda fuerte',
        dishes: ['Roquefort', 'Cabrales', 'Gorgonzola', 'Stilton', 'Queso de la Serena', 'Queso azul de Valdeón'],
        description: 'Contraste salado-dulce: la sal del queso realza la fruta del vino; untuosidad con untuosidad.'
      },
      {
        category: 'Foie gras y patés grasos',
        dishes: ['Foie gras de pato (micuit o fresco)', 'Paté de hígado', 'Terrina de foie con Pedro Ximénez'],
        description: 'Untuosidad del foie + dulzor del PX = armonía clásica. El toque dulce realza sin empalagar.'
      },
      {
        category: 'Platos salados con toque agridulce / balsámico',
        dishes: ['Carnes con salsa de Pedro Ximénez', 'Rissotto de setas', 'Soufflé de queso', 'Sopa de cebolla gratinada', 'Magret de pato con reducción de PX'],
        description: 'Versatilidad inesperada: grasa y acidez balsámica equilibran el dulzor. Evitar platos muy simples (jamón solo).'
      }
    ],
    avoid: ['Pescados y mariscos delicados', 'Ensaladas con vinagreta', 'Platos muy picantes', 'Carnes rojas a la brasa sin salsa'],
    tip: 'Copa pequeña (catavinos o blanca estrecha), nunca llena: necesita aire. Frío pero no helado (10-13°C PX). Botella abierta dura semanas.'
  },

  fortificado: {
    type: 'fortificado',
    label: 'Fortificado',
    description: 'Vinos generosos (Jerez, Montilla-Moriles, Málaga, Condado de Huelva). Encabezados 15-22%. Fino/Manzanilla (biológica), Amontillado/Palo Cortado (mixta), Oloroso (oxidativa), PX/Moscatel (dulces).',
    servingTemp: 'Fino/Manzanilla 6-8°C · Amontillado/Palo Cortado 12-14°C · Oloroso 14-16°C · PX 10-13°C',
    pairings: [
      {
        category: 'Fino / Manzanilla — Aperitivo, marisco y jamón',
        dishes: ['Jamón ibérico de bellota (pareja 10)', 'Marisco crudo (ostras, almejas, percebes)', 'Pescaito frito (Manzanilla)', 'Sushi / sashimi', 'Aceitunas, almendras, frutos secos', 'Gazpacho / ajo blanco', 'Ensaladas con vinagreta'],
        description: 'Secos, salinos, 15% vol. Frío (6-8°C). La sal del jamón y el marisco armoniza con la sequedad y notas almendradas.'
      },
      {
        category: 'Amontillado / Palo Cortado — Verduras difíciles, especias, ahumados',
        dishes: ['Alcachofas (incluso a la plancha)', 'Espárragos trigueros', 'Setas y hongos', 'Curry suave / cocina india', 'Ahumados (salmón, bacalao)', 'Quesos semicurados', 'Foie gras'],
        description: 'Crianza mixta (biológica + oxidativa) 16-22% vol. 12-14°C. Cuerpo y complejidad para platos "imposibles" para otros vinos.'
      },
      {
        category: 'Oloroso — Caza, guisos contundentes, quesos muy curados',
        dishes: ['Rabo de toro', 'Caza mayor (jabalí, ciervo)', 'Cordero al chilindrón', 'Quesos muy curados (Idiazábal ahumado, Parmigiano 36m, Gouda extra añejo)', 'Quesos de corteza lavada', 'Jamón ibérico de bellota de larga curación'],
        description: 'Oxidativa pura 17-22% vol. 14-16°C. Potencia, cuerpo, notas a nuez y especias. Mejores Q/P del mundo en vinos de 12-15 años solera.'
      },
      {
        category: 'Pedro Ximénez / Moscatel — Postres, quesos azules, foie',
        dishes: ['Helado de vainilla bañado en PX', 'Chocolate negro', 'Quesos azules (Cabrales, Roquefort, Valdeón)', 'Foie gras', 'Tarta de Santiago', 'Frutos secos y caramelo', 'Creme brûlée'],
        description: 'Dulces naturales 100-200 g/L azúcar. 10-13°C. Untuosidad extrema. Ver ficha "Dulce" para detalle completo.'
      }
    ],
    avoid: [
      'Fino/Manzanilla: carnes rojas, quesos azules, platos muy especiados',
      'Amontillado: postres dulces, mariscos delicados',
      'Oloroso: mariscos crudos, pescados blancos ligeros',
      'PX: pescados, ensaladas, platos picantes'
    ],
    tip: 'Copa catavinos o blanca estrecha. Fino/Manzanilla: beber joven (abierto 1-2 días). Oloroso/PX: aguantan semanas abiertos. Temperatura clave: frío no es lo mismo para todos.'
  }
}

/**
 * Get pairing for a specific wine type
 */
export function getPairingForType(type: WineType): WineTypePairing {
  return WINE_FOOD_PAIRINGS[type]
}

/**
 * Get all pairings as array (for listing)
 */
export function getAllPairings(): WineTypePairing[] {
  return Object.values(WINE_FOOD_PAIRINGS)
}

/**
 * Search pairings by keyword (dish, ingredient, category)
 */
export function searchPairings(query: string): Array<{ type: WineType; category: string; dish: string }> {
  const q = query.toLowerCase()
  const results: Array<{ type: WineType; category: string; dish: string }> = []

  for (const pairing of Object.values(WINE_FOOD_PAIRINGS)) {
    for (const cat of pairing.pairings) {
      for (const dish of cat.dishes) {
        if (dish.toLowerCase().includes(q) || cat.category.toLowerCase().includes(q)) {
          results.push({ type: pairing.type, category: cat.category, dish })
        }
      }
    }
  }
  return results
}