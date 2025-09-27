// Inicializar AOS (animaciones scroll)
AOS.init({ duration: 800, once: true });

// Filtros de productos
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


// Preloader
window.addEventListener("load", () => {
  document.getElementById("preloader").style.display = "none";
});






const buttons = document.querySelectorAll('.floating-btn');
const nequiModal = document.getElementById('nequiModal');
const nequiBtn = document.getElementById('btn-nequi');
const closeModal = document.getElementById('closeModal');

// Modal de Nequi
nequiBtn.addEventListener('click', () => {
  nequiModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  nequiModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === nequiModal) {
    nequiModal.style.display = 'none';
  }
});
// ====== Bancolombia ======
const btnBanco = document.getElementById('btn-bancolombia');
const bancoModal = document.getElementById('bancoModal');
const closeBanco = document.getElementById('closeBanco');

btnBanco.addEventListener('click', () => {
  bancoModal.style.display = 'flex';
});
closeBanco.addEventListener('click', () => {
  bancoModal.style.display = 'none';
});

// Cerrar si clic fuera
window.addEventListener('click', (e) => {
  if (e.target === nequiModal) nequiModal.style.display = 'none';
  if (e.target === bancoModal) bancoModal.style.display = 'none';
});

// Animación campana + glow en todos los botones
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