// ====== THREE.JS: Escena, cámara y modelo 3D ======

let scene, camera, renderer, loader, chessPiece;
let darkTheme = true;

function init3DScene() {
  scene = new THREE.Scene();
  scene.background = null;
  
  const container = document.getElementById('scene-container');
  const loaderContainer = container.querySelector('.loader');
  
  // Configuración de cámara más ajustada
  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 4); // Posición ajustada
  
  renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  precision: 'mediump' 
});
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Luces ajustadas para ambos temas
  const ambientLight = new THREE.AmbientLight(0xffffff, darkTheme ? 0.5 : 0.8);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, darkTheme ? 0.8 : 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  
  loader = new THREE.GLTFLoader();
  loader.load(
    'models/kart.glb',
    (gltf) => {
      chessPiece = gltf.scene;
      chessPiece.position.set(0, 0.5, -0.99); // Y-axis reducido
      chessPiece.scale.set(3, 3, 3); // Escala proporcional
      
      // Eliminar loader
      if(loaderContainer) loaderContainer.remove();
      
      // Ajustar materiales para el tema actual
      chessPiece.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(darkTheme ? 0xffffff : 0x333333);
        }
      });
      
      scene.add(chessPiece);
    },
    undefined,
    (error) => console.error('Error al cargar el modelo:', error)
  );
}

function animate() {
  requestAnimationFrame(animate);
  if (chessPiece) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    chessPiece.rotation.y += isMobile ? 0.002 : 0.005; // Velocidad reducida
  }
  renderer.render(scene, camera);
}

// ====== TEMA OSCURO/CLARO ======
function toggleTheme() {
  darkTheme = !darkTheme;
  document.body.classList.toggle('dark-theme', darkTheme);
  document.body.classList.toggle('light-theme', !darkTheme);
  
  // Actualizar iconos y colores
  const themeIcon = document.querySelector('#toggle-theme i');
  themeIcon.classList.toggle('fa-moon', darkTheme);
  themeIcon.classList.toggle('fa-sun', !darkTheme);
  
  // Actualizar colores 3D
  if (chessPiece) {
    chessPiece.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(darkTheme ? 0xffffff : 0x333333);
      }
    });
  }
  
  // Actualizar variables CSS
  const root = document.documentElement;
  root.style.setProperty('--social-icon', darkTheme ? '#fff' : '#111');
  root.style.setProperty('--text-primary', darkTheme ? '#fff' : '#111');
  root.style.setProperty('--bg-primary', darkTheme ? '#111' : '#fff');
  
  localStorage.setItem('theme', darkTheme ? 'dark' : 'light');
}

// ====== TEXTO ROTATORIO (Actualizado para nueva ubicación) ======
const studies = [
  { en: 'Systems Technician', es: 'Técnico en sistemas' },
  { en: 'Criminalistics (Forensic Science)', es: 'Criminalística (Ciencias forenses)' },
  { en: 'Electronics Technician', es: 'Técnico en electrónica' }
];

function initStudiesText() {
  let currentIndex = 0;
  const textElement = document.getElementById('studies-text');
  

  // Función de transición mejorada
  const updateText = () => {
    textElement.style.opacity = 0;
    setTimeout(() => {
      const study = studies[currentIndex];
      textElement.textContent = `${study.es} / ${study.en}`; // Mostrar ambos idiomas
      textElement.style.color = darkTheme ? '#fff' : '#111';
      textElement.style.opacity = 1;
      currentIndex = (currentIndex + 1) % studies.length;
    }, 500); // Tiempo de fade
  };
  
  // Iniciar ciclo
  updateText();
  setInterval(updateText, 3000); // Cambia cada 3 segundos
}


// ====== OBSERVER Y CARRUSELES ======
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}
function initCarousels() {
  // Lazy Load Observer (fuera del evento click)
  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        lazyLoadObserver.unobserve(img);
      }
    });
  });
  document.querySelectorAll('.tile-img[data-src]').forEach(img => {
    lazyLoadObserver.observe(img);
  });

  // Control del carrusel
  document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
      const targetId = arrow.dataset.target;
      const carousel = document.getElementById(targetId);
      const scrollAmount = carousel.clientWidth * 0.5;
      
      carousel.scrollBy({
        left: arrow.classList.contains('left-arrow') ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    });
  });
}
// script.js - Modificar handleNavbarScroll()
function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 0);
        ticking = false;
      });
      ticking = true;
    }
  });
}
// ====== INICIALIZACIÓN ======
document.addEventListener('DOMContentLoaded', () => {
  handleNavbarScroll();
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.replace('dark-theme', 'light-theme');
    darkTheme = false;
  }
  initMobileMenu(); // ← Inicializar siempre

  
  init3DScene();
  animate();
  initStudiesText();
  initScrollAnimations();
  initCarousels();
  
  // Configurar botón de tema
  document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
  
  // Ajustar colores iniciales
  const root = document.documentElement;
  root.style.setProperty('--social-icon', darkTheme ? '#fff' : '#111');
  root.style.setProperty('--text-primary', darkTheme ? '#fff' : '#111');
  root.style.setProperty('--bg-primary', darkTheme ? '#111' : '#fff');
});

// Resize handler
window.addEventListener('resize', () => {
  const container = document.getElementById('scene-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // Cerrar menú al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-links')) {
      navLinks.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
}
