// src/controllers/pharmacyController.js
import { supabase } from "../lib/supabaseClient";

/**
 * Obtener todos los materiales del inventario
 */
export const getMateriales = async () => {
  const { data, error } = await supabase
    .from("materiales")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener materiales:", error);
    return [];
  }
  return data;
};

/**
 * Obtener notificaciones de materiales con stock bajo u otras alertas
 */
export const getNotificaciones = async () => {
  const { data, error } = await supabase
    .from("notificaciones_farmacia")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener notificaciones:", error);
    return [];
  }
  return data;
};

/**
 * Obtener cirugías programadas para asignación de materiales
 */
export const getCirugiasProgramadas = async () => {
  const { data, error } = await supabase
    .from("cirugias")
    .select(`
      id,
      fecha_programada,
      hora_programada,
      paciente:paciente_id(id, nombre),
      tipo_cirugia:tipo_cirugia_id(id, nombre),
      quirofano:quirofano_id(id, nombre),
      cirujano:cirujano_principal_id(id, nombre),
      soporte_medico:soporte_medico_id(id, nombre),
      prioridad,
      observaciones_previas,
      notas_adicionales
    `)
    .eq("estado", "scheduled")
    .order("fecha_programada", { ascending: true });

  if (error) {
    console.error("Error al obtener cirugías programadas:", error);
    return [];
  }

  // Ensure data is an array before mapping
  return (data || []).map(c => ({
    id: c.id,
    fecha: c.fecha_programada,
    hora: c.hora_programada,
    paciente: c.paciente?.nombre || 'Sin asignar',
    procedimiento: c.tipo_cirugia?.nombre || 'Sin especificar',
    quirofano: c.quirofano?.nombre || 'Sin asignar',
    cirujano: c.cirujano?.nombre || 'Sin asignar',
    soporte: c.soporte_medico?.nombre || 'Sin asignar',
    prioridad: c.prioridad || 'normal',
    observaciones: c.observaciones_previas || '',
    notas: c.notas_adicionales || ''
  }));
};

/**
 * Obtener solicitudes de materiales hechas por quirófano o personal médico
 */
export const getSolicitudesMateriales = async () => {
  const { data, error } = await supabase
    .from("solicitudes_materiales")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al obtener solicitudes de materiales:", error);
    return [];
  }

  return data;
};

/**
 * Obtener cirugías actualmente en curso
 */
export const getCirugiasEnCurso = async () => {
  try {
    const { data: fullData, error: fullError } = await supabase
      .from("cirugias")
      .select(`
        id,
        fecha_programada,
        hora_programada,
        paciente:paciente_id(id, nombre),
        tipo_cirugia:tipo_cirugia_id(id, nombre),
        quirofano:quirofano_id(id, nombre),
        cirujano:cirujano_principal_id(id, nombre),
        soporte_medico:soporte_medico_id(id, nombre),
        prioridad,
        observaciones_previas,
        notas_adicionales
      `)
      .eq("estado", "in_progress");

    if (fullError) {
      console.error("Error al obtener datos completos:", fullError);
      return [];
    }

    // Ensure fullData is an array before mapping
    return (fullData || []).map(c => ({
      id: c.id,
      fecha: c.fecha_programada,
      hora: c.hora_programada,
      paciente: c.paciente?.nombre || 'Sin asignar',
      procedimiento: c.tipo_cirugia?.nombre || 'Sin especificar',
      quirofano: c.quirofano?.nombre || 'Sin asignar',
      cirujano: c.cirujano?.nombre || 'Sin asignar',
      soporte: c.soporte_medico?.nombre || 'Sin asignar',
      prioridad: c.prioridad || 'normal',
      observaciones: c.observaciones_previas || '',
      notas: c.notas_adicionales || '',
      materiales: [] // Add empty materials array as default
    }));
  } catch (error) {
    console.error("Error inesperado:", error);
    return [];
  }
};

/**
 * Crear un nuevo material en el inventario
 */
export const crearMaterial = async (materialData) => {
  try {
    // Validate required fields
    if (!materialData.nombre ) {
      return { error: "El nombre y código son campos requeridos" };
    }


    // Check if material with same code already exists
    try {
      const { data: existingMaterial, error: checkError } = await supabase
        .from("materiales")
        .select("id, codigo")
        .eq("codigo", materialData.codigo)
        .maybeSingle();

      if (checkError) {
        console.error("Error detallado al verificar material:", {
          error: checkError,
          code: checkError.code,
          message: checkError.message,
          details: checkError.details
        });
        return { error: "Error al verificar si el material ya existe" };
      }

      if (existingMaterial) {
        return { error: `Ya existe un material con el código ${materialData.codigo}` };
      }
    } catch (verifyError) {
      console.error("Error en la verificación:", verifyError);
      return { error: "Error al verificar si el material ya existe" };
    }

    // Insert new material
    try {
      const { data, error: insertError } = await supabase
        .from("materiales")
        .insert({
          nombre: materialData.nombre,
          codigo: materialData.codigo,
          stock: materialData.stock,
          stock_minimo: materialData.stock_minimo,
          en_uso: 0,
          descripcion: materialData.descripcion || ''
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error detallado al insertar material:", {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        });
        return { error: "Error al crear el material en la base de datos" };
      }

      return { data };
    } catch (insertError) {
      console.error("Error en la inserción:", insertError);
      return { error: "Error al crear el material" };
    }
  } catch (error) {
    console.error("Error inesperado al crear material:", {
      error,
      materialData
    });
    return { error: "Error inesperado al crear el material" };
  }
};

/**
 * Asignar materiales a una cirugía
 */
export const asignarMaterialesACirugia = async (cirugiaId, materiales) => {
  try {
    // First, verify we have enough stock for all materials
    for (const material of materiales) {
      const { data: stockData, error: stockError } = await supabase
        .from("materiales")
        .select("stock, en_uso")
        .eq("id", material.materialId)
        .single();

      if (stockError) {
        console.error("Error al verificar stock:", stockError);
        return { error: stockError };
      }

      if (!stockData) {
        return { error: `Material con ID ${material.materialId} no encontrado` };
      }

      const disponible = stockData.stock - stockData.en_uso;
      if (disponible < material.cantidad) {
        return { 
          error: `Stock insuficiente para el material ID ${material.materialId}. Disponible: ${disponible}, Solicitado: ${material.cantidad}` 
        };
      }
    }

    // Insert material assignments
    const { data: assignmentData, error: assignmentError } = await supabase
      .from("materiales_cirugia")
      .insert(
        materiales.map(m => ({
          cirugia_id: cirugiaId,
          material_id: m.materialId,
          cantidad: m.cantidad
        }))
      )
      .select();

    if (assignmentError) {
      console.error("Error al asignar materiales:", assignmentError);
      return { error: assignmentError };
    }

    // Update stock en_uso for each material
    for (const material of materiales) {
      const { data: currentData, error: getCurrentError } = await supabase
        .from("materiales")
        .select("en_uso")
        .eq("id", material.materialId)
        .single();

      if (getCurrentError) {
        console.error("Error al obtener datos actuales:", getCurrentError);
        return { error: getCurrentError };
      }

      const newEnUso = (currentData.en_uso || 0) + material.cantidad;

      const { error: updateError } = await supabase
        .from("materiales")
        .update({ en_uso: newEnUso })
        .eq("id", material.materialId);

      if (updateError) {
        console.error("Error al actualizar stock en uso:", updateError);
        return { error: updateError };
      }
    }

    return { data: assignmentData };
  } catch (error) {
    console.error("Error inesperado al asignar materiales:", error);
    return { error };
  }
};
