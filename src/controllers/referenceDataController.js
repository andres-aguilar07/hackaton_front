import { supabase } from '../lib/supabaseClient';

export const getQuirofanos = async () => {
  try {
    const { data, error } = await supabase
      .from('quirofanos')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getTiposCirugia = async () => {
  try {
    const { data, error } = await supabase
      .from('tipos_cirugia')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPersonalMedico = async (rol) => {
  try {
    const query = supabase
      .from('personal_medico')
      .select('id, nombre, rol')
      .eq('activo', true);
    
    if (rol) {
      query.eq('rol', rol);
    }
    
    const { data, error } = await query.order('nombre', { ascending: true });
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getCirujanosPrincipales = () => getPersonalMedico('cirujano_principal');
export const getAuxiliares = () => getPersonalMedico('auxiliar');
export const getAnestesiologos = () => getPersonalMedico('anestesiologo');
export const getInstrumentadores = () => getPersonalMedico('instrumentador');

export const getPacientes = async () => {
  try {
    const { data, error } = await supabase
      .from('pacientes')
      .select('id, nombre, cedula')
      .order('nombre', { ascending: true });
    
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}; 