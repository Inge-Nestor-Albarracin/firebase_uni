import { auth } from '../src/firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';
import mostrarLogin from './Componentes/login.js';
import mostrarRegistro from './Componentes/registro.js';
import mostrarHome from './Componentes/home.js';
import mostrarOriginal from './Componentes/origina.js';
import './style.css';

// Estado de la aplicación
let currentView = 'login';

// Función para cambiar de vista
function navigateTo(view) {
  currentView = view;
  const app = document.getElementById('app');
  
  switch (view) {
    case 'login':
      mostrarLogin();
      break;
    case 'registro':
      mostrarRegistro();
      break;
    case 'home':
      mostrarHome();
      break;
    case 'original':
      mostrarOriginal();
      break;
    default:
      mostrarLogin();
  }
}

// Crear navegación
function createNav() {
  const nav = document.createElement('nav');
  nav.className = 'main-nav';
  nav.innerHTML = `
    <button id="nav-home">🏠 Home</button>
    <button id="nav-original">🎓 Universidades</button>
    <button id="nav-logout">🚪 Salir</button>
  `;
  
  document.getElementById('app').prepend(nav);
  
  // Event listeners
  document.getElementById('nav-home').addEventListener('click', () => navigateTo('home'));
  document.getElementById('nav-original').addEventListener('click', () => navigateTo('original'));
  document.getElementById('nav-logout').addEventListener('click', () => {
    auth.signOut();
  });
}

// Observador de autenticación
onAuthStateChanged(auth, (user) => {
  const app = document.getElementById('app');
  
  if (user) {
    // Usuario logueado - mostrar navegación y contenido
    if (!document.querySelector('.main-nav')) {
      createNav();
    }
    
    if (currentView === 'login' || currentView === 'registro') {
      navigateTo('home');
    }
  } else {
    // No logueado - limpiar y mostrar login
    app.innerHTML = '';
    navigateTo('login');
  }
});

// Inicializar
navigateTo('login');