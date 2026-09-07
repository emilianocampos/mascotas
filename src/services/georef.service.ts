/**
 * Servicio de Integración con Georef AR (API Oficial del Gobierno Argentino / IGN / INDEC)
 * https://apis.datos.gob.ar/georef/api
 */

export interface GeorefAddressSuggestion {
  id: string;
  name: string; // e.g. "SAN MARTÍN 450"
  street: string;
  number?: number | null;
  locality?: string;
  department: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Busca direcciones y calles oficiales en Chubut / Trelew a medida que el usuario escribe
 */
export async function searchGeorefAddresses(
  query: string,
  province = 'Chubut'
): Promise<GeorefAddressSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = encodeURIComponent(query.trim());
  const suggestions: GeorefAddressSuggestion[] = [];

  try {
    // 1. Intentar buscar como dirección con altura o cruce
    const dirRes = await fetch(
      `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${cleanQuery}&provincia=${encodeURIComponent(province)}&max=5`,
      { headers: { Accept: 'application/json' } }
    );

    if (dirRes.ok) {
      const dirData = await dirRes.json();
      (dirData.direcciones || []).forEach((d: any) => {
        suggestions.push({
          id: `dir-${d.calle?.id || Math.random()}-${d.altura?.valor || ''}`,
          name: d.nomenclatura || `${d.calle?.nombre || ''} ${d.altura?.valor || ''}`.trim(),
          street: d.calle?.nombre || '',
          number: d.altura?.valor || null,
          locality: d.localidad_censal?.nombre || 'Trelew',
          department: d.departamento?.nombre || 'Rawson',
          province: d.provincia?.nombre || 'Chubut',
          latitude: d.ubicacion?.lat || null,
          longitude: d.ubicacion?.lon || null,
        });
      });
    }

    // 2. Si no hubo resultados de direcciones completas, buscar como nombre de calle
    if (suggestions.length === 0) {
      const callesRes = await fetch(
        `https://apis.datos.gob.ar/georef/api/calles?nombre=${cleanQuery}&provincia=${encodeURIComponent(province)}&max=6`,
        { headers: { Accept: 'application/json' } }
      );

      if (callesRes.ok) {
        const callesData = await callesRes.json();
        (callesData.calles || []).forEach((c: any) => {
          suggestions.push({
            id: `calle-${c.id}`,
            name: `${c.nombre} (${c.departamento?.nombre || 'Trelew'})`,
            street: c.nombre,
            number: null,
            locality: 'Trelew',
            department: c.departamento?.nombre || 'Rawson',
            province: c.provincia?.nombre || 'Chubut',
            latitude: null,
            longitude: null,
          });
        });
      }
    }
  } catch (error) {
    console.error('Error al consultar Georef AR:', error);
  }

  return suggestions;
}

/**
 * Consulta la ubicación oficial administrativa argentina (Provincia, Departamento, Municipio) por coordenadas
 */
export async function getGeorefLocation(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://apis.datos.gob.ar/georef/api/ubicacion?lat=${lat}&lon=${lon}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.ubicacion || null;
  } catch (err) {
    console.error('Error al obtener ubicación Georef:', err);
    return null;
  }
}
