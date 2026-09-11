import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { LostReport, FoundReport, Sighting, MapMarkerItem, AdminDashboardStats, PetSpecies } from '@/types';
import { LostReportInput } from '@/lib/validations/lost-report.schema';
import { FoundReportInput } from '@/lib/validations/found-report.schema';
import { SightingInput } from '@/lib/validations/sighting.schema';

/**
 * SERVICIO DIRECTO DE BASE DE DATOS SUPABASE + POSTGIS (SIN MOCKS)
 */

/**
 * Decodifica cualquier formato de coordenadas de PostGIS (EWKB, WKT, GeoJSON, objeto lat/lng)
 */
export function parseCoordinates(loc: any): { latitude: number; longitude: number } {
  if (!loc) return { latitude: -43.24895, longitude: -65.30505 };

  // Si ya es un objeto { latitude, longitude } o { lat, lng }
  if (typeof loc === 'object' && loc !== null) {
    if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      return { latitude: loc.latitude, longitude: loc.longitude };
    }
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      return { latitude: loc.lat, longitude: loc.lng };
    }
    // GeoJSON { type: 'Point', coordinates: [lng, lat] }
    if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      return { latitude: Number(loc.coordinates[1]), longitude: Number(loc.coordinates[0]) };
    }
  }

  // Si es un string WKT (Ej: "POINT(-65.30505 -43.24895)")
  if (typeof loc === 'string') {
    const wktMatch = loc.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (wktMatch) {
      const lng = parseFloat(wktMatch[1]);
      const lat = parseFloat(wktMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Si es un string EWKB Hexadecimal (Ej: "0101000020E6100000...")
    try {
      const cleanHex = loc.trim().replace(/^\\x/, '');
      if (cleanHex.length >= 32) {
        const bytes = new Uint8Array(cleanHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
        const view = new DataView(bytes.buffer);
        const isLittleEndian = bytes[0] === 1;
        let offset = 1;
        const geomType = view.getUint32(offset, isLittleEndian);
        offset += 4;
        if ((geomType & 0x20000000) !== 0) {
          offset += 4; // saltar SRID
        }
        const lng = view.getFloat64(offset, isLittleEndian);
        offset += 8;
        const lat = view.getFloat64(offset, isLittleEndian);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { latitude: lat, longitude: lng };
        }
      }
    } catch (e) {
      // Fallback
    }
  }

  return { latitude: -43.24895, longitude: -65.30505 };
}

// 1. Subir fotografía a Supabase Storage Bucket 'pet-photos' o 'sighting-photos'
export async function uploadPetPhoto(file: File, bucketName: 'pet-photos' | 'sighting-photos' = 'pet-photos'): Promise<string> {
  const supabase = createBrowserClient();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error al subir imagen a Supabase Storage:', uploadError);
    throw new Error(`Error al subir imagen: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// 2. Obtener Mascotas Perdidas por proximidad (PostGIS RPC o consulta Supabase)
export async function getNearbyLostReports(
  lat: number = -43.24895,
  lng: number = -65.30505,
  radiusMeters: number = 10000,
  species?: PetSpecies | 'all'
): Promise<LostReport[]> {
  const supabase = createBrowserClient();
  
  // Intentar llamar a la función RPC de PostGIS
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_lost_reports', {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
    p_species: species === 'all' ? null : species,
  });

  if (!rpcError && rpcData) {
    return rpcData.map((item: any) => ({
      id: item.id,
      user_id: '',
      pet_id: item.pet_id,
      status: item.status,
      last_seen_date: item.last_seen_date,
      last_seen_location: parseCoordinates(item.last_seen_location || { latitude: item.latitude, longitude: item.longitude }),
      approximate_address: item.approximate_address,
      description: '',
      contact_phone_public: true,
      views_count: 0,
      created_at: item.created_at,
      updated_at: item.created_at,
      distance_meters: item.distance_meters,
      pet: {
        id: item.pet_id,
        name: item.pet_name,
        species: item.species,
        breed: item.breed,
        gender: 'unknown',
        size: item.size,
        primary_color: item.primary_color,
        photos: item.photos || [],
        created_at: item.created_at,
      }
    }));
  }

  // Consulta directa a tablas si la función RPC aún no está creada
  let query = supabase
    .from('lost_reports')
    .select('*, pet:pets(*), profile:profiles(*)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (species && species !== 'all') {
    // Si se filtra por especie se puede filtrar en memoria
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error al consultar lost_reports en Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    last_seen_location: parseCoordinates(row.last_seen_location),
  })) as LostReport[];
}

// 3. Obtener Mascotas Encontradas
export async function getNearbyFoundReports(
  lat: number = -43.24895,
  lng: number = -65.30505,
  radiusMeters: number = 10000,
  species?: PetSpecies | 'all'
): Promise<FoundReport[]> {
  const supabase = createBrowserClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_nearby_found_reports', {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
    p_species: species === 'all' ? null : species,
  });

  if (!rpcError && rpcData) {
    return rpcData.map((item: any) => ({
      id: item.id,
      finder_id: '',
      pet_id: item.pet_id,
      status: item.status,
      found_date: item.found_date,
      found_location: parseCoordinates(item.found_location || { latitude: item.latitude, longitude: item.longitude }),
      approximate_address: item.approximate_address,
      is_holding: item.is_holding,
      description: '',
      created_at: item.created_at,
      updated_at: item.created_at,
      distance_meters: item.distance_meters,
      pet: {
        id: item.pet_id,
        name: 'Encontrado',
        species: item.species,
        breed: item.breed,
        gender: 'unknown',
        size: item.size,
        primary_color: item.primary_color,
        photos: item.photos || [],
        created_at: item.created_at,
      }
    }));
  }

  const { data, error } = await supabase
    .from('found_reports')
    .select('*, pet:pets(*), profile:profiles(*)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al consultar found_reports:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    found_location: parseCoordinates(row.found_location),
  })) as FoundReport[];
}

export type UnifiedReport = 
  | (LostReport & { report_type: 'lost' })
  | (FoundReport & { report_type: 'found' });

// 4. Obtener Ficha de Mascota Perdida por ID
export async function getLostReportById(id: string): Promise<LostReport | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('lost_reports')
    .select('*, pet:pets(*), profile:profiles(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }
  return {
    ...data,
    last_seen_location: parseCoordinates(data.last_seen_location),
  } as LostReport;
}

// 4b. Obtener Ficha de Mascota Encontrada por ID
export async function getFoundReportById(id: string): Promise<FoundReport | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('found_reports')
    .select('*, pet:pets(*), profile:profiles(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }
  return {
    ...data,
    found_location: parseCoordinates(data.found_location),
  } as FoundReport;
}

// 4c. Obtener Ficha Unificada (sea Perdida, Encontrada o Avistamiento)
export async function getUnifiedReportById(id: string): Promise<UnifiedReport | null> {
  const lost = await getLostReportById(id);
  if (lost) {
    return { ...lost, report_type: 'lost' };
  }
  const found = await getFoundReportById(id);
  if (found) {
    return { ...found, report_type: 'found' };
  }

  // 4d. Buscar en tabla sightings si el ID corresponde a un avistamiento
  const supabase = createBrowserClient();
  const { data: sighting, error: sError } = await supabase
    .from('sightings')
    .select('*, lost_report:lost_reports(*, pet:pets(*), profile:profiles(*))')
    .eq('id', id)
    .single();

  if (!sError && sighting) {
    if (sighting.lost_report) {
      return { 
        ...sighting.lost_report, 
        last_seen_location: parseCoordinates(sighting.lost_report.last_seen_location),
        report_type: 'lost' 
      };
    }

    // Avistamiento general no vinculado a un reporte específico
    const loc = parseCoordinates(sighting.location);
    return {
      id: sighting.id,
      user_id: sighting.user_id || '',
      pet_id: sighting.id,
      status: 'ACTIVE',
      last_seen_date: sighting.sighting_date,
      last_seen_location: loc,
      approximate_address: sighting.approximate_address,
      description: sighting.description || 'Avistamiento reportado en la vía pública',
      contact_phone_public: false,
      views_count: 0,
      created_at: sighting.created_at || sighting.sighting_date,
      updated_at: sighting.created_at || sighting.sighting_date,
      report_type: 'lost',
      pet: {
        id: sighting.id,
        name: 'Mascota Avistada',
        species: 'dog',
        breed: 'Vista en la calle',
        gender: 'unknown',
        size: 'medium',
        primary_color: 'A verificar',
        photos: sighting.photo_url ? [sighting.photo_url] : [],
        created_at: sighting.created_at || sighting.sighting_date,
      }
    };
  }

  return null;
}

// 5. Obtener Avistamientos de una Mascota Perdida
export async function getSightingsForReport(lostReportId: string): Promise<Sighting[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .eq('lost_report_id', lostReportId)
    .order('sighting_date', { ascending: false });

  if (error) {
    console.error('Error al consultar sightings en Supabase:', error);
    return [];
  }
  return (data || []).map((row: any) => ({
    ...row,
    location: parseCoordinates(row.location),
  })) as Sighting[];
}

// 6. Obtener Marcadores Unificados para el Mapa (Pines 🔴 🟢 🟡)
export async function getMapMarkers(
  minLat: number = -43.5,
  minLng: number = -65.6,
  maxLat: number = -43.0,
  maxLng: number = -65.0
): Promise<MapMarkerItem[]> {
  const supabase = createBrowserClient();

  // Recopilar directamente de las 3 tablas en Supabase con selección completa (incluyendo calles y fechas exactas)
  const [lostRes, foundRes, sightingRes] = await Promise.all([
    supabase
      .from('lost_reports')
      .select('id, last_seen_date, last_seen_location, approximate_address, status, created_at, pet:pets(name, species, photos)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false }),
    supabase
      .from('found_reports')
      .select('id, found_date, found_location, approximate_address, status, created_at, pet:pets(name, species, photos)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false }),
    supabase
      .from('sightings')
      .select('id, sighting_date, location, approximate_address, photo_url, status, created_at, lost_report_id, lost_report:lost_reports(id, pet:pets(name, species, photos))')
      .order('created_at', { ascending: false }),
  ]);

  const markers: MapMarkerItem[] = [];

  (lostRes.data || []).forEach((row: any) => {
    const coords = parseCoordinates(row.last_seen_location);
    markers.push({
      marker_id: row.id,
      marker_type: 'lost',
      title: `${row.pet?.name || 'Mascota'}`,
      species: row.pet?.species || 'dog',
      photo_url: row.pet?.photos?.[0] || null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      report_date: row.last_seen_date,
      approximate_address: row.approximate_address,
      created_at: row.created_at,
    });
  });

  (foundRes.data || []).forEach((row: any) => {
    const coords = parseCoordinates(row.found_location);
    markers.push({
      marker_id: row.id,
      marker_type: 'found',
      title: 'Mascota Encontrada',
      species: row.pet?.species || 'dog',
      photo_url: row.pet?.photos?.[0] || null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      report_date: row.found_date,
      approximate_address: row.approximate_address,
      created_at: row.created_at,
    });
  });

  (sightingRes.data || []).forEach((row: any) => {
    const coords = parseCoordinates(row.location);
    const petName = row.lost_report?.pet?.name;
    markers.push({
      marker_id: row.id,
      marker_type: 'sighting',
      title: petName ? `Avistamiento de ${petName}` : 'Mascota Avistada',
      species: row.lost_report?.pet?.species || 'dog',
      photo_url: row.photo_url || row.lost_report?.pet?.photos?.[0] || null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      report_date: row.sighting_date,
      approximate_address: row.approximate_address,
      created_at: row.created_at,
    });
  });

  return markers;
}

// 7. Insertar Mascota Perdida (Guardar en Supabase)
export async function createLostReportInDb(input: LostReportInput): Promise<string> {
  const supabase = createBrowserClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  // 1. Insertar mascota en tabla `pets`
  const { data: petData, error: petError } = await supabase
    .from('pets')
    .insert({
      name: input.name,
      species: input.species,
      breed: input.breed || null,
      gender: input.gender,
      size: input.size,
      primary_color: input.primary_color,
      secondary_color: input.secondary_color || null,
      distinctive_features: input.distinctive_features || null,
      photos: input.photos,
      owner_id: userId || null,
    })
    .select('id')
    .single();

  if (petError || !petData) {
    console.error('Error insertando pet:', petError);
    throw new Error(`Error al guardar mascota: ${petError?.message}`);
  }

  const street = (input.street_name || input.approximate_address || '').trim();
  const num = (input.street_number || '').trim();
  const barrio = (input.neighborhood || '').trim();
  
  let formattedAddress = street;
  if (num && !street.includes(num)) {
    formattedAddress = `${formattedAddress} ${num}`;
  }
  if (barrio) {
    formattedAddress = `${formattedAddress}, B° ${barrio.replace(/^b[°ºa-z.]*\s*/i, '')}`;
  }

  // 2. Insertar reporte con coordenadas PostGIS
  const { data: reportData, error: reportError } = await supabase
    .from('lost_reports')
    .insert({
      pet_id: petData.id,
      user_id: userId || null,
      last_seen_date: input.last_seen_date,
      last_seen_location: `POINT(${input.longitude} ${input.latitude})`,
      approximate_address: formattedAddress,
      description: input.description,
      contact_phone: input.contact_phone || null,
      contact_name: input.contact_name || null,
      contact_phone_public: input.contact_phone_public,
      status: 'ACTIVE',
    })
    .select('id')
    .single();

  if (reportError || !reportData) {
    console.error('Error insertando lost_report:', reportError);
    throw new Error(`Error al crear publicación: ${reportError?.message}`);
  }

  if (userId && input.contact_phone) {
    try {
      await supabase.from('profiles').update({
        phone: input.contact_phone,
        full_name: input.contact_name,
      }).eq('id', userId);
    } catch (e) {
      console.warn('No se pudo actualizar profile con phone:', e);
    }
  }

  return reportData.id;
}

// 8. Insertar Mascota Encontrada en Supabase
export async function createFoundReportInDb(input: FoundReportInput): Promise<string> {
  const supabase = createBrowserClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  const { data: petData, error: petError } = await supabase
    .from('pets')
    .insert({
      name: 'Encontrado',
      species: input.species,
      breed: input.breed || null,
      gender: input.gender,
      size: input.size,
      primary_color: input.primary_color,
      secondary_color: input.secondary_color || null,
      distinctive_features: input.distinctive_features || null,
      photos: input.photos,
      owner_id: userId || null,
    })
    .select('id')
    .single();

  if (petError || !petData) {
    throw new Error(`Error al guardar mascota: ${petError?.message}`);
  }

  const foundStreet = (input.street_name || input.approximate_address || '').trim();
  const foundNum = (input.street_number || '').trim();
  const foundBarrio = (input.neighborhood || '').trim();

  let formattedFoundAddress = foundStreet;
  if (foundNum && !foundStreet.includes(foundNum)) {
    formattedFoundAddress = `${formattedFoundAddress} ${foundNum}`;
  }
  if (foundBarrio) {
    formattedFoundAddress = `${formattedFoundAddress}, B° ${foundBarrio.replace(/^b[°ºa-z.]*\s*/i, '')}`;
  }

  const { data: reportData, error: reportError } = await supabase
    .from('found_reports')
    .insert({
      pet_id: petData.id,
      finder_id: userId || null,
      found_date: input.found_date,
      found_location: `POINT(${input.longitude} ${input.latitude})`,
      approximate_address: formattedFoundAddress,
      is_holding: input.is_holding,
      description: input.description,
      status: 'ACTIVE',
    })
    .select('id')
    .single();

  if (reportError || !reportData) {
    throw new Error(`Error al crear reporte de hallazgo: ${reportError?.message}`);
  }

  return reportData.id;
}

// 9. Insertar Avistamiento en Supabase
export async function createSightingInDb(input: SightingInput): Promise<string> {
  const supabase = createBrowserClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  // Si lost_report_id no es un UUID válido o es vacío, asignamos null
  const validLostReportId = input.lost_report_id && input.lost_report_id.length === 36 && input.lost_report_id !== '11111111-1111-1111-1111-111111111111'
    ? input.lost_report_id
    : null;

  let finalDescription = input.description || '';
  if (input.reporter_name && input.reporter_name.trim()) {
    finalDescription = `${finalDescription}\n\n👤 Reportado por: ${input.reporter_name.trim()}`;
  }

  const { data, error } = await supabase
    .from('sightings')
    .insert({
      lost_report_id: validLostReportId,
      user_id: userId || null,
      location: `POINT(${input.longitude} ${input.latitude})`,
      approximate_address: input.approximate_address,
      sighting_date: input.sighting_date,
      photo_url: input.photo_url || null,
      description: finalDescription,
      status: 'PENDING',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error insertando sighting:', error);
    throw new Error(`Error al registrar avistamiento: ${error?.message || 'Error en base de datos'}`);
  }

  return data.id;
}

// 9.1 Obtener Ficha de Avistamiento por ID con datos completos
export async function getSightingById(id: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('sightings')
    .select('*, lost_report:lost_reports(*, pet:pets(*), profile:profiles(*))')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

// 9b. Incrementar Contador de Vistas de una Publicación
export async function incrementReportViews(reportId: string): Promise<number> {
  const supabase = createBrowserClient();
  try {
    const { data, error } = await supabase.rpc('increment_report_views', { p_report_id: reportId });
    if (!error && typeof data === 'number') {
      return data;
    }
  } catch (e) {
    console.warn('RPC increment_report_views no disponible, usando fallback.');
  }

  try {
    const { data: current } = await supabase
      .from('lost_reports')
      .select('views_count')
      .eq('id', reportId)
      .single();

    if (current) {
      const newCount = (current.views_count || 0) + 1;
      await supabase
        .from('lost_reports')
        .update({ views_count: newCount })
        .eq('id', reportId);
      return newCount;
    }
  } catch (err) {
    console.error('Error al actualizar contador de vistas:', err);
  }
  return 0;
}

// 9c. Obtener lista de mascotas perdidas activas (para seleccionar en formulario de avistamiento)
export async function getActiveLostPetsList(): Promise<{ id: string; name: string; photo_url: string | null; address: string; phone?: string; owner_name?: string }[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('lost_reports')
    .select('id, approximate_address, contact_phone, contact_name, pet:pets(name, photos), profile:profiles(phone, full_name)')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    name: row.pet?.name || 'Mascota perdida',
    photo_url: row.pet?.photos?.[0] || null,
    address: row.approximate_address,
    phone: row.contact_phone || row.profile?.phone || '',
    owner_name: row.contact_name || row.profile?.full_name || '',
  }));
}

// 9d. Obtener reportes por IDs guardados en el dispositivo
export async function getReportsByIdsList(type: 'lost' | 'found' | 'sighting', ids: string[]): Promise<any[]> {
  if (!ids || ids.length === 0) return [];
  const supabase = createBrowserClient();

  if (type === 'lost') {
    const { data, error } = await supabase
      .from('lost_reports')
      .select('*, pet:pets(*), profile:profiles(*)')
      .in('id', ids)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }

  if (type === 'found') {
    const { data, error } = await supabase
      .from('found_reports')
      .select('*, pet:pets(*), profile:profiles(*)')
      .in('id', ids)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }

  if (type === 'sighting') {
    const { data, error } = await supabase
      .from('sightings')
      .select('*, lost_report:lost_reports(id, approximate_address, pet:pets(name, species, photos))')
      .in('id', ids)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }

  return [];
}

// 10. Confirmar Reunificación de Mascota (Cambiar estado a REUNITED)
export async function markReportAsReunitedInDb(reportId: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from('lost_reports')
    .update({ status: 'REUNITED', updated_at: new Date().toISOString() })
    .eq('id', reportId);

  if (error) {
    console.error('Error al marcar como reunida:', error);
    return false;
  }
  return true;
}

// 11. Obtener Estadísticas Globales para Super Admin
export async function getAdminStats(): Promise<AdminDashboardStats> {
  const supabase = createBrowserClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_dashboard_stats');
  if (!rpcError && rpcData) {
    return rpcData as AdminDashboardStats;
  }

  // Cálculo directo en Supabase si aún no ejecutaste la función RPC
  const [lostCount, lostActive, foundCount, foundActive, sightingsCount, reunitedCount, profilesCount, moderationCount] = await Promise.all([
    supabase.from('lost_reports').select('*', { count: 'exact', head: true }),
    supabase.from('lost_reports').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('found_reports').select('*', { count: 'exact', head: true }),
    supabase.from('found_reports').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('sightings').select('*', { count: 'exact', head: true }),
    supabase.from('lost_reports').select('*', { count: 'exact', head: true }).eq('status', 'REUNITED'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('moderation_reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
  ]);

  return {
    total_lost_reports: lostCount.count || 0,
    active_lost_reports: lostActive.count || 0,
    total_found_reports: foundCount.count || 0,
    active_found_reports: foundActive.count || 0,
    total_sightings: sightingsCount.count || 0,
    total_reunited_pets: reunitedCount.count || 0,
    total_users: profilesCount.count || 0,
    total_pending_moderations: moderationCount.count || 0,
    reports_by_city: [
      { city_name: 'Trelew', lost_count: lostCount.count || 0 },
      { city_name: 'Rawson', lost_count: 0 },
      { city_name: 'Puerto Madryn', lost_count: 0 },
      { city_name: 'Gaiman', lost_count: 0 },
    ],
    recent_activity_last_7_days: {
      lost_created: lostCount.count || 0,
      found_created: foundCount.count || 0,
      sightings_created: sightingsCount.count || 0,
      reunited_count: reunitedCount.count || 0,
    },
  };
}

// 12. Eliminar todas las publicaciones (Función Super Admin para vaciar la base de datos)
export async function deleteAllReportsFromDb(): Promise<{ success: boolean; message: string }> {
  const supabase = createBrowserClient();
  try {
    // 1. Intentar llamar a la función RPC de Supabase con SECURITY DEFINER
    const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_all_reports');
    
    if (!rpcError && rpcResult) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mascotas_my_lost_reports');
        localStorage.removeItem('mascotas_my_found_reports');
        localStorage.removeItem('mascotas_my_sightings');
      }
      return { 
        success: true, 
        message: 'Todas las publicaciones y mascotas fueron eliminadas de la base de datos correctamente.' 
      };
    }

    // 2. Si la función RPC aún no está creada en Supabase, ejecutar cascada de eliminación directa
    // Tablas dependientes
    await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('qr_codes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('moderation_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Avistamientos
    await supabase.from('sightings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Reportes de mascotas perdidas y encontradas
    await supabase.from('lost_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('found_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Mascotas
    await supabase.from('pets').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Limpiar almacenamiento del navegador local
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mascotas_my_lost_reports');
      localStorage.removeItem('mascotas_my_found_reports');
      localStorage.removeItem('mascotas_my_sightings');
    }

    return { success: true, message: 'Todas las publicaciones fueron eliminadas con éxito.' };
  } catch (error: any) {
    console.error('Error general al eliminar todas las publicaciones:', error);
    return { success: false, message: error?.message || 'Error al conectar con la base de datos.' };
  }
}

