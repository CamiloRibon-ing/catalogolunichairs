// Configuración simplificada para Vercel
(function() {
  'use strict';
  
  // Para Vercel, usar directamente las credenciales como fallback por ahora
  if (typeof window !== 'undefined') {
    window.__ENV__ = {
      'VITE_SUPABASE_URL': 'https://gvipaylnkprcfpwhzbod.supabase.co',
      'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2aXBheWxua3ByY2Zwd2h6Ym9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDI5MzgsImV4cCI6MjA4MzMxODkzOH0.vTL7IjpiFvLz9bjU0iYHY8hNWWZHuJgpEmrvoOtPsR0'
    };
    console.log('🌍 Variables de entorno cargadas para producción');
  }
})();