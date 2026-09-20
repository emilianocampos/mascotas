import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reportId } = body;

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json({ error: 'ID de reporte inválido' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Actualizar el estado de la publicación a REUNITED
    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('lost_reports')
      .update({
        status: 'REUNITED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar lost_report a REUNITED:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Archivar avistamientos vinculados para que no sigan en estado pendiente
    try {
      await supabaseAdmin
        .from('sightings')
        .update({ status: 'VERIFIED' })
        .eq('lost_report_id', reportId);
    } catch (sightingErr) {
      console.warn('Aviso al actualizar avistamientos vinculados:', sightingErr);
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Mascota marcada como reunida exitosamente',
    });
  } catch (err: any) {
    console.error('Error en API /api/reports/reunited:', err);
    return NextResponse.json({ error: err?.message || 'Error del servidor' }, { status: 500 });
  }
}
