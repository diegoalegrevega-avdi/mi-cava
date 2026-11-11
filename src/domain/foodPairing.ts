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
  pairings: FoodPairing[]
}

export const WINE_FOOD_PAIRINGS: Record<WineType, WineTypePairing> = {
  tinto: {
    type: 'tinto',
    label: 'Tinto',
    description: 'Vinos elaborados con uvas negras. Cuerpo medio-alto, taninos presentes. Intensidad variable según crianza.',
    pairings: [
      {
        category: 'carnes',
        dishes: ['chuleton', 'corderoLechal', 'cochinillo', 'solomillo', 'caza'],
        description: 'Taninos y estructura limpian la grasa y realzan el sabor ahumado.'
      },
      {
        category: 'guisos',
        dishes: ['cocido', 'fabada', 'lentejas', 'estofado', 'raboToro', 'chilindron'],
        description: 'Crianza (6-12 meses barrica) equilibra intensidad y notas de madera con la untuosidad del guiso.'
      },
      {
        category: 'embutidos',
        dishes: ['jamonIberico', 'chorizo', 'manchego', 'idiazabal'],
        description: 'La sequedad del vino contrasta con la grasa infiltrada del ibérico y la intensidad de quesos curados.'
      },
      {
        category: 'arroces',
        dishes: ['arrozBogavante', 'arrozSetas', 'alubias'],
        description: 'Vinos con cuerpo (Reserva/Gran Reserva) acompañan la complejidad del arroz caldoso.'
      }
    ],
  },

  blanco: {
    type: 'blanco',
    label: 'Blanco',
    description: 'Elaborados con uvas blancas. Ligeros a medios, acidez refrescante. Versátiles: jóvenes, fermentados en barrica, sobre lías.',
    pairings: [
      {
        category: 'pescados',
        dishes: ['merluza', 'rodaballo', 'vieiras', 'gambas', 'boquerones', 'anchoas', 'ceviche', 'sashimi'],
        description: 'Acidez y frescura limpian el paladar y realzan el sabor yodado sin enmascararlo.'
      },
      {
        category: 'arroces',
        dishes: ['paellaMarisco', 'fideua', 'arrozCaldoso', 'arrozNegro'],
        description: 'Blancos con cuerpo (fermentados en barrica, Godello, Chardonnay) aguantan la intensidad del caldo y el azafrán.'
      },
      {
        category: 'verduras',
        dishes: ['esparragos', 'piquillos', 'ensaladaTomate', 'alcachofas', 'conservas'],
        description: 'Blancos aromáticos (Albariño, Verdejo, Sauvignon Blanc) o suaves (Viura, Albillo) según intensidad del plato.'
      },
      {
        category: 'aperitivos',
        dishes: ['gazpacho', 'ajoBlanco', 'quesoFresco'],
        description: 'Fino/Manzanilla funcionan mejor con jamón, pero blancos secos jóvenes son alternativa versátil.'
      }
    ],
  },

  rosado: {
    type: 'rosado',
    label: 'Rosado',
    description: 'Maceración breve de uva tinta. Frescura de blanco + fruta roja y cuerpo ligero de tinto. El gran comodín gastronómico.',
    pairings: [
      {
        category: 'arroces',
        dishes: ['paellaValenciana', 'paellaMixta', 'paellaVerduras', 'fideua'],
        description: 'Acidez para el marisco, cuerpo para la carne, frescura para el azafrán y el socarrat. Garnacha de Navarra o Pinot Noir rosado.'
      },
      {
        category: 'tapas',
        dishes: ['panTomate', 'patatasBravas', 'padrón', 'pulpo', 'ensaladilla', 'tostaTomate'],
        description: 'Tomate y pimentón piden acidez y fruta roja; el rosado no choca con vinagretas ni especias suaves.'
      },
      {
        category: 'carnesBlancas',
        dishes: ['polloAjillo', 'conejoAjillo', 'lomo', 'tortilla'],
        description: 'Versatilidad: cuerpo para la carne, frescura para la grasa del jamón y el huevo.'
      },
      {
        category: 'asiatica',
        dishes: ['sushi', 'padThai', 'curry', 'gyozas', 'tempura'],
        description: 'Dulzor natural y baja tannicidad equilibran el picante sin avivar el alcohol (como pasaría con un tinto).'
      }
    ],
  },

  espumoso: {
    type: 'espumoso',
    label: 'Espumoso',
    description: 'Segunda fermentación en botella (método tradicional) o tanque (Charmat). Burbuja fina, acidez viva. Brut Nature (0 g/L), Extra Brut, Brut, Extra Seco, Seco, Semiseco, Dulce.',
    pairings: [
      {
        category: 'aperitivos',
        dishes: ['tablaQuesos', 'ostras', 'hummus'],
        description: 'Burbujas y acidez limpian el paladar entre bocado y bocado, estimulan el apetito.'
      },
      {
        category: 'principales',
        dishes: ['cocidoEspumoso', 'corderoAsado', 'cochinilloAsado', 'zarzuela', 'canelones'],
        description: 'Crianza (Reserva 18m, Gran Reserva 30m) aporta cuerpo y notas tostadas para platos contundentes.'
      },
      {
        category: 'postres',
        dishes: ['turronAlmendra', 'turronChocolate', 'panettone', 'roscón', 'tartaManzana'],
        description: 'Dulce con dulce: Semiseco/Dulce para postres azucarados; Brut Rosé para chocolate; Extra Brut para frutos secos.'
      },
      {
        category: 'picante',
        dishes: ['curryThai', 'tacos'],
        description: 'Burbujas y acidez refrescan el paladar frente al picante; azúcar residual (Extra Seco/Semiseco) calma el chile.'
      }
    ],
  },

  dulce: {
    type: 'dulce',
    label: 'Dulce',
    description: 'Azúcar residual >45 g/l (en España 100-200 g/l). Moscatel, Pedro Ximénez, Malvasía, Mistela, Vino de hielo, Vendimia tardía. Untuosos, aromáticos, graduación 15-17%.',
    pairings: [
      {
        category: 'postres',
        dishes: ['chocolate', 'tartaSantiago', 'cremeBrulee', 'tartaTatin', 'heladoVainilla', 'flan', 'tocinoCielo', 'yemas'],
        description: 'El azúcar del vino iguala al del postre; notas de pasas, dátiles, higos y frutos secos complementan.'
      },
      {
        category: 'quesosAzules',
        dishes: ['roquefort', 'cabrales', 'gorgonzola', 'stilton', 'quesoSerena'],
        description: 'Contraste salado-dulce: la sal del queso realza la fruta del vino; untuosidad con untuosidad.'
      },
      {
        category: 'foie',
        dishes: ['foie', 'pate', 'magret'],
        description: 'Untuosidad del foie + dulzor del PX = armonía clásica. El toque dulce realza sin empalagar.'
      },
      {
        category: 'salados',
        dishes: ['pate', 'magret'],
        description: 'Versatilidad inesperada: grasa y acidez balsámica equilibran el dulzor. Evitar platos muy simples (jamón solo).'
      }
    ],
  },

  fortificado: {
    type: 'fortificado',
    label: 'Fortificado',
    description: 'Vinos generosos (Jerez, Montilla-Moriles, Málaga, Condado de Huelva). Encabezados 15-22%. Fino/Manzanilla (biológica), Amontillado/Palo Cortado (mixta), Oloroso (oxidativa), PX/Moscatel (dulces).',
    pairings: [
      {
        category: 'fino',
        dishes: ['mariscoCrudo', 'pescaito', 'sushiSashimi'],
        description: 'Secos, salinos, 15% vol. Frío (6-8°C). La sal del jamón y el marisco armoniza con la sequedad y notas almendradas.'
      },
      {
        category: 'amontillado',
        dishes: ['alcachofasFort', 'esparragosTrigueros', 'setas', 'currySuave', 'ahumados', 'quesoSemicurado'],
        description: 'Crianza mixta (biológica + oxidativa) 16-22% vol. 12-14°C. Cuerpo y complejidad para platos "imposibles" para otros vinos.'
      },
      {
        category: 'oloroso',
        dishes: ['raboToroFort', 'cazaMayor', 'quesoMuyCurado', 'cortezaLavada'],
        description: 'Oxidativa pura 17-22% vol. 14-16°C. Potencia, cuerpo, notas a nuez y especias. Mejores Q/P del mundo en vinos de 12-15 años solera.'
      },
      {
        category: 'px',
        dishes: ['heladoPX', 'frutosSecos'],
        description: 'Dulces naturales 100-200 g/L azúcar. 10-13°C. Untuosidad extrema. Ver ficha "Dulce" para detalle completo.'
      }
    ],
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