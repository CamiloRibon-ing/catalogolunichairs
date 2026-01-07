async function testSupabaseConnection() {
    console.log('Probando conexión a Supabase...');
  
    const { data, error } = await supabase
      .from('categories')
      .select('*');
  
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
    } else {
      console.log('✅ Supabase conectado correctamente');
      console.table(data);
    }
  }
  
  testSupabaseConnection();
  