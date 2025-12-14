import * as cheerio from 'cheerio';

const DOF_BASE_URL = "https://www.dof.gob.mx";

/**
 * Determina qué edición del DOF procesar según la hora actual (CDMX)
 */
export function determinarEdicionActual(): 'Matutina' | 'Vespertina' {
  const ahora = new Date();
  const hora = ahora.getHours();
  
  // Matutina: 8:00 AM - 3:59 PM (hora CDMX)
  // Vespertina: 4:00 PM - 7:59 AM del día siguiente
  if (hora >= 8 && hora < 16) {
    return 'Matutina';
  } else {
    return 'Vespertina';
  }
}

export interface DocumentoDOFRaw {
  titulo: string;
  tipo_documento: string;
  url_dof: string;
  edicion: string;
  fecha_publicacion: Date;
}

export async function obtenerDocumentosDOF(fecha: Date): Promise<DocumentoDOFRaw[]> {
  try {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    
    const url = `${DOF_BASE_URL}/index.php?year=${year}&month=${month}&day=${day}`;
    
    console.log(`Scraping DOF para fecha: ${year}-${month}-${day}`);
    console.log(`URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const documentos: DocumentoDOFRaw[] = [];

    // Buscar todos los enlaces a documentos
    $('a[href*="nota_dof.php"], a[href*="nota_detalle.php"]').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const titulo = $link.text().trim();

      if (href && titulo && titulo.length > 10) {
        const fullUrl = href.startsWith('http') ? href : `${DOF_BASE_URL}/${href}`;
        
        documentos.push({
          titulo,
          url_dof: fullUrl,
          tipo_documento: inferirTipoDocumento(titulo),
          edicion: inferirEdicion($link),
          fecha_publicacion: fecha,
        });
      }
    });

    console.log(`Encontrados ${documentos.length} documentos`);
    return documentos;
  } catch (error) {
    console.error('Error scraping DOF:', error);
    return [];
  }
}

export async function obtenerExtracto(url: string, maxChars: number = 2000): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Intentar encontrar el contenido principal
    let texto = '';
    
    // Buscar en diferentes posibles contenedores
    const posiblesSelectores = [
      '.contenido',
      '#content',
      '.documento',
      'article',
      'main',
      'body'
    ];

    for (const selector of posiblesSelectores) {
      const $contenido = $(selector);
      if ($contenido.length > 0) {
        texto = $contenido.text();
        break;
      }
    }

    // Limpiar el texto
    texto = texto
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();

    return texto.substring(0, maxChars);
  } catch (error) {
    console.error(`Error obteniendo extracto de ${url}:`, error);
    return '';
  }
}

function inferirTipoDocumento(texto: string): string {
  const textoUpper = texto.toUpperCase();

  const tipos = [
    { keyword: 'DECRETO', tipo: 'Decreto' },
    { keyword: 'ACUERDO', tipo: 'Acuerdo' },
    { keyword: 'AVISO', tipo: 'Aviso' },
    { keyword: 'CIRCULAR', tipo: 'Circular' },
    { keyword: 'LINEAMIENTOS', tipo: 'Lineamientos' },
    { keyword: 'REGLAS', tipo: 'Reglas' },
    { keyword: 'RESOLUCIÓN', tipo: 'Resolución' },
    { keyword: 'LEY', tipo: 'Ley' },
    { keyword: 'REGLAMENTO', tipo: 'Reglamento' },
    { keyword: 'NOM-', tipo: 'NOM' },
    { keyword: 'CONVOCATORIA', tipo: 'Convocatoria' },
  ];

  for (const { keyword, tipo } of tipos) {
    if (textoUpper.includes(keyword)) {
      return tipo;
    }
  }

  return 'Otro';
}

type CheerioContexto = {
  parent(): { text(): string };
};

function inferirEdicion($element: CheerioContexto): string {
  const textoContexto = $element.parent().text().toUpperCase();

  if (textoContexto.includes('VESPERTINA')) {
    return 'Vespertina';
  }
  if (textoContexto.includes('EXTRAORDINARIA')) {
    return 'Extraordinaria';
  }

  return 'Matutina';
}
