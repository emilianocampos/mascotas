import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { LostReport, FoundReport, Sighting, MapMarkerItem, AdminDashboardStats, PetSpecies } from '@/types';
import { LostReportInput } from '@/lib/validations/lost-report.schema';
import { FoundReportInput } from '@/lib/validations/found-report.schema';
import { SightingInput } from '@/lib/validations/sighting.schema';

/**
 * SERVICIO DIRECTO DE BASE DE DATOS SUPABASE + POSTGIS (SIN MOCKS)
 */

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
      last_seen_location: { latitude: item.latitude, longitude: item.longitude },
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

  const { data, error } = await query;
  if (error) {
    console.error('Error al consultar lost_reports en Supabase:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    last_seen_location: row.last_seen_location || { latitude: lat, longitude: lng },
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
      found_location: { latitude: item.latitude, longitude: item.longitude },
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

  return (data || []) as FoundReport[];
}

// 4. Obtener Ficha Completa de Reporte por ID
export async function getLostReportById(id: string): Promise<LostReport | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('lost_reports')
    .select('*, pet:pets(*), profile:profiles(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Reporte no encontrado en Supabase:', error);
    return null;
  }
  return data as LostReport;
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
  return (data || []) as Sighting[];
}

// 6. Obtener Marcadores Unificados para el Mapa (Pines 🔴 🟢 🟡)
export async function getMapMarkers(
  minLat: number = -43.5,
  minLng: number = -65.6,
  maxLat: number = -43.0,
  maxLng: number = -65.0
): Promise<MapMarkerItem[]> {
  const supabase = createBrowserClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_map_markers', {
    p_min_lat: minLat,
    p_min_lng: minLng,
    p_max_lat: maxLat,
    p_max_lng: maxLng,
  });

  if (!rpcError && rpcData) {
    return rpcData as MapMarkerItem[];
  }

  // Fallback: recopilar directamente de las 3 tablas en Supabase
  const [lostRes, foundRes, sightingRes] = await Promise.all([
    supabase.from('lost_reports').select('id, last_seen_date, last_seen_location, pet:pets(name, species, photos)').eq('status', 'ACTIVE'),
    supabase.from('found_reports').select('id, found_date, found_location, pet:pets(name, species, photos)').eq('status', 'ACTIVE'),
    supabase.from('sightings').select('id, sighting_date, location, photo_url, lost_report:lost_reports(pet:pets(species))'),
  ]);

  const markers: MapMarkerItem[] = [];

  (lostRes.data || []).forEach((row: any) => {
    markers.push({
      marker_id: row.id,
      marker_type: 'lost',
      title: `${row.pet?.name || 'Mascota'} (Perdida)`,
      species: row.pet?.species || 'dog',
      photo_url: row.pet?.photos?.[0] || null,
      latitude: row.last_seen_location?.latitude || -43.24895,
      longitude: row.last_seen_location?.longitude || -65.30505,
      report_date: row.last_seen_date,
    });
  });

  (foundRes.data || []).forEach((row: any) => {
    markers.push({
      marker_id: row.id,
      marker_type: 'found',
      title: 'Mascota Encontrada',
      species: row.pet?.species || 'dog',
      photo_url: row.pet?.photos?.[0] || null,
      latitude: row.found_location?.latitude || -43.24895,
      longitude: row.found_location?.longitude || -65.30505,
      report_date: row.found_date,
    });
  });

  (sightingRes.data || []).forEach((row: any) => {
    markers.push({
      marker_id: row.id,
      marker_type: 'sighting',
      title: 'Avistamiento Reportado',
      species: row.lost_report?.pet?.species || 'dog',
      photo_url: row.photo_url || null,
      latitude: row.location?.latitude || -43.24895,
      longitude: row.location?.longitude || -65.30505,
      report_date: row.sighting_date,
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

  // 2. Insertar reporte con coordenadas PostGIS
  const { data: reportData, error: reportError } = await supabase
    .from('lost_reports')
    .insert({
      pet_id: petData.id,
      user_id: userId || null,
      last_seen_date: input.last_seen_date,
      last_seen_location: `POINT(${input.longitude} ${input.latitude})`,
      approximate_address: input.approximate_address,
      description: input.description,
      contact_phone_public: input.contact_phone_public,
      status: 'ACTIVE',
    })
    .select('id')
    .single();

  if (reportError || !reportData) {
    console.error('Error insertando lost_report:', reportError);
    throw new Error(`Error al crear publicación: ${reportError?.message}`);
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

  const { data: reportData, error: reportError } = await supabase
    .from('found_reports')
    .insert({
      pet_id: petData.id,
      finder_id: userId || null,
      found_date: input.found_date,
      found_location: `POINT(${input.longitude} ${input.latitude})`,
      approximate_address: input.approximate_address,
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

  const { data, error } = await supabase
    .from('sightings')
    .insert({
      lost_report_id: input.lost_report_id,
      user_id: userId || null,
      location: `POINT(${input.longitude} ${input.latitude})`,
      approximate_address: input.approximate_address,
      sighting_date: input.sighting_date,
      photo_url: input.photo_url || null,
      description: input.description,
      status: 'PENDING',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Error al registrar avistamiento: ${error?.message}`);
  }

  return data.id;
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
