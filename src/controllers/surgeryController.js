// src/controllers/surgeryController.js
import { supabase } from "../lib/supabaseClient";

export const insertSurgery = async (surgeryData) => {
  try {
    // First insert the main surgery record
    const { data: surgeryRecord, error: surgeryError } = await supabase
      .from('cirugias')
      .insert([{
        paciente_id: surgeryData.paciente_id,
        tipo_cirugia_id: surgeryData.tipo_cirugia_id,
        quirofano_id: surgeryData.quirofano_id,
        cirujano_principal_id: surgeryData.cirujano_principal_id,
        soporte_medico_id: surgeryData.soporte_medico_id,
        fecha_programada: surgeryData.date,
        hora_programada: surgeryData.time,
        estado: surgeryData.status || 'scheduled',
        notas_adicionales: surgeryData.notes
      }])
      .select();

    if (surgeryError) throw surgeryError;

    // Insert auxiliary surgeons if any
    if (surgeryData.assistants?.length > 0) {
      const { error: auxError } = await supabase
        .from('cirugia_auxiliares')
        .insert(
          surgeryData.assistants.map(auxId => ({
            cirugia_id: surgeryRecord[0].id,
            personal_id: auxId
          }))
        );
      if (auxError) throw auxError;
    }

    // Insert instrumenters if any
    if (surgeryData.instrumenters?.length > 0) {
      const { error: instError } = await supabase
        .from('cirugia_instrumentadores')
        .insert(
          surgeryData.instrumenters.map(instId => ({
            cirugia_id: surgeryRecord[0].id,
            personal_id: instId
          }))
        );
      if (instError) throw instError;
    }

    return { data: surgeryRecord[0], error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getAllSurgeries = async () => {
  try {
    // First get all surgeries with their basic relations
    const { data: surgeries, error: surgeriesError } = await supabase
      .from('cirugias')
      .select(`
        *,
        paciente:pacientes(id, nombre),
        quirofano:quirofanos(id, nombre),
        tipo_cirugia:tipos_cirugia(id, nombre),
        cirujano_principal:personal_medico!cirugias_cirujano_principal_id_fkey(id, nombre),
        soporte_medico:personal_medico!cirugias_soporte_medico_id_fkey(id, nombre)
      `)
      .order('fecha_programada', { ascending: true });

    if (surgeriesError) throw surgeriesError;

    // For each surgery, get its auxiliares and instrumentadores
    const surgeriesWithDetails = await Promise.all(surgeries.map(async (surgery) => {
      // Get auxiliares
      const { data: auxiliares, error: auxError } = await supabase
        .from('cirugia_auxiliares')
        .select('personal:personal_medico(nombre)')
        .eq('cirugia_id', surgery.id);
      
      if (auxError) throw auxError;

      // Get instrumentadores
      const { data: instrumentadores, error: instError } = await supabase
        .from('cirugia_instrumentadores')
        .select('personal:personal_medico(nombre)')
        .eq('cirugia_id', surgery.id);
      
      if (instError) throw instError;

      // Transform the data to match the frontend expectations
      return {
        id: surgery.id,
        patient: surgery.paciente?.nombre,
        room: surgery.quirofano?.nombre,
        procedure: surgery.tipo_cirugia?.nombre,
        surgeon: surgery.cirujano_principal?.nombre,
        support: surgery.soporte_medico?.nombre,
        assistants: auxiliares?.map(aux => aux.personal.nombre) || [],
        instrumenters: instrumentadores?.map(inst => inst.personal.nombre) || [],
        status: surgery.estado,
        date: surgery.fecha_programada,
        time: surgery.hora_programada,
        notes: surgery.notas_adicionales
      };
    }));

    return { data: surgeriesWithDetails, error: null };
  } catch (error) {
    console.error('Error in getAllSurgeries:', error);
    return { data: null, error };
  }
};

export const updateSurgeryStatus = async (id, newStatus) => {
  try {
    const { data, error } = await supabase
      .from('cirugias')
      .update({ estado: newStatus })
      .eq('id', id)
      .select();

    return { data: data?.[0], error };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteSurgery = async (id) => {
  try {
    // First delete related records
    await supabase.from('cirugia_auxiliares').delete().eq('cirugia_id', id);
    await supabase.from('cirugia_instrumentadores').delete().eq('cirugia_id', id);
    
    // Then delete the main surgery record
    const { data, error } = await supabase
      .from('cirugias')
      .delete()
      .eq('id', id)
      .select();

    return { data: data?.[0], error };
  } catch (error) {
    return { data: null, error };
  }
};
