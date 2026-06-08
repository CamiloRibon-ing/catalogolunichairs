const getEnvVar = (name, fallback) => {
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__[name] || fallback;
  }
  
  return fallback;
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', 'https://gvipaylnkprcfpwhzbod.supabase.co');
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aXBheWxua3ByY2Zwd2h6Ym9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDI5MzgsImV4cCI6MjA4MzMxODkzOH0.vTL7IjpiFvLz9bjU0iYHY8hNWWZHuJgpEmrvoOtPsR0');

// console.log('🚀 Inicializando Supabase Client...');
// console.log('📡 URL:', SUPABASE_URL);
// console.log('🔑 Supabase library disponible:', typeof window.supabase);
// console.log('🌍 Entorno:', typeof window.__ENV__ !== 'undefined' ? 'Producción (Vercel)' : 'Desarrollo');

if (typeof window.supabase === 'undefined') {
  // console.error('❌ Supabase library no está disponible. Verifica que el CDN esté cargado.');
}

let supabaseClient;
try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
  // console.log('✅ Supabase Client creado:', typeof supabaseClient);
} catch (error) {
  // console.error('❌ Error creando Supabase Client:', error);
}

// console.log('🔍 Client details: ...')

if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };

  window.supabaseClient = supabaseClient;
  
  window.testSupabaseConnection = async function() {
    try {
      // console.log('🧪 Probando conexión a Supabase...');
      
      const { data, error } = await supabaseClient
        .from('orders')
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        // console.error('❌ Error de conexión:', error);
        return { success: false, error };
      }
      
      // console.log('✅ Conexión exitosa. Datos:', data);
      return { success: true, data };
    } catch (error) {
      // console.error('❌ Error probando conexión:', error);
      return { success: false, error };
    }
  };
}
