export type Locale = 'es' | 'en' | 'fr'

export type Dictionary = {
  // Navigation
  nav: { cava: string; add: string; historial: string; ajustes: string }
  // Titles
  titles: { cava: string; add: string; historial: string; ajustes: string; cava3d: string }
  // Cellar
  cellar: {
    search: string
    empty: { title: string; description: string; action: string }
    full: string
    button3d: string
    loading: string
    noResults: { title: string; description: string; action: string }
    addWine: string
  }
  // Wine row / detail
  wine: {
    stock: string
    add: string
    consume: string
    undo: string
    openDetail: string
    vintage: (v: number | null) => string
    noVintage: string
    semaphore: { ready: string; keep: string; past: string; unknown: string }
    detail: {
      title: string
      notes: string
      location: string
      window: string
      from: string
      to: string
      movements: string
      adjustStock: string
      bottles: string
      adjust: string
      addNote: string
      purchased: string
      close: string
      windowHint: string
      noWinery: string
      noRegion: string
      locationPh: string
      lastUncork: string
      noUncorks: string
      events: { add: string; consume: string; import: string; undo: string }
    }
    toast: { added: string; consumed: string; undo: string; back: string; noStock: string; notesSaved: string }
  }
  // Add form
  add: {
    title: string
    essentials: string
    tasting: string
    name: string
    winery: string
    vintage: string
    nv: string
    type: string
    varietals: string
    region: string
    country: string
    purchaseDate: string
    price: string
    location: string
    window: string
    from: string
    to: string
    notes: string
    bottles: string
    submit: string
    duplicate: { title: string; message: string; force: string }
    validation: { nameRequired: string; vintageRange: string; priceInvalid: string }
    scanner: {
      title: string
      drop: string
      loading: string
      noKey: string
      manual: string
      retry: string
      error: string
      failed: string
      fillEmpty: string
      viewText: string
    }
    barcode: { label: string; invalid: string; searching: string; search: string; camera: string; noBarcode: string; readError: string; use: string }
    windowHint: string
    countryPh: string
    varietalsPh: string
  }
  // History
  history: {
    title: string
    empty: string
    emptyDesc: string
    outOfCellar: string
    back: string
    backToast: string
    addError: string
    monthFormat: (m: number, y: number) => string
  }
  // Settings
  settings: {
    stats: {
      title: string
      bottles: string
      references: string
      value: string
      lastExport: string
      never: string
      byType: string
      apogeo: string
      apogeoCards: { ready: string; keep: string; past: string; unknown: string }
      evolution: string
    }
    appearance: { title: string; theme: string; light: string; dark: string; toggle: (t: string) => string }
    scanner: {
      title: string
      info: string
      keyLabel: string
      keyHint: string
      save: string
      delete: string
      saved: string
      deleted: string
    }
    data: {
      title: string
      exportJson: string
      exportCsv: string
      import: string
      empty: { title: string; confirm: string; action: string; toast: string }
    }
    about: {
      title: string
      version: string
      github: string
      offLink: string
    }
    cave3d: {
      title: string
      depth: string
      width: string
      shelves: string
      fill: string
      fillWine: string
      fillType: string
      capacity: string
      overCapacity: string
      depthHint: string
      widthHint: string
      shelvesHint: string
      fillWineHint: string
      fillTypeHint: string
    }
  }
  // Cave3D
  cave3d: {
    depthLabel: (n: number) => string
    shelfLabel: (n: number) => string
    overflow: string
    legend: {
      depth: string
      width: string
      shelves: string
      capacity: string
    }
  }
  // Stats
  stats: {
    distributionTitle: string
    apogeoTitle: string
    evolutionTitle: string
  }
  types: Record<
    'tinto' | 'blanco' | 'rosado' | 'espumoso' | 'dulce' | 'fortificado' | 'sinTipo',
    string
  >
  drink: Record<'ready' | 'keep' | 'past' | 'unknown', string>
  // Monthly chart
  monthly: {
    months: string[]
    ariaLabel: (year: number) => string
    total: (count: number, year: number) => string
  }
  // Food pairing
  foodPairing: {
    title: string
    description: string
    servingTemp: string
    pairWith: string
    avoid: string
    tip: string
    searchPlaceholder: string
    noResults: string
    categories: {
      tinto: {
        carnes: string
        guisos: string
        embutidos: string
        arroces: string
      }
      blanco: {
        pescados: string
        arroces: string
        verduras: string
        aperitivos: string
      }
      rosado: {
        arroces: string
        tapas: string
        carnesBlancas: string
        asiatica: string
      }
      espumoso: {
        aperitivos: string
        principales: string
        postres: string
        picante: string
      }
      dulce: {
        postres: string
        quesosAzules: string
        foie: string
        salados: string
      }
      fortificado: {
        fino: string
        amontillado: string
        oloroso: string
        px: string
      }
    }
    dishes: {
      // Tinto
      chuleton: string
      corderoLechal: string
      cochinillo: string
      solomillo: string
      caza: string
      cocido: string
      fabada: string
      lentejas: string
      estofado: string
      raboToro: string
      chilindron: string
      jamonIberico: string
      chorizo: string
      manchego: string
      idiazabal: string
      arrozBogavante: string
      arrozSetas: string
      alubias: string
      // Blanco
      merluza: string
      rodaballo: string
      vieiras: string
      gambas: string
      boquerones: string
      anchoas: string
      ceviche: string
      sashimi: string
      paellaMarisco: string
      fideua: string
      arrozCaldoso: string
      arrozNegro: string
      esparragos: string
      piquillos: string
      ensaladaTomate: string
      alcachofas: string
      conservas: string
      gazpacho: string
      ajoBlanco: string
      quesoFresco: string
      // Rosado
      paellaValenciana: string
      paellaMixta: string
      paellaVerduras: string
      panTomate: string
      patatasBravas: string
      padrón: string
      pulpo: string
      ensaladilla: string
      tostaTomate: string
      polloAjillo: string
      conejoAjillo: string
      lomo: string
      tortilla: string
      sushi: string
      padThai: string
      curry: string
      gyozas: string
      tempura: string
      // Espumoso
      tablaQuesos: string
      ostras: string
      hummus: string
      cocidoEspumoso: string
      corderoAsado: string
      cochinilloAsado: string
      zarzuela: string
      canelones: string
      turronAlmendra: string
      turronChocolate: string
      panettone: string
      roscón: string
      tartaManzana: string
      curryThai: string
      tacos: string
      // Dulce
      chocolate: string
      tartaSantiago: string
      cremeBrulee: string
      tartaTatin: string
      heladoVainilla: string
      flan: string
      tocinoCielo: string
      yemas: string
      roquefort: string
      cabrales: string
      gorgonzola: string
      stilton: string
      quesoSerena: string
      foie: string
      pate: string
      magret: string
      // Fortificado
      mariscoCrudo: string
      pescaito: string
      sushiSashimi: string
      alcachofasFort: string
      esparragosTrigueros: string
      setas: string
      currySuave: string
      ahumados: string
      quesoSemicurado: string
      raboToroFort: string
      cazaMayor: string
      quesoMuyCurado: string
      cortezaLavada: string
      heladoPX: string
      frutosSecos: string
    }
  }
  // Cave config
  caveConfig: {
    title: string
    depth: string
    width: string
    shelves: string
    fill: string
    fillWine: string
    fillType: string
    fillWineHint: string
    fillTypeHint: string
    depthHint: string
    widthHint: string
    shelvesHint: string
    capacity: string
    overCapacity: string
    autoSave: string
  }
  // Cellar screen
  cellarScreen: {
    full: string
    loading: string
    noResults: { title: string; description: string; action: string }
    empty: { title: string; description: string; action: string }
  }
  // Cave3D screen
  cave3dScreen: {
    title: string
    back: string
  }
  // Settings screen
  settingsScreen: {
    title: string
    stats: string
    appearance: string
    scanner: string
    scannerInfo: string
    data: string
    about: string
    cave3d: string
  }
  // Import/Export
  importer: {
    title: string
    step1: string
    step2: string
    step3: string
    mapping: { header: string; sample: string; ignore: string; dateFormat: string; ddmmyy: string; mmddyy: string }
    plan: {
      creates: string
      merges: string
      duplicates: string
      errors: string
      apply: string
      disabled: string
    }
    result: { restored: string; imported: string }
    errors: { noName: string; noVintage: string; invalidStock: string; notFound: string; notWine: string }
    restore: string
    restoring: string
    empty: string
    lineError: string
  }
  // Generic
  common: {
    save: string
    cancel: string
    delete: string
    confirm: string
    close: string
    loading: string
    error: string
    yes: string
    no: string
  }
  // Support prompt
  support: {
    title: string
    body: string
    coffee: string
    later: string
  }
  // PWA update
  pwa: { update: string; reload: string }
}

export const DICTIONARIES: Record<Locale, Dictionary> = {
  es: {
    nav: { cava: 'Mi cava', add: 'Añadir', historial: 'Historial', ajustes: 'Ajustes' },
    titles: { cava: 'Mi cava', add: 'Añadir vino', historial: 'Historial', ajustes: 'Ajustes y datos', cava3d: 'Cava 3D' },
    cellar: {
      search: 'Buscar por nombre, bodega, región…',
      empty: { title: 'Tu cava está vacía', description: 'Añade tu primera botella y empieza a llevar la cuenta.', action: 'Añadir vino' },
      full: 'Cava llena · {count} botellas',
      button3d: 'Ver cava 3D',
      loading: 'Cargando…',
      noResults: { title: 'Nada coincide', description: 'Prueba con otro nombre, bodega o región.', action: 'Borrar búsqueda' },
      addWine: 'Añadir vino',
    },
    wine: {
      stock: 'Botellas',
      add: 'Añadir botella de {name}',
      consume: 'Descorchar {name}',
      undo: 'Deshacer',
      openDetail: 'Ver ficha de {name}',
      vintage: (v) => v ? String(v) : 'S.A.',
      noVintage: 'S.A.',
      semaphore: { ready: 'Listo', keep: 'Guardar', past: 'Pronto', unknown: 'Sin datos' },
      detail: {
        title: 'Ficha del vino',
        notes: 'Notas de cata y maridaje',
        location: 'Ubicación',
        window: 'Ventana de consumo',
        from: 'Desde',
        to: 'Hasta',
        movements: 'Movimientos',
        adjustStock: 'Ajustar stock',
        bottles: 'Botellas reales',
        adjust: 'Ajustar',
        addNote: 'Añadir nota al último descorche',
        purchased: 'Comprado el',
        close: 'Cerrar',
        windowHint: 'Años desde y hasta',
        noWinery: 'Sin bodega',
        noRegion: 'Sin región',
        locationPh: 'Estante, balda…',
        lastUncork: 'Último descorche',
        noUncorks: 'Aún sin descorches',
        events: { add: 'Botella añadida', consume: 'Descorchada', import: 'Ajuste de stock', undo: 'Deshecho' },
      },
      toast: { added: 'Botella añadida a {name}', consumed: 'Descorchada', undo: 'Deshacer', back: 'De vuelta en la cava', noStock: 'Sin stock', notesSaved: 'Notas guardadas' },
    },
    add: {
      title: 'Añadir vino',
      essentials: 'Lo esencial',
      tasting: 'Cata y ubicación',
      name: 'Nombre',
      winery: 'Bodega',
      vintage: 'Añada',
      nv: 'Sin añada (NV)',
      type: 'Tipo',
      varietals: 'Varietales (separados por coma)',
      region: 'Región',
      country: 'País',
      purchaseDate: 'Fecha de compra',
      price: 'Precio (€, opcional)',
      location: 'Ubicación',
      window: 'Ventana de consumo',
      from: 'Desde',
      to: 'Hasta',
      notes: 'Notas de cata y maridaje',
      bottles: 'Botellas',
      submit: 'Añadir a la cava',
      duplicate: { title: 'Posible duplicado', message: 'Ya tienes un vino con ese nombre y añada en otra bodega.', force: 'Guardar de todas formas' },
      validation: { nameRequired: 'El nombre es obligatorio', vintageRange: 'Añada entre 1900 y {max}, o marca NV', priceInvalid: 'Precio no válido' },
      barcode: { label: 'Código de barras', invalid: 'Código de barras no válido.', searching: 'Buscando…', search: 'Buscar', camera: 'Leer código de barras con la cámara', noBarcode: 'No he encontrado un código de barras en la foto.', readError: 'No se pudo leer el código.', use: 'Usar' },
      windowHint: 'Años desde y hasta',
      countryPh: 'España',
      varietalsPh: 'Fruta roja, roble…',
      scanner: {
        title: 'Escanear etiqueta',
        drop: 'o arrastra una foto aquí',
        loading: 'Leyendo etiqueta…',
        noKey: 'Añade una clave de Gemini en Ajustes para escanear etiquetas',
        manual: 'Mientras tanto, puedes escribir los datos a mano.',
        retry: 'Probar con Gemini',
        error: 'Error',
        failed: 'Gemini no reconoció la etiqueta.',
        fillEmpty: 'Solo se rellenan los campos vacíos.',
        viewText: 'Ver texto leído',
      },
    },
    history: {
      title: 'Historial',
      empty: 'Todavía no hay descorches',
      emptyDesc: 'Cuando descorches una botella aparecerá aquí, agrupada por mes.',
      outOfCellar: 'Fuera de la cava',
      back: 'Volver a la cava',
      backToast: 'De vuelta en la cava',
      addError: 'No se pudo añadir',
      monthFormat: (m, y) => new Date(y, m, 1).toLocaleDateString('es', { month: 'long', year: 'numeric' }).toUpperCase(),
    },
    settings: {
      stats: {
        title: 'Estadísticas',
        bottles: 'Botellas',
        references: 'Referencias',
        value: 'Valor estimado',
        lastExport: 'Última exportación',
        never: 'Nunca',
        byType: 'Por tipo',
        apogeo: 'Apogeo',
        apogeoCards: { ready: 'Listos', keep: 'Para guardar', past: 'Pasados', unknown: 'Sin datos' },
        evolution: 'Evolución mensual de descorches',
      },
      appearance: { title: 'Apariencia', theme: 'Tema', light: 'claro', dark: 'oscuro', toggle: (t) => `Cambiar a ${t}` },
      scanner: {
        title: 'Escáner de etiquetas',
        info: 'La lectura se hace en el propio dispositivo con Tesseract. La primera vez descarga los modelos (≈9 MB) y los guarda en el navegador; después funciona sin red. La foto no se guarda en ningún sitio.',
        keyLabel: 'Clave de Google Gemini',
        keyHint: 'Opcional. Se guarda solo en este navegador y se envía únicamente a Google para reintentar lecturas que el motor local no ha podido completar.',
        save: 'Guardar clave',
        delete: 'Borrar clave',
        saved: 'Clave guardada',
        deleted: 'Clave borrada',
      },
      data: {
        title: 'Tus datos',
        exportJson: 'Exportar JSON',
        exportCsv: 'Exportar CSV',
        import: 'Importar archivo',
        empty: { title: 'Vaciar cava', confirm: 'Escribe BORRAR para confirmar', action: 'Vaciar', toast: 'Cava vaciada · copia descargada' },
      },
      about: { title: 'Acerca de', version: 'Mi Cava {version} · software libre bajo licencia MIT.', github: 'Código en GitHub', offLink: 'Datos de Open Food Facts (ODbL)' },
      cave3d: {
        title: 'Cava 3D',
        depth: 'Profundidad (botellas)',
        width: 'Ancho (botellas)',
        shelves: 'Pisos',
        fill: 'Modo de relleno',
        fillWine: 'Por vino (agrupa cada vino junto)',
        fillType: 'Por tipo (agrupa por color)',
        capacity: 'Capacidad total: {count} botellas',
        overCapacity: '⚠ Supera 320 (se recortará visualmente)',
        depthHint: 'Filas de fondo (1-20)',
        widthHint: 'Botellas por fila (1-4)',
        shelvesHint: 'Altura en pisos (1-8)',
        fillWineHint: 'Agrupa botellas del mismo vino en celdas contiguas',
        fillTypeHint: 'Agrupa por tipo: tinto, blanco, rosado...',
      },
    },
    cave3d: {
      depthLabel: (n) => `F${n}`,
      shelfLabel: (n) => `Piso ${n}`,
      overflow: 'Sobrantes',
      legend: {
        depth: 'Profundidad',
        width: 'Ancho',
        shelves: 'Pisos',
        capacity: 'Capacidad',
      },
    },
    stats: {
      distributionTitle: 'Distribución por tipo',
      apogeoTitle: 'Apogeo',
      evolutionTitle: 'Evolución mensual de descorches',
    },
    types: {
      tinto: 'Tinto',
      blanco: 'Blanco',
      rosado: 'Rosado',
      espumoso: 'Espumoso',
      dulce: 'Dulce',
      fortificado: 'Fortificado',
      sinTipo: 'Sin tipo',
    },
    drink: { ready: 'Listo', keep: 'Guardar', past: 'Pronto', unknown: 'Sin datos' },
    monthly: {
      months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      ariaLabel: (year) => `Evolución mensual de descorches ${year}`,
      total: (count, year) => `${count} descorches en ${year}`,
    },
    caveConfig: {
      title: 'Cava 3D',
      depth: 'Profundidad (botellas)',
      width: 'Ancho (botellas)',
      shelves: 'Pisos',
      fill: 'Modo de relleno',
      fillWine: 'Por vino (agrupa cada vino junto)',
      fillType: 'Por tipo (agrupa por color)',
      fillWineHint: 'Agrupa botellas del mismo vino en celdas contiguas',
      fillTypeHint: 'Agrupa por tipo: tinto, blanco, rosado...',
      depthHint: 'Filas de fondo (1-20)',
      widthHint: 'Botellas por fila (1-4)',
      shelvesHint: 'Altura en pisos (1-8)',
      capacity: 'Capacidad total: {count} botellas',
      overCapacity: '⚠ Supera 320 (se recortará visualmente)',
      autoSave: 'Los cambios se guardan automáticamente. La vista 3D se actualiza al instante.',
    },
    cellarScreen: {
      full: 'Cava llena · {count} botellas',
      loading: 'Cargando…',
      noResults: { title: 'Nada coincide', description: 'Prueba con otro nombre, bodega o región.', action: 'Borrar búsqueda' },
      empty: { title: 'Tu cava está vacía', description: 'Añade tu primera botella y empieza a llevar la cuenta.', action: 'Añadir vino' },
    },
    cave3dScreen: {
      title: 'Cava 3D',
      back: 'Volver a la lista',
    },
    settingsScreen: {
      title: 'Ajustes',
      stats: 'Estadísticas',
      appearance: 'Apariencia',
      scanner: 'Escáner de etiquetas',
      scannerInfo: 'La lectura se hace en el propio dispositivo con Tesseract. La primera vez descarga los modelos (≈9 MB) y los guarda en el navegador; después funciona sin red. La foto no se guarda en ningún sitio.',
      data: 'Tus datos',
      about: 'Acerca de',
      cave3d: 'Cava 3D',
    },
    importer: {
      title: 'Importar',
      step1: 'Paso 1: Mapeo de columnas',
      step2: 'Paso 2: Resumen',
      step3: 'Paso 3: Resultado',
      mapping: { header: 'Columna', sample: 'Muestra', ignore: 'Ignorar', dateFormat: 'Formato de fecha', ddmmyy: 'dd/mm/aaaa', mmddyy: 'mm/dd/aaaa' },
      plan: { creates: 'Vinos nuevos', merges: 'Se suman a existentes', duplicates: 'Posibles duplicados', errors: 'Errores', apply: 'Aplicar', disabled: 'Nada que aplicar' },
      result: { restored: 'Restaurado: {new} vinos nuevos, {updated} actualizados', imported: 'Importado: {creates} nuevos, {merges} actualizados' },
      errors: { noName: 'falta el nombre', noVintage: 'añada no válida', invalidStock: 'stock no válido', notFound: 'Ese código no está en Open Food Facts', notWine: 'Ese código no es un vino en Open Food Facts' },
      restore: 'Restaurar',
      restoring: 'Restaurando…',
      empty: 'El CSV está vacío.',
      lineError: 'Línea {n}: {msg}',
    },
    common: { save: 'Guardar', cancel: 'Cancelar', delete: 'Borrar', confirm: 'Confirmar', close: 'Cerrar', loading: 'Cargando…', error: 'Error', yes: 'Sí', no: 'No' },
    pwa: { update: 'Nueva versión disponible', reload: 'Recargar' },
    support: {
      title: '¿Te resulta útil Mi Cava?',
      body: 'Es gratis y sin anuncios. Si te ahorra tiempo, invítame a un café y ayudo a mantenerla viva.',
      coffee: 'Invítame a un café',
      later: 'Ahora no',
    },
    foodPairing: {
      title: 'Maridaje recomendado',
      description: 'Sugerencias basadas en la gastronomía española tradicional y recomendaciones de sumilleres.',
      servingTemp: 'Temperatura de servicio',
      pairWith: 'Marida con',
      avoid: 'Evitar',
      tip: 'Consejo',
      searchPlaceholder: 'Buscar plato o ingrediente…',
      noResults: 'No se encontraron maridajes para esa búsqueda',
      categories: {
        tinto: {
          carnes: 'Carnes rojas y asados',
          guisos: 'Guisos y platos de cuchara',
          embutidos: 'Embutidos y quesos curados',
          arroces: 'Arroces y legumbres contundentes'
        },
        blanco: {
          pescados: 'Pescados y mariscos',
          arroces: 'Arroces marineros y fideuás',
          verduras: 'Verduras, hortalizas y conservas',
          aperitivos: 'Aperitivos y cocina fría'
        },
        rosado: {
          arroces: 'Arroces y paellas (el comodín perfecto)',
          tapas: 'Tapas con tomate, vinagre y especias',
          carnesBlancas: 'Carnes blancas, embutidos suaves y quesos',
          asiatica: 'Cocina asiática y picante moderado'
        },
        espumoso: {
          aperitivos: 'Aperitivo y entrantes fríos (rey del inicio)',
          principales: 'Platos principales versátiles',
          postres: 'Postres (según dulzor)',
          picante: 'Comida picante y exótica'
        },
        dulce: {
          postres: 'Postres por afinidad (dulce con dulce)',
          quesosAzules: 'Quesos azules y de pasta blanda fuerte',
          foie: 'Foie gras y patés grasos',
          salados: 'Platos salados con toque agridulce'
        },
        fortificado: {
          fino: 'Fino / Manzanilla — Aperitivo, marisco y jamón',
          amontillado: 'Amontillado / Palo Cortado — Verduras difíciles, especias',
          oloroso: 'Oloroso — Caza, guisos contundentes, quesos muy curados',
          px: 'Pedro Ximénez / Moscatel — Postres, quesos azules, foie'
        }
      },
      dishes: {
        chuleton: 'Chuletón a la brasa',
        corderoLechal: 'Cordero lechal asado',
        cochinillo: 'Cochinillo asado',
        solomillo: 'Solomillo de ternera',
        caza: 'Carne de caza (jabalí, ciervo, corzo)',
        cocido: 'Cocido madrileño',
        fabada: 'Fabada asturiana',
        lentejas: 'Lentejas con chorizo',
        estofado: 'Estofado de ternera',
        raboToro: 'Rabo de toro',
        chilindron: 'Guiso de cordero al chilindrón',
        jamonIberico: 'Jamón ibérico de bellota',
        chorizo: 'Chorizo, salchichón, lomo',
        manchego: 'Queso manchego curado',
        idiazabal: 'Idiazábal',
        arrozBogavante: 'Arroz con bogavante',
        arrozSetas: 'Arroz meloso de setas',
        alubias: 'Alubias con sacramentos',
        merluza: 'Merluza a la plancha / en salsa verde',
        rodaballo: 'Rodaballo al horno',
        vieiras: 'Vieiras a la gallega',
        gambas: 'Gambas al ajillo',
        boquerones: 'Boquerones fritos',
        anchoas: 'Anchoas',
        ceviche: 'Ceviche',
        sashimi: 'Sashimi',
        paellaMarisco: 'Paella de marisco',
        fideua: 'Fideuá de Gandía',
        arrozCaldoso: 'Arroz caldoso de bogavante',
        arrozNegro: 'Arroz negro',
        esparragos: 'Espárragos de Navarra',
        piquillos: 'Pimientos del piquillo rellenos',
        ensaladaTomate: 'Ensalada de tomate y ventresca',
        alcachofas: 'Alcachofas confitadas',
        conservas: 'Conservas de atún / caballa',
        gazpacho: 'Gazpacho y salmorejo',
        ajoBlanco: 'Ajo blanco',
        quesoFresco: 'Quesos frescos (burgos, mozzarella)',
        paellaValenciana: 'Paella valenciana',
        paellaMixta: 'Paella mixta (pollo + marisco)',
        paellaVerduras: 'Paella de verduras',
        panTomate: 'Pan con tomate',
        patatasBravas: 'Patatas bravas',
        padrón: 'Pimientos de Padrón',
        pulpo: 'Pulpo a la gallega',
        ensaladilla: 'Ensaladilla rusa',
        tostaTomate: 'Tosta de tomate y anchoa',
        polloAjillo: 'Pollo al ajillo',
        conejoAjillo: 'Conejo al ajillo',
        lomo: 'Lomo embuchado',
        tortilla: 'Tortilla de patatas',
        sushi: 'Sushi y sashimi',
        padThai: 'Pad thai suave',
        curry: 'Curry verde ligero',
        gyozas: 'Gyozas',
        tempura: 'Tempura',
        tablaQuesos: 'Tabla de quesos variados',
        ostras: 'Ostras y marisco crudo',
        hummus: 'Hummus con crudités',
        cocidoEspumoso: 'Cocido madrileño (Brut Nature Reserva)',
        corderoAsado: 'Cordero asado (Gran Reserva)',
        cochinilloAsado: 'Cochinillo asado (Extra Brut Gran Reserva)',
        zarzuela: 'Zarzuela de pescado y marisco',
        canelones: 'Canelones / lasaña',
        turronAlmendra: 'Turrón de almendra (Extra Brut Gran Reserva)',
        turronChocolate: 'Turrón de chocolate (Rosado)',
        panettone: 'Panettone de chocolate (Semiseco)',
        roscón: 'Roscón de reyes (Brut Reserva)',
        tartaManzana: 'Tarta de manzana / crema de limón (Semiseco)',
        curryThai: 'Curry tailandés',
        tacos: 'Comida mexicana (tacos, mole suave)',
        chocolate: 'Chocolate negro (70%+ cacao)',
        tartaSantiago: 'Tarta de Santiago',
        cremeBrulee: 'Creme brûlée',
        tartaTatin: 'Tarta Tatin',
        heladoVainilla: 'Helado de vainilla con PX',
        flan: 'Flan de huevo',
        tocinoCielo: 'Tocino de cielo',
        yemas: 'Yemas de Santa Teresa',
        roquefort: 'Roquefort',
        cabrales: 'Cabrales',
        gorgonzola: 'Gorgonzola',
        stilton: 'Stilton',
        quesoSerena: 'Queso de la Serena',
        foie: 'Foie gras de pato',
        pate: 'Paté de hígado',
        magret: 'Magret de pato con reducción de PX',
        mariscoCrudo: 'Marisco crudo (ostras, almejas, percebes)',
        pescaito: 'Pescaito frito (Manzanilla)',
        sushiSashimi: 'Sushi / sashimi',
        alcachofasFort: 'Alcachofas (incluso a la plancha)',
        esparragosTrigueros: 'Espárragos trigueros',
        setas: 'Setas y hongos',
        currySuave: 'Curry suave / cocina india',
        ahumados: 'Ahumados (salmón, bacalao)',
        quesoSemicurado: 'Quesos semicurados',
        raboToroFort: 'Rabo de toro',
        cazaMayor: 'Caza mayor (jabalí, ciervo)',
        quesoMuyCurado: 'Quesos muy curados (Idiazábal ahumado, Parmigiano 36m)',
        cortezaLavada: 'Quesos de corteza lavada',
        heladoPX: 'Helado de vainilla bañado en PX',
        frutosSecos: 'Frutos secos y caramelo'
      }
    }
  },
  en: {
    nav: { cava: 'My Cellar', add: 'Add', historial: 'History', ajustes: 'Settings' },
    titles: { cava: 'My Cellar', add: 'Add Wine', historial: 'History', ajustes: 'Settings', cava3d: '3D Cellar' },
    cellar: {
      search: 'Search by name, winery, region…',
      empty: { title: 'Your cellar is empty', description: 'Add your first bottle and start tracking.', action: 'Add wine' },
      full: 'Cellar full · {count} bottles',
      button3d: 'View 3D cellar',
      loading: 'Loading…',
      noResults: { title: 'No matches', description: 'Try another name, winery, or region.', action: 'Clear search' },
      addWine: 'Add wine',
    },
    wine: {
      stock: 'Bottles',
      add: 'Add bottle of {name}',
      consume: 'Uncork {name}',
      undo: 'Undo',
      openDetail: 'View details for {name}',
      vintage: (v) => v ? String(v) : 'NV',
      noVintage: 'NV',
      semaphore: { ready: 'Ready', keep: 'Keep', past: 'Past', unknown: 'No data' },
      detail: {
        title: 'Wine Details',
        notes: 'Tasting notes & pairing',
        location: 'Location',
        window: 'Drinking window',
        from: 'From',
        to: 'To',
        movements: 'Movements',
        adjustStock: 'Adjust stock',
        bottles: 'Real bottles',
        adjust: 'Adjust',
        addNote: 'Add note to last uncork',
        purchased: 'Purchased on',
        close: 'Close',
        windowHint: 'From and to (year)',
        noWinery: 'No winery',
        noRegion: 'No region',
        locationPh: 'Shelf, rack…',
        lastUncork: 'Last uncork',
        noUncorks: 'No uncorkings yet',
        events: { add: 'Bottle added', consume: 'Uncorked', import: 'Stock adjustment', undo: 'Undone' },
      },
      toast: { added: 'Bottle added to {name}', consumed: 'Uncorked', undo: 'Undo', back: 'Back in cellar', noStock: 'No stock', notesSaved: 'Notes saved' },
    },
    add: {
      title: 'Add Wine',
      essentials: 'Essentials',
      tasting: 'Tasting & Location',
      name: 'Name',
      winery: 'Winery',
      vintage: 'Vintage',
      nv: 'No vintage (NV)',
      type: 'Type',
      varietals: 'Varietals (comma separated)',
      region: 'Region',
      country: 'Country',
      purchaseDate: 'Purchase date',
      price: 'Price (€, optional)',
      location: 'Location',
      window: 'Drinking window',
      from: 'From',
      to: 'To',
      notes: 'Tasting notes & pairing',
      bottles: 'Bottles',
      submit: 'Add to cellar',
      duplicate: { title: 'Possible duplicate', message: 'You already have a wine with that name and vintage from another winery.', force: 'Save anyway' },
      validation: { nameRequired: 'Name is required', vintageRange: 'Vintage between 1900 and {max}, or mark NV', priceInvalid: 'Invalid price' },
      barcode: { label: 'Barcode', invalid: 'Invalid barcode.', searching: 'Searching…', search: 'Search', camera: 'Read barcode with the camera', noBarcode: 'I could not find a barcode in the photo.', readError: 'Could not read the barcode.', use: 'Use' },
      windowHint: 'From and to (year)',
      countryPh: 'Spain',
      varietalsPh: 'Red fruit, oak…',
      scanner: {
        title: 'Scan label',
        drop: 'or drop a photo here',
        loading: 'Reading label…',
        noKey: 'Add a Gemini key in Settings to scan labels',
        manual: 'Meanwhile, you can enter data manually.',
        retry: 'Try with Gemini',
        error: 'Error',
        failed: 'Gemini did not recognize the label.',
        fillEmpty: 'Only empty fields are filled in.',
        viewText: 'View read text',
      },
    },
    history: {
      title: 'History',
      empty: 'No uncorkings yet',
      emptyDesc: 'When you uncork a bottle it will appear here, grouped by month.',
      outOfCellar: 'Out of cellar',
      back: 'Back to cellar',
      backToast: 'Back in cellar',
      addError: 'Could not add',
      monthFormat: (m, y) => new Date(y, m, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' }).toUpperCase(),
    },
    settings: {
      stats: {
        title: 'Statistics',
        bottles: 'Bottles',
        references: 'References',
        value: 'Estimated value',
        lastExport: 'Last export',
        never: 'Never',
        byType: 'By type',
        apogeo: 'Peak',
        apogeoCards: { ready: 'Ready', keep: 'Keep', past: 'Past', unknown: 'No data' },
        evolution: 'Monthly uncorking evolution',
      },
      appearance: { title: 'Appearance', theme: 'Theme', light: 'light', dark: 'dark', toggle: (t) => `Switch to ${t}` },
      scanner: {
        title: 'Label scanner',
        info: 'Scanning runs on-device with Tesseract. First time downloads models (≈9 MB) and caches them; then works offline. The photo is never stored.',
        keyLabel: 'Google Gemini API key',
        keyHint: 'Optional. Stored only in this browser and sent only to Google to retry scans the local engine could not complete.',
        save: 'Save key',
        delete: 'Delete key',
        saved: 'Key saved',
        deleted: 'Key deleted',
      },
      data: {
        title: 'Your data',
        exportJson: 'Export JSON',
        exportCsv: 'Export CSV',
        import: 'Import file',
        empty: { title: 'Empty cellar', confirm: 'Type DELETE to confirm', action: 'Empty', toast: 'Cellar emptied · copy downloaded' },
      },
      about: { title: 'About', version: 'Mi Cava {version} · open source MIT.', github: 'Code on GitHub', offLink: 'Open Food Facts data (ODbL)' },
      cave3d: {
        title: '3D Cellar',
        depth: 'Depth (bottles)',
        width: 'Width (bottles)',
        shelves: 'Shelves',
        fill: 'Fill mode',
        fillWine: 'By wine (group each wine together)',
        fillType: 'By type (group by color)',
        capacity: 'Total capacity: {count} bottles',
        overCapacity: '⚠ Exceeds 320 (will be clipped)',
        depthHint: 'Depth rows (1-20)',
        widthHint: 'Bottles per row (1-4)',
        shelvesHint: 'Height in shelves (1-8)',
        fillWineHint: 'Groups bottles of the same wine in contiguous cells',
        fillTypeHint: 'Groups by type: red, white, rosé…',
      },
    },
    importer: {
      title: 'Import',
      step1: 'Step 1: Column mapping',
      step2: 'Step 2: Summary',
      step3: 'Step 3: Result',
      mapping: { header: 'Column', sample: 'Sample', ignore: 'Ignore', dateFormat: 'Date format', ddmmyy: 'dd/mm/yyyy', mmddyy: 'mm/dd/yyyy' },
      plan: { creates: 'New wines', merges: 'Merge into existing', duplicates: 'Possible duplicates', errors: 'Errors', apply: 'Apply', disabled: 'Nothing to apply' },
      result: { restored: 'Restored: {new} new, {updated} updated', imported: 'Imported: {creates} new, {merges} merged' },
      errors: { noName: 'missing name', noVintage: 'invalid vintage', invalidStock: 'invalid stock', notFound: 'That code is not in Open Food Facts', notWine: 'That code is not a wine in Open Food Facts' },
      restore: 'Restore',
      restoring: 'Restoring…',
      empty: 'The CSV is empty.',
      lineError: 'Line {n}: {msg}',
    },
    common: { save: 'Save', cancel: 'Cancel', delete: 'Delete', confirm: 'Confirm', close: 'Close', loading: 'Loading…', error: 'Error', yes: 'Yes', no: 'No' },
    pwa: { update: 'New version available', reload: 'Reload' },
    support: {
      title: 'Finding Mi Cava useful?',
      body: 'It is free and ad-free. If it saves you time, buy me a coffee and help keep it running.',
      coffee: 'Buy me a coffee',
      later: 'Not now',
    },
    cave3d: {
      depthLabel: (n) => `F${n}`,
      shelfLabel: (n) => `Shelf ${n}`,
      overflow: 'Overflow',
      legend: {
        depth: 'Depth',
        width: 'Width',
        shelves: 'Shelves',
        capacity: 'Capacity',
      },
    },
    stats: {
      distributionTitle: 'Distribution by type',
      apogeoTitle: 'Peak',
      evolutionTitle: 'Monthly uncorking evolution',
    },
    types: {
      tinto: 'Red',
      blanco: 'White',
      rosado: 'Rosé',
      espumoso: 'Sparkling',
      dulce: 'Sweet',
      fortificado: 'Fortified',
      sinTipo: 'No type',
    },
    drink: { ready: 'Ready', keep: 'Keep', past: 'Past', unknown: 'No data' },
    monthly: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ariaLabel: (year) => `Monthly uncorking evolution ${year}`,
      total: (count, year) => `${count} uncorkings in ${year}`,
    },
    caveConfig: {
      title: '3D Cellar',
      depth: 'Depth (bottles)',
      width: 'Width (bottles)',
      shelves: 'Shelves',
      fill: 'Fill mode',
      fillWine: 'By wine (group each wine together)',
      fillType: 'By type (group by color)',
      fillWineHint: 'Groups bottles of the same wine in contiguous cells',
      fillTypeHint: 'Groups by type: red, white, rosé…',
      depthHint: 'Depth rows (1-20)',
      widthHint: 'Bottles per row (1-4)',
      shelvesHint: 'Height in shelves (1-8)',
      capacity: 'Total capacity: {count} bottles',
      overCapacity: '⚠ Exceeds 320 (will be clipped)',
      autoSave: 'Changes are saved automatically. The 3D view updates instantly.',
    },
    cellarScreen: {
      full: 'Cellar full · {count} bottles',
      loading: 'Loading…',
      noResults: { title: 'No matches', description: 'Try another name, winery, or region.', action: 'Clear search' },
      empty: { title: 'Your cellar is empty', description: 'Add your first bottle and start tracking.', action: 'Add wine' },
    },
    cave3dScreen: {
      title: '3D Cellar',
      back: 'Back to list',
    },
    settingsScreen: {
      title: 'Settings',
      stats: 'Statistics',
      appearance: 'Appearance',
      scanner: 'Label scanner',
      scannerInfo: 'Scanning runs on-device with Tesseract. First time downloads models (≈9 MB) and caches them; then works offline. The photo is never stored.',
      data: 'Your data',
      about: 'About',
      cave3d: '3D Cellar',
    },
    foodPairing: {
      title: 'Recommended Pairings',
      description: 'Suggestions based on traditional Spanish gastronomy and sommelier recommendations.',
      servingTemp: 'Serving Temperature',
      pairWith: 'Pairs with',
      avoid: 'Avoid',
      tip: 'Tip',
      searchPlaceholder: 'Search dish or ingredient…',
      noResults: 'No pairings found for that search',
      categories: {
        tinto: {
          carnes: 'Red meats and roasts',
          guisos: 'Stews and spoon dishes',
          embutidos: 'Cured meats and aged cheeses',
          arroces: 'Hearty rice dishes and legumes'
        },
        blanco: {
          pescados: 'Fish and seafood',
          arroces: 'Seafood rice dishes and fideuà',
          verduras: 'Vegetables, greens and preserves',
          aperitivos: 'Appetizers and cold dishes'
        },
        rosado: {
          arroces: 'Rice dishes and paellas (the perfect wildcard)',
          tapas: 'Tapas with tomato, vinegar and mild spices',
          carnesBlancas: 'White meats, mild cured meats and cheeses',
          asiatica: 'Asian cuisine and moderate spice'
        },
        espumoso: {
          aperitivos: 'Aperitifs and cold starters (king of the start)',
          principales: 'Versatile main dishes',
          postres: 'Desserts (depending on sweetness)',
          picante: 'Spicy and exotic food'
        },
        dulce: {
          postres: 'Desserts by affinity (sweet with sweet)',
          quesosAzules: 'Blue cheeses and strong soft cheeses',
          foie: 'Foie gras and rich pâtés',
          salados: 'Savory dishes with sweet-sour touch'
        },
        fortificado: {
          fino: 'Fino / Manzanilla — Aperitif, seafood and ham',
          amontillado: 'Amontillado / Palo Cortado — Tricky vegetables, spices',
          oloroso: 'Oloroso — Game, hearty stews, very aged cheeses',
          px: 'Pedro Ximénez / Moscatel — Desserts, blue cheeses, foie'
        }
      },
      dishes: {
        chuleton: 'Grilled ribeye',
        corderoLechal: 'Roast suckling lamb',
        cochinillo: 'Roast suckling pig',
        solomillo: 'Beef tenderloin',
        caza: 'Game meat (wild boar, venison, roe deer)',
        cocido: 'Madrid-style stew',
        fabada: 'Asturian bean stew',
        lentejas: 'Lentils with chorizo',
        estofado: 'Beef stew',
        raboToro: 'Oxtail stew',
        chilindron: 'Lamb chilindrón stew',
        jamonIberico: 'Iberian acorn-fed ham',
        chorizo: 'Chorizo, salchichón, lomo',
        manchego: 'Aged Manchego cheese',
        idiazabal: 'Idiazábal',
        arrozBogavante: 'Lobster rice',
        arrozSetas: 'Mushroom rice',
        alubias: 'Beans with pork',
        merluza: 'Hake (grilled / in green sauce)',
        rodaballo: 'Roast turbot',
        vieiras: 'Galician-style scallops',
        gambas: 'Garlic shrimp',
        boquerones: 'Fried anchovies',
        anchoas: 'Anchovies',
        ceviche: 'Ceviche',
        sashimi: 'Sashimi',
        paellaMarisco: 'Seafood paella',
        fideua: 'Gandía-style fideuà',
        arrozCaldoso: 'Lobster broth rice',
        arrozNegro: 'Black rice',
        esparragos: 'Navarre asparagus',
        piquillos: 'Stuffed piquillo peppers',
        ensaladaTomate: 'Tomato and ventresca salad',
        alcachofas: 'Confit artichokes',
        conservas: 'Tuna / mackerel preserves',
        gazpacho: 'Gazpacho and salmorejo',
        ajoBlanco: 'White garlic soup',
        quesoFresco: 'Fresh cheeses (burgos, mozzarella)',
        paellaValenciana: 'Valencian paella',
        paellaMixta: 'Mixed paella (chicken + seafood)',
        paellaVerduras: 'Vegetable paella',
        panTomate: 'Bread with tomato',
        patatasBravas: 'Patatas bravas',
        padrón: 'Padrón peppers',
        pulpo: 'Galician-style octopus',
        ensaladilla: 'Russian salad',
        tostaTomate: 'Tomato and anchovy toast',
        polloAjillo: 'Garlic chicken',
        conejoAjillo: 'Garlic rabbit',
        lomo: 'Cured pork loin',
        tortilla: 'Spanish omelette',
        sushi: 'Sushi and sashimi',
        padThai: 'Mild pad thai',
        curry: 'Mild green curry',
        gyozas: 'Gyozas',
        tempura: 'Tempura',
        tablaQuesos: 'Assorted cheese board',
        ostras: 'Oysters and raw seafood',
        hummus: 'Hummus with crudités',
        cocidoEspumoso: 'Madrid stew (Brut Nature Reserva)',
        corderoAsado: 'Roast lamb (Gran Reserva)',
        cochinilloAsado: 'Roast suckling pig (Extra Brut Gran Reserva)',
        zarzuela: 'Seafood and fish zarzuela',
        canelones: 'Cannelloni / lasagna',
        turronAlmendra: 'Almond nougat (Extra Brut Gran Reserva)',
        turronChocolate: 'Chocolate nougat (Rosé)',
        panettone: 'Chocolate panettone (Semi-dry)',
        roscón: 'King cake (Brut Reserva)',
        tartaManzana: 'Apple tart / lemon cream (Semi-dry)',
        curryThai: 'Thai curry',
        tacos: 'Mexican food (tacos, mild mole)',
        chocolate: 'Dark chocolate (70%+ cacao)',
        tartaSantiago: 'Santiago almond cake',
        cremeBrulee: 'Crème brûlée',
        tartaTatin: 'Tarte Tatin',
        heladoVainilla: 'Vanilla ice cream with PX',
        flan: 'Caramel flan',
        tocinoCielo: 'Tocino de cielo',
        yemas: 'Saint Teresa yolks',
        roquefort: 'Roquefort',
        cabrales: 'Cabrales',
        gorgonzola: 'Gorgonzola',
        stilton: 'Stilton',
        quesoSerena: 'La Serena cheese',
        foie: 'Duck foie gras',
        pate: 'Liver pâté',
        magret: 'Duck breast with PX reduction',
        mariscoCrudo: 'Raw seafood (oysters, clams, percebes)',
        pescaito: 'Fried fish (Manzanilla)',
        sushiSashimi: 'Sushi / sashimi',
        alcachofasFort: 'Artichokes (even grilled)',
        esparragosTrigueros: 'Wild asparagus',
        setas: 'Mushrooms',
        currySuave: 'Mild curry / Indian cuisine',
        ahumados: 'Smoked (salmon, cod)',
        quesoSemicurado: 'Semi-aged cheeses',
        raboToroFort: 'Oxtail stew',
        cazaMayor: 'Big game (wild boar, venison)',
        quesoMuyCurado: 'Very aged cheeses (smoked Idiazábal, Parmigiano 36m)',
        cortezaLavada: 'Washed-rind cheeses',
        heladoPX: 'Vanilla ice cream drizzled with PX',
        frutosSecos: 'Nuts and caramel'
      }
    },
  },
  fr: {
    nav: { cava: 'Ma Cave', add: 'Ajouter', historial: 'Historique', ajustes: 'Réglages' },
    titles: { cava: 'Ma Cave', add: 'Ajouter un vin', historial: 'Historique', ajustes: 'Réglages', cava3d: 'Cave 3D' },
    cellar: {
      search: 'Rechercher par nom, domaine, région…',
      empty: { title: 'Votre cave est vide', description: 'Ajoutez votre première bouteille et commencez le suivi.', action: 'Ajouter un vin' },
      full: 'Cave pleine · {count} bouteilles',
      button3d: 'Voir la cave 3D',
      loading: 'Chargement…',
      noResults: { title: 'Aucun résultat', description: 'Essayez un autre nom, domaine ou région.', action: 'Effacer la recherche' },
      addWine: 'Ajouter un vin',
    },
    wine: {
      stock: 'Bouteilles',
      add: 'Ajouter une bouteille de {name}',
      consume: 'Déboucher {name}',
      undo: 'Annuler',
      openDetail: 'Voir la fiche de {name}',
      vintage: (v) => v ? String(v) : 'S.A.',
      noVintage: 'S.A.',
      semaphore: { ready: 'Prêt', keep: 'Garder', past: 'Passé', unknown: 'Sans données' },
      detail: {
        title: 'Fiche du vin',
        notes: 'Notes de dégustation & accords',
        location: 'Emplacement',
        window: 'Fenêtre de dégustation',
        from: 'Depuis',
        to: 'Jusqu\'à',
        movements: 'Mouvements',
        adjustStock: 'Ajuster le stock',
        bottles: 'Bouteilles réelles',
        adjust: 'Ajuster',
        addNote: 'Ajouter une note au dernier débouchage',
        purchased: 'Acheté le',
        close: 'Fermer',
        windowHint: 'De et à (année)',
        noWinery: 'Sans domaine',
        noRegion: 'Sans région',
        locationPh: 'Étagère, rangée…',
        lastUncork: 'Dernier débouchage',
        noUncorks: 'Aucun débouchage',
        events: { add: 'Bouteille ajoutée', consume: 'Débouchée', import: 'Ajustement du stock', undo: 'Annulé' },
      },
      toast: { added: 'Bouteille ajoutée à {name}', consumed: 'Débouchée', undo: 'Annuler', back: 'De retour dans la cave', noStock: 'Pas de stock', notesSaved: 'Notes sauvegardées' },
    },
    add: {
      title: 'Ajouter un vin',
      essentials: 'L\'essentiel',
      tasting: 'Dégustation & Emplacement',
      name: 'Nom',
      winery: 'Domaine',
      vintage: 'Millésime',
      nv: 'Sans millésime (S.A.)',
      type: 'Type',
      varietals: 'Cépages (séparés par virgule)',
      region: 'Région',
      country: 'Pays',
      purchaseDate: 'Date d\'achat',
      price: 'Prix (€, optionnel)',
      location: 'Emplacement',
      window: 'Fenêtre de dégustation',
      from: 'Depuis',
      to: 'Jusqu\'à',
      notes: 'Notes de dégustation & accords',
      bottles: 'Bouteilles',
      submit: 'Ajouter à la cave',
      duplicate: { title: 'Doublon possible', message: 'Vous avez déjà un vin avec ce nom et ce millésime d\'un autre domaine.', force: 'Enregistrer quand même' },
      validation: { nameRequired: 'Le nom est obligatoire', vintageRange: 'Millésime entre 1900 et {max}, ou cochez S.A.', priceInvalid: 'Prix invalide' },
      barcode: { label: 'Code-barres', invalid: 'Code-barres invalide.', searching: 'Recherche…', search: 'Rechercher', camera: 'Lire le code-barres avec la caméra', noBarcode: "Je n'ai pas trouvé de code-barres sur la photo.", readError: 'Impossible de lire le code.', use: 'Utiliser' },
      windowHint: 'De et à (année)',
      countryPh: 'Espagne',
      varietalsPh: 'Fruit rouge, bois…',
      scanner: {
        title: 'Scanner l\'étiquette',
        drop: 'ou déposez une photo ici',
        loading: 'Lecture de l\'étiquette…',
        noKey: 'Ajoutez une clé Gemini dans les Réglages pour scanner les étiquettes',
        manual: 'En attendant, vous pouvez saisir les données manuellement.',
        retry: 'Essayer avec Gemini',
        error: 'Erreur',
        failed: "Gemini n'a pas reconnu l'étiquette.",
        fillEmpty: 'Seuls les champs vides sont remplis.',
        viewText: 'Voir le texte lu',
      },
    },
    history: {
      title: 'Historique',
      empty: 'Aucun débouchage pour l\'instant',
      emptyDesc: 'Quand vous déboucherez une bouteille, elle apparaîtra ici, groupée par mois.',
      outOfCellar: 'Hors cave',
      back: 'Retour à la cave',
      backToast: 'De retour dans la cave',
      addError: 'Ajout impossible',
      monthFormat: (m, y) => new Date(y, m, 1).toLocaleDateString('fr', { month: 'long', year: 'numeric' }).toUpperCase(),
    },
    settings: {
      stats: {
        title: 'Statistiques',
        bottles: 'Bouteilles',
        references: 'Références',
        value: 'Valeur estimée',
        lastExport: 'Dernière exportation',
        never: 'Jamais',
        byType: 'Par type',
        apogeo: 'Apogée',
        apogeoCards: { ready: 'Prêts', keep: 'À garder', past: 'Passés', unknown: 'Sans données' },
        evolution: 'Évolution mensuelle des débouchages',
      },
      appearance: { title: 'Apparence', theme: 'Thème', light: 'clair', dark: 'sombre', toggle: (t) => `Passer en ${t}` },
      scanner: {
        title: 'Scanner d\'étiquettes',
        info: 'La lecture se fait sur l\'appareil avec Tesseract. La première fois, les modèles (≈9 Mo) sont téléchargés et mis en cache ; ensuite cela fonctionne hors ligne. La photo n\'est jamais stockée.',
        keyLabel: 'Clé API Google Gemini',
        keyHint: 'Optionnel. Stockée uniquement dans ce navigateur et envoyée uniquement à Google pour retenter les lectures que le moteur local n\'a pas pu compléter.',
        save: 'Enregistrer la clé',
        delete: 'Supprimer la clé',
        saved: 'Clé enregistrée',
        deleted: 'Clé supprimée',
      },
      data: {
        title: 'Vos données',
        exportJson: 'Exporter JSON',
        exportCsv: 'Exporter CSV',
        import: 'Importer un fichier',
        empty: { title: 'Vider la cave', confirm: 'Tapez SUPPRIMER pour confirmer', action: 'Vider', toast: 'Cave vidée · copie téléchargée' },
      },
      about: { title: 'À propos', version: 'Mi Cava {version} · logiciel libre sous licence MIT.', github: 'Code sur GitHub', offLink: 'Données Open Food Facts (ODbL)' },
      cave3d: {
        title: 'Cave 3D',
        depth: 'Profondeur (bouteilles)',
        width: 'Largeur (bouteilles)',
        shelves: 'Étages',
        fill: 'Mode de remplissage',
        fillWine: 'Par vin (regroupe chaque vin)',
        fillType: 'Par type (regroupe par couleur)',
        capacity: 'Capacité totale : {count} bouteilles',
        overCapacity: '⚠ Dépasse 320 (sera rogné visuellement)',
        depthHint: 'Rangs de fond (1-20)',
        widthHint: 'Bouteilles par rang (1-4)',
        shelvesHint: 'Hauteur en étages (1-8)',
        fillWineHint: 'Regroupe les bouteilles du même vin en cases contiguës',
        fillTypeHint: 'Regroupe par type : rouge, blanc, rosé…',
      },
    },
    importer: {
      title: 'Importer',
      step1: 'Étape 1 : Correspondance des colonnes',
      step2: 'Étape 2 : Résumé',
      step3: 'Étape 3 : Résultat',
      mapping: { header: 'Colonne', sample: 'Exemple', ignore: 'Ignorer', dateFormat: 'Format de date', ddmmyy: 'jj/mm/aaaa', mmddyy: 'mm/jj/aaaa' },
      plan: { creates: 'Nouveaux vins', merges: 'Fusionner dans existants', duplicates: 'Doublons possibles', errors: 'Erreurs', apply: 'Appliquer', disabled: 'Rien à appliquer' },
      result: { restored: 'Restauré : {new} nouveaux, {updated} mis à jour', imported: 'Importé : {creates} nouveaux, {merges} fusionnés' },
      errors: { noName: 'nom manquant', noVintage: 'millésime invalide', invalidStock: 'stock invalide', notFound: 'Ce code n\'est pas dans Open Food Facts', notWine: 'Ce code n\'est pas un vin dans Open Food Facts' },
      restore: 'Restaurer',
      restoring: 'Restauration…',
      empty: 'Le CSV est vide.',
      lineError: 'Ligne {n}: {msg}',
    },
    common: { save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', confirm: 'Confirmer', close: 'Fermer', loading: 'Chargement…', error: 'Erreur', yes: 'Oui', no: 'Non' },
    pwa: { update: 'Nouvelle version disponible', reload: 'Recharger' },
    support: {
      title: 'Mi Cava vous est utile ?',
      body: 'C’est gratuit et sans publicité. Si ça vous fait gagner du temps, offrez-moi un café pour m’aider à la maintenir.',
      coffee: 'Offrez-moi un café',
      later: 'Pas maintenant',
    },
    cave3d: {
      depthLabel: (n) => `R${n}`,
      shelfLabel: (n) => `Étage ${n}`,
      overflow: 'Excédent',
      legend: {
        depth: 'Profondeur',
        width: 'Largeur',
        shelves: 'Étages',
        capacity: 'Capacité',
      },
    },
    stats: {
      distributionTitle: 'Distribution par type',
      apogeoTitle: 'Apogée',
      evolutionTitle: 'Évolution mensuelle des débouchages',
    },
    types: {
      tinto: 'Rouge',
      blanco: 'Blanc',
      rosado: 'Rosé',
      espumoso: 'Effervescent',
      dulce: 'Moelleux',
      fortificado: 'Fortifié',
      sinTipo: 'Sans type',
    },
    drink: { ready: 'Prêt', keep: 'Garder', past: 'Passé', unknown: 'Sans données' },
    monthly: {
      months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      ariaLabel: (year) => `Évolution mensuelle des débouchages ${year}`,
      total: (count, year) => `${count} débouchages en ${year}`,
    },
    caveConfig: {
      title: 'Cave 3D',
      depth: 'Profondeur (bouteilles)',
      width: 'Largeur (bouteilles)',
      shelves: 'Étages',
      fill: 'Mode de remplissage',
      fillWine: 'Par vin (regroupe chaque vin)',
      fillType: 'Par type (regroupe par couleur)',
      fillWineHint: 'Regroupe les bouteilles du même vin en cases contiguës',
      fillTypeHint: 'Regroupe par type : rouge, blanc, rosé…',
      depthHint: 'Rangs de fond (1-20)',
      widthHint: 'Bouteilles par rang (1-4)',
      shelvesHint: 'Hauteur en étages (1-8)',
      capacity: 'Capacité totale : {count} bouteilles',
      overCapacity: '⚠ Dépasse 320 (sera rogné visuellement)',
      autoSave: 'Les changements sont enregistrés automatiquement. La vue 3D se met à jour instantanément.',
    },
    cellarScreen: {
      full: 'Cave pleine · {count} bouteilles',
      loading: 'Chargement…',
      noResults: { title: 'Aucun résultat', description: 'Essayez un autre nom, domaine ou région.', action: 'Effacer la recherche' },
      empty: { title: 'Votre cave est vide', description: 'Ajoutez votre première bouteille et commencez le suivi.', action: 'Ajouter un vin' },
    },
    cave3dScreen: {
      title: 'Cave 3D',
      back: 'Retour à la liste',
    },
    settingsScreen: {
      title: 'Réglages',
      stats: 'Statistiques',
      appearance: 'Apparence',
      scanner: 'Scanner d\'étiquettes',
      scannerInfo: 'La lecture se fait sur l\'appareil avec Tesseract. La première fois, les modèles (≈9 Mo) sont téléchargés et mis en cache ; ensuite cela fonctionne hors ligne. La photo n\'est jamais stockée.',
      data: 'Vos données',
      about: 'À propos',
      cave3d: 'Cave 3D',
    },
    foodPairing: {
      title: 'Accords recommandés',
      description: 'Suggestions basées sur la gastronomie espagnole traditionnelle et recommandations de sommeliers.',
      servingTemp: 'Température de service',
      pairWith: 'Accompagne',
      avoid: 'À éviter',
      tip: 'Conseil',
      searchPlaceholder: 'Rechercher un plat ou ingrédient…',
      noResults: 'Aucun accord trouvé pour cette recherche',
      categories: {
        tinto: {
          carnes: 'Viandes rouges et rôtis',
          guisos: 'Ragoûts et plats en sauce',
          embutidos: 'Charcuteries et fromages affinés',
          arroces: 'Riz consistants et légumineuses'
        },
        blanco: {
          pescados: 'Poissons et fruits de mer',
          arroces: 'Riz aux fruits de mer et fideuà',
          verduras: 'Légumes, conserves et crudités',
          aperitivos: 'Apéritifs et cuisine froide'
        },
        rosado: {
          arroces: 'Riz et paellas (le joker parfait)',
          tapas: 'Tapas au tomate, vinaigre et épices douces',
          carnesBlancas: 'Viandes blanches, charcuteries douces et fromages',
          asiatica: 'Cuisine asiatique et épices modérées'
        },
        espumoso: {
          aperitivos: 'Apéritifs et entrées froides (roi du début)',
          principales: 'Plats principaux polyvalents',
          postres: 'Desserts (selon le niveau de sucre)',
          picante: 'Cuisine épicée et exotique'
        },
        dulce: {
          postres: 'Desserts par affinité (doux avec doux)',
          quesosAzules: 'Fromages bleus et pâtes molles fortes',
          foie: 'Foie gras et pâtés riches',
          salados: 'Plats salés à touche aigre-douce'
        },
        fortificado: {
          fino: 'Fino / Manzanilla — Apéritif, fruits de mer et jambon',
          amontillado: 'Amontillado / Palo Cortado — Légumes difficiles, épices',
          oloroso: 'Oloroso — Gibier, ragoûts consistants, fromages très affinés',
          px: 'Pedro Ximénez / Moscatel — Desserts, fromages bleus, foie'
        }
      },
      dishes: {
        chuleton: 'Entrecôte grillée',
        corderoLechal: 'Agneau de lait rôti',
        cochinillo: 'Cochon de lait rôti',
        solomillo: 'Filet de bœuf',
        caza: 'Gibier (sanglier, cerf, chevreuil)',
        cocido: 'Cocido madrilène',
        fabada: 'Fabada asturienne',
        lentejas: 'Lentilles au chorizo',
        estofado: 'Ragoût de bœuf',
        raboToro: 'Queue de bœuf',
        chilindron: 'Agneau au chilindrón',
        jamonIberico: 'Jambon ibérique de gland',
        chorizo: 'Chorizo, saucisson, lomo',
        manchego: 'Manchego affiné',
        idiazabal: 'Idiazábal',
        arrozBogavante: 'Riz au homard',
        arrozSetas: 'Riz crémeux aux champignons',
        alubias: 'Haricots avec sacramentos',
        merluza: 'Merlu (grillé / en sauce verte)',
        rodaballo: 'Turbot rôti',
        vieiras: 'Coquilles Saint-Jacques à la galicienne',
        gambas: 'Crevettes à l\'ail',
        boquerones: 'Anchois frits',
        anchoas: 'Anchois',
        ceviche: 'Ceviche',
        sashimi: 'Sashimi',
        paellaMarisco: 'Paella aux fruits de mer',
        fideua: 'Fideuà de Gandía',
        arrozCaldoso: 'Riz au bouillon de homard',
        arrozNegro: 'Riz noir',
        esparragos: 'Asperges de Navarre',
        piquillos: 'Piments piquillos farcis',
        ensaladaTomate: 'Salade tomate et ventrèche',
        alcachofas: 'Artichauts confits',
        conservas: 'Conserves de thon / maquereau',
        gazpacho: 'Gazpacho et salmorejo',
        ajoBlanco: 'Ajo blanco',
        quesoFresco: 'Fromages frais (burgos, mozzarella)',
        paellaValenciana: 'Paella valencienne',
        paellaMixta: 'Paella mixte (poulet + fruits de mer)',
        paellaVerduras: 'Paella aux légumes',
        panTomate: 'Pain à la tomate',
        patatasBravas: 'Patatas bravas',
        padrón: 'Piments de Padrón',
        pulpo: 'Poulpe à la galicienne',
        ensaladilla: 'Salade russe',
        tostaTomate: 'Tartine tomate et anchois',
        polloAjillo: 'Poulet à l\'ail',
        conejoAjillo: 'Lapin à l\'ail',
        lomo: 'Lomo embuché',
        tortilla: 'Tortilla de pommes de terre',
        sushi: 'Sushi et sashimi',
        padThai: 'Pad thaï doux',
        curry: 'Curry vert doux',
        gyozas: 'Gyozas',
        tempura: 'Tempura',
        tablaQuesos: 'Plateau de fromages variés',
        ostras: 'Huîtres et fruits de mer crus',
        hummus: 'Houmous avec crudités',
        cocidoEspumoso: 'Cocido madrilène (Brut Nature Reserva)',
        corderoAsado: 'Agneau rôti (Gran Reserva)',
        cochinilloAsado: 'Cochon de lait rôti (Extra Brut Gran Reserva)',
        zarzuela: 'Zarzuela de poisson et fruits de mer',
        canelones: 'Cannelloni / lasagnes',
        turronAlmendra: 'Nougat aux amandes (Extra Brut Gran Reserva)',
        turronChocolate: 'Nougat au chocolat (Rosé)',
        panettone: 'Panettone au chocolat (Demi-sec)',
        roscón: 'Roscón de Reyes (Brut Reserva)',
        tartaManzana: 'Tarte aux pommes / crème citron (Demi-sec)',
        curryThai: 'Curry thaï',
        tacos: 'Cuisine mexicaine (tacos, mole doux)',
        chocolate: 'Chocolat noir (70%+ cacao)',
        tartaSantiago: 'Tarte de Saint-Jacques',
        cremeBrulee: 'Crème brûlée',
        tartaTatin: 'Tarte Tatin',
        heladoVainilla: 'Glace vanille au PX',
        flan: 'Flan au caramel',
        tocinoCielo: 'Tocino de cielo',
        yemas: 'Yemas de Santa Teresa',
        roquefort: 'Roquefort',
        cabrales: 'Cabrales',
        gorgonzola: 'Gorgonzola',
        stilton: 'Stilton',
        quesoSerena: 'Fromage de La Serena',
        foie: 'Foie gras de canard',
        pate: 'Pâté de foie',
        magret: 'Magret de canard au PX',
        mariscoCrudo: 'Fruits de mer crus (huîtres, palourdes, percebes)',
        pescaito: 'Pescaito frito (Manzanilla)',
        sushiSashimi: 'Sushi / sashimi',
        alcachofasFort: 'Artichauts (même grillés)',
        esparragosTrigueros: 'Asperges sauvages',
        setas: 'Champignons',
        currySuave: 'Curry doux / cuisine indienne',
        ahumados: 'Fumés (saumon, cabillaud)',
        quesoSemicurado: 'Fromages demi-affinés',
        raboToroFort: 'Queue de bœuf',
        cazaMayor: 'Grand gibier (sanglier, cerf)',
        quesoMuyCurado: 'Fromages très affinés (Idiazábal fumé, Parmigiano 36m)',
        cortezaLavada: 'Fromages à croûte lavée',
        heladoPX: 'Glace vanille arrosée de PX',
        frutosSecos: 'Fruits secs et caramel'
      }
    },
  },
}