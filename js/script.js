// ====== PRELOADER ======
window.addEventListener('load', () => {
  // Agregar clase 'loaded' para ocultar preloader
  document.body.classList.add('loaded');
});

// ====== Inicializar AOS (animaciones scroll) ======
AOS.init({ duration: 800, once: true });

// ====== FILTROS DE PRODUCTOS ======
// DESHABILITADO: Funcionalidad movida a main.js para evitar conflictos
/*
const filterBtns = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".card");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;

    cards.forEach(card => {
      if(category === "all" || card.dataset.category === category){
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });

    // Activar visualmente el botón seleccionado
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});
*/

// ====== MODALES ======
const nequiModal = document.getElementById('nequiModal');
const nequiBtn = document.getElementById('btn-nequi');
const closeModal = document.getElementById('closeModal');

const bancoModal = document.getElementById('bancoModal');
const btnBanco = document.getElementById('btn-bancolombia');
const closeBanco = document.getElementById('closeBanco');

// Modal Nequi
if(nequiBtn && nequiModal && closeModal){
  nequiBtn.addEventListener('click', () => {
    nequiModal.style.display = 'flex';
  });
  closeModal.addEventListener('click', () => {
    nequiModal.style.display = 'none';
  });
}

// Modal Bancolombia
if(btnBanco && bancoModal && closeBanco){
  btnBanco.addEventListener('click', () => {
    bancoModal.style.display = 'flex';
  });
  closeBanco.addEventListener('click', () => {
    bancoModal.style.display = 'none';
  });
}

// Cerrar modales si clic fuera de ellos
window.addEventListener('click', (e) => {
  if(e.target === nequiModal) nequiModal.style.display = 'none';
  if(e.target === bancoModal) bancoModal.style.display = 'none';
});

// ====== ANIMACION BOTONES FLOTANTES ======
const buttons = document.querySelectorAll('.floating-btn');

setInterval(() => {
  buttons.forEach((btn, index) => {
    setTimeout(() => {
      btn.classList.add('shake');
      setTimeout(() => {
        btn.classList.remove('shake');
      }, 600);
    }, index * 500); // desfase entre botones
  });
}, 8000); // cada 8 segundos
