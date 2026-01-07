// Configuración de variables de entorno para cliente
(function() {
  'use strict';
  
  // Variables de entorno inyectadas por Vercel
  const ENV_CONFIG = {
    VITE_SUPABASE_URL: '{{VITE_SUPABASE_URL}}',
    VITE_SUPABASE_ANON_KEY: '{{VITE_SUPABASE_ANON_KEY}}'
  };
  
  // Hacer disponible globalmente
  if (typeof window !== 'undefined') {
    window.__ENV__ = {};
    
    // Procesar variables de entorno
    Object.keys(ENV_CONFIG).forEach(key => {
      const value = ENV_CONFIG[key];
      // Si la variable no fue reemplazada por Vercel, usar fallback
      if (value.startsWith('{{') && value.endsWith('}}')) {
        // Fallback para desarrollo local
        switch(key) {
          case 'VITE_SUPABASE_URL':
            window.__ENV__[key] = 'https://gvipaylnkprcfpwhzbod.supabase.co';
            break;
          case 'VITE_SUPABASE_ANON_KEY':
            window.__ENV__[key] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aXBheWxua3ByY2Zwd2h6Ym9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDI5MzgsImV4cCI6MjA4MzMxODkzOH0.vTL7IjpiFvLz9bjU0iYHY8hNWWZHuJgpEmrvoOtPsR0';
            break;
          default:
            window.__ENV__[key] = '';
        }
      } else {
        window.__ENV__[key] = value;
      }
    });
    
    console.log('🌍 Variables de entorno cargadas:', Object.keys(window.__ENV__));
  }
})();