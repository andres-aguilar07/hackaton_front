// Importar modelos y dependencias necesarias
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

// ==================== GESTIÓN DE CIRUGÍAS ====================

/**
 * Crear una nueva cirugía
 */
export const createCirugia = async (req, res) => {
  try {
    const {
      paciente_id,
      tipo_cirugia_id,
      quirofano_id,
      cirujano_principal_id,
      instrumentador_id,
      fecha_programada,
      prioridad = 'normal',
      observaciones_previas,
      diagnostico_preoperatorio,
      personal_auxiliar = []
    } = req.body;

    // Validar disponibilidad del quirófano
    const quirofanoOcupado = await prisma.cirugia.findFirst({
      where: {
        quirofano_id,
        fecha_programada: {
          equals: new Date(fecha_programada)
        },
        estado: {
          in: ['programada', 'en_preparacion', 'en_curso']
        }
      }
    });

    if (quirofanoOcupado) {
      return res.status(400).json({
        error: 'El quirófano no está disponible para la fecha y hora seleccionada'
      });
    }

    // Crear la cirugía
    const nuevaCirugia = await prisma.cirugia.create({
      data: {
        paciente_id,
        tipo_cirugia_id,
        quirofano_id,
        cirujano_principal_id,
        instrumentador_id,
        fecha_programada: new Date(fecha_programada),
        prioridad,
        observaciones_previas,
        diagnostico_preoperatorio,
        estado: 'programada',
        personal_auxiliar: {
          create: personal_auxiliar.map(pa => ({
            usuario_id: pa.usuario_id,
            rol_cirugia: pa.rol_cirugia
          }))
        }
      },
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      }
    });

    res.status(201).json(nuevaCirugia);
  } catch (error) {
    console.error('Error al crear cirugía:', error);
    res.status(500).json({
      error: 'Error al crear la cirugía',
      details: error.message
    });
  }
};

/**
 * Obtener todas las cirugías con filtros opcionales
 */
export const getAllCirugias = async (req, res) => {
  try {
    const {
      fecha_inicio,
      fecha_fin,
      estado,
      quirofano_id,
      cirujano_id,
      prioridad
    } = req.query;

    // Construir filtros
    const where = {};
    
    if (fecha_inicio && fecha_fin) {
      where.fecha_programada = {
        gte: new Date(fecha_inicio),
        lte: new Date(fecha_fin)
      };
    }

    if (estado) where.estado = estado;
    if (quirofano_id) where.quirofano_id = parseInt(quirofano_id);
    if (cirujano_id) where.cirujano_principal_id = parseInt(cirujano_id);
    if (prioridad) where.prioridad = prioridad;

    const cirugias = await prisma.cirugia.findMany({
      where,
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      },
      orderBy: {
        fecha_programada: 'asc'
      }
    });

    res.json(cirugias);
  } catch (error) {
    console.error('Error al obtener cirugías:', error);
    res.status(500).json({
      error: 'Error al obtener las cirugías',
      details: error.message
    });
  }
};

/**
 * Obtener detalles de una cirugía específica
 */
export const getCirugiaById = async (req, res) => {
  try {
    const { id } = req.params;

    const cirugia = await prisma.cirugia.findUnique({
      where: { id: parseInt(id) },
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!cirugia) {
      return res.status(404).json({
        error: 'Cirugía no encontrada'
      });
    }

    res.json(cirugia);
  } catch (error) {
    console.error('Error al obtener cirugía:', error);
    res.status(500).json({
      error: 'Error al obtener la cirugía',
      details: error.message
    });
  }
};

/**
 * Actualizar una cirugía existente
 */
export const updateCirugia = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      paciente_id,
      tipo_cirugia_id,
      quirofano_id,
      cirujano_principal_id,
      instrumentador_id,
      fecha_programada,
      prioridad,
      observaciones_previas,
      diagnostico_preoperatorio,
      personal_auxiliar
    } = req.body;

    // Verificar si la cirugía existe
    const cirugiaExistente = await prisma.cirugia.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cirugiaExistente) {
      return res.status(404).json({
        error: 'Cirugía no encontrada'
      });
    }

    // Si se cambia el quirófano o la fecha, validar disponibilidad
    if ((quirofano_id || fecha_programada) && 
        (quirofano_id !== cirugiaExistente.quirofano_id || 
         fecha_programada !== cirugiaExistente.fecha_programada)) {
      const quirofanoOcupado = await prisma.cirugia.findFirst({
        where: {
          id: { not: parseInt(id) },
          quirofano_id: quirofano_id || cirugiaExistente.quirofano_id,
          fecha_programada: {
            equals: new Date(fecha_programada || cirugiaExistente.fecha_programada)
          },
          estado: {
            in: ['programada', 'en_preparacion', 'en_curso']
          }
        }
      });

      if (quirofanoOcupado) {
        return res.status(400).json({
          error: 'El quirófano no está disponible para la fecha y hora seleccionada'
        });
      }
    }

    // Actualizar la cirugía
    const cirugiaActualizada = await prisma.cirugia.update({
      where: { id: parseInt(id) },
      data: {
        paciente_id: paciente_id || undefined,
        tipo_cirugia_id: tipo_cirugia_id || undefined,
        quirofano_id: quirofano_id || undefined,
        cirujano_principal_id: cirujano_principal_id || undefined,
        instrumentador_id: instrumentador_id || undefined,
        fecha_programada: fecha_programada ? new Date(fecha_programada) : undefined,
        prioridad: prioridad || undefined,
        observaciones_previas: observaciones_previas || undefined,
        diagnostico_preoperatorio: diagnostico_preoperatorio || undefined,
        personal_auxiliar: personal_auxiliar ? {
          deleteMany: {},
          create: personal_auxiliar.map(pa => ({
            usuario_id: pa.usuario_id,
            rol_cirugia: pa.rol_cirugia
          }))
        } : undefined
      },
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      }
    });

    res.json(cirugiaActualizada);
  } catch (error) {
    console.error('Error al actualizar cirugía:', error);
    res.status(500).json({
      error: 'Error al actualizar la cirugía',
      details: error.message
    });
  }
};

/**
 * Posponer una cirugía
 */
export const posponerCirugia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nueva_fecha, motivo } = req.body;

    const cirugiaActualizada = await prisma.cirugia.update({
      where: { id: parseInt(id) },
      data: {
        fecha_programada: nueva_fecha ? new Date(nueva_fecha) : undefined,
        estado: 'pospuesta',
        observaciones_previas: motivo ? 
          `[POSPUESTA] ${motivo}\n${cirugiaActualizada.observaciones_previas || ''}` : 
          undefined
      },
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      }
    });

    res.json(cirugiaActualizada);
  } catch (error) {
    console.error('Error al posponer cirugía:', error);
    res.status(500).json({
      error: 'Error al posponer la cirugía',
      details: error.message
    });
  }
};

/**
 * Eliminar (cancelar) una cirugía
 */
export const deleteCirugia = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    // Verificar si la cirugía existe
    const cirugiaExistente = await prisma.cirugia.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cirugiaExistente) {
      return res.status(404).json({
        error: 'Cirugía no encontrada'
      });
    }

    // No permitir eliminar cirugías en curso
    if (cirugiaExistente.estado === 'en_curso') {
      return res.status(400).json({
        error: 'No se puede eliminar una cirugía en curso'
      });
    }

    // Actualizar estado a cancelada antes de eliminar
    await prisma.cirugia.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'cancelada',
        observaciones_previas: motivo ? 
          `[CANCELADA] ${motivo}\n${cirugiaExistente.observaciones_previas || ''}` : 
          undefined
      }
    });

    // Eliminar la cirugía y sus relaciones
    await prisma.cirugia.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Cirugía eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cirugía:', error);
    res.status(500).json({
      error: 'Error al eliminar la cirugía',
      details: error.message
    });
  }
};

// ==================== CONTROL DE ESTADO DE CIRUGÍAS ====================

/**
 * Iniciar una cirugía
 */
export const iniciarCirugia = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la cirugía existe y su estado actual
    const cirugiaExistente = await prisma.cirugia.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cirugiaExistente) {
      return res.status(404).json({
        error: 'Cirugía no encontrada'
      });
    }

    if (!['programada', 'en_preparacion'].includes(cirugiaExistente.estado)) {
      return res.status(400).json({
        error: 'Solo se pueden iniciar cirugías en estado "programada" o "en_preparacion"'
      });
    }

    const cirugiaActualizada = await prisma.cirugia.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'en_curso',
        fecha_inicio: new Date()
      },
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      }
    });

    res.json(cirugiaActualizada);
  } catch (error) {
    console.error('Error al iniciar cirugía:', error);
    res.status(500).json({
      error: 'Error al iniciar la cirugía',
      details: error.message
    });
  }
};

/**
 * Finalizar una cirugía
 */
export const finalizarCirugia = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      observaciones_finales,
      diagnostico_postoperatorio,
      observaciones_cirujano,
      observaciones_anestesiologo
    } = req.body;

    // Verificar si la cirugía existe y su estado actual
    const cirugiaExistente = await prisma.cirugia.findUnique({
      where: { id: parseInt(id) }
    });

    if (!cirugiaExistente) {
      return res.status(404).json({
        error: 'Cirugía no encontrada'
      });
    }

    if (cirugiaExistente.estado !== 'en_curso') {
      return res.status(400).json({
        error: 'Solo se pueden finalizar cirugías en estado "en_curso"'
      });
    }

    const cirugiaActualizada = await prisma.cirugia.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'completada',
        fecha_fin: new Date(),
        observaciones_finales,
        diagnostico_postoperatorio,
        observaciones_cirujano,
        observaciones_anestesiologo
      },
      include: {
        paciente: true,
        tipo_cirugia: true,
        quirofano: true,
        cirujano_principal: true,
        instrumentador: true,
        personal_auxiliar: {
          include: {
            usuario: true
          }
        }
      }
    });

    res.json(cirugiaActualizada);
  } catch (error) {
    console.error('Error al finalizar cirugía:', error);
    res.status(500).json({
      error: 'Error al finalizar la cirugía',
      details: error.message
    });
  }
};

// ==================== GESTIÓN DE RECURSOS ====================

/**
 * Obtener personal médico disponible
 */
export const getPersonalDisponible = async (req, res) => {
  try {
    const { tipo_personal, fecha } = req.query;

    // Obtener cirugías programadas para la fecha
    const cirugiasEnFecha = await prisma.cirugia.findMany({
      where: {
        fecha_programada: {
          gte: new Date(fecha),
          lt: new Date(new Date(fecha).setDate(new Date(fecha).getDate() + 1))
        },
        estado: {
          in: ['programada', 'en_preparacion', 'en_curso']
        }
      },
      select: {
        cirujano_principal_id: true,
        instrumentador_id: true,
        personal_auxiliar: {
          select: {
            usuario_id: true
          }
        }
      }
    });

    // Obtener IDs del personal ocupado
    const personalOcupado = new Set([
      ...cirugiasEnFecha.map(c => c.cirujano_principal_id),
      ...cirugiasEnFecha.map(c => c.instrumentador_id),
      ...cirugiasEnFecha.flatMap(c => c.personal_auxiliar.map(pa => pa.usuario_id))
    ].filter(Boolean));

    // Construir filtro según tipo de personal
    let rolFilter = {};
    switch (tipo_personal) {
      case 'cirujanos':
        rolFilter = { rol: 'CIRUJANO' };
        break;
      case 'instrumentadores':
        rolFilter = { rol: 'INSTRUMENTADOR' };
        break;
      case 'anestesiologos':
        rolFilter = { rol: 'ANESTESIOLOGO' };
        break;
      case 'auxiliares':
        rolFilter = { rol: 'AUXILIAR' };
        break;
    }

    // Obtener personal disponible
    const personalDisponible = await prisma.usuario.findMany({
      where: {
        ...rolFilter,
        activo: true,
        id: {
          notIn: Array.from(personalOcupado)
        }
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        rol: true,
        especialidad: true
      }
    });

    res.json(personalDisponible);
  } catch (error) {
    console.error('Error al obtener personal disponible:', error);
    res.status(500).json({
      error: 'Error al obtener el personal disponible',
      details: error.message
    });
  }
};

/**
 * Obtener quirófanos disponibles
 */
export const getQuirofanosDisponibles = async (req, res) => {
  try {
    const { fecha, hora } = req.query;

    if (!fecha || !hora) {
      return res.status(400).json({
        error: 'Se requiere fecha y hora para consultar disponibilidad'
      });
    }

    const fechaHora = new Date(`${fecha}T${hora}`);

    // Obtener quirófanos ocupados en la fecha y hora especificada
    const quirofanosOcupados = await prisma.cirugia.findMany({
      where: {
        fecha_programada: {
          equals: fechaHora
        },
        estado: {
          in: ['programada', 'en_preparacion', 'en_curso']
        }
      },
      select: {
        quirofano_id: true
      }
    });

    const quirofanosOcupadosIds = quirofanosOcupados.map(q => q.quirofano_id);

    // Obtener todos los quirófanos disponibles
    const quirofanosDisponibles = await prisma.quirofano.findMany({
      where: {
        activo: true,
        id: {
          notIn: quirofanosOcupadosIds
        }
      },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        equipamiento: true
      }
    });

    res.json(quirofanosDisponibles);
  } catch (error) {
    console.error('Error al obtener quirófanos disponibles:', error);
    res.status(500).json({
      error: 'Error al obtener los quirófanos disponibles',
      details: error.message
    });
  }
}; 