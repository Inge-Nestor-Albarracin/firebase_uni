import { db } from '../firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';

export default async function mostrarOriginal() {
  const appContainer = document.getElementById("app");
  
  const existingNav = document.querySelector('.main-nav');
  appContainer.innerHTML = '';
  if (existingNav) {
    appContainer.appendChild(existingNav);
  }
  
  const content = document.createElement('div');
  content.className = 'original-content';
  content.innerHTML = `
    <div class="random-university-container">
      <h2>🎰 ¡Sorpresa Universitaria!</h2>
      <p class="funny-text">"Nosotros escogemos por ti, no te preocupes jajaja"</p>
      <div class="loading">Buscando una universidad especial...</div>
    </div>
  `;
  appContainer.appendChild(content);

  try {
    // Cargar universidades
    let universidades = [];
    try {
      const response = await fetch('http://universities.hipolabs.com/search?country=colombia');
      if (response.ok) {
        universidades = await response.json();
      } else {
        throw new Error('API no disponible');
      }
    } catch (apiError) {
      universidades = getFallbackUniversities();
    }

    // Seleccionar una universidad aleatoria
    const randomIndex = Math.floor(Math.random() * universidades.length);
    const universidadAleatoria = universidades[randomIndex];
    
    const nombre = universidadAleatoria.name || 'Universidad Misteriosa';
    const dominio = universidadAleatoria.domains?.[0] || 'dominio-secreto.edu.co';
    const web = universidadAleatoria.web_pages?.[0] || '';

    content.innerHTML = `
      <div class="random-university-container">
        <h2>🎰 ¡Sorpresa Universitaria!</h2>
        <p class="funny-text">"Nosotros escogemos por ti, no te preocupes jajaja"</p>
        
        <div class="random-card">
          <div class="university-badge">🎓 UNIVERSIDAD SELECCIONADA</div>
          <h3 class="university-name">${nombre}</h3>
          <div class="university-details">
            <p>🌐 <strong>Dominio:</strong> ${dominio}</p>
            ${web ? `<p>🔗 <strong>Sitio web:</strong> <a href="${web}" target="_blank">Visitar página oficial</a></p>` : ''}
          </div>
          <div class="fun-fact">
            <p>💡 <em>¡Esta podría ser tu alma mater! ¿Te animas a guardarla?</em></p>
          </div>
          <button id="saveRandomUniversity" class="save-random-btn">
            💾 Guardar esta Joya en Firebase
          </button>
          <button id="anotherUniversity" class="another-btn">
            🔄 ¿Otra? ¡Dame más sorpresas!
          </button>
        </div>
      </div>
    `;

    // Guardar universidad aleatoria
    document.getElementById('saveRandomUniversity').onclick = async () => {
      try {
        const objetoGuardar = {
          fecha: new Date(),
          universidad_aleatoria: {
            name: nombre,
            domain: dominio,
            web_page: web
          },
          tipo: 'universidad_sorpresa',
          usuario: auth.currentUser?.email || 'anonimo',
          mensaje: '¡Seleccionada automáticamente por nuestro sistema!'
        };

        await addDoc(collection(db, "proyectos"), objetoGuardar);
        alert(`✅ ¡${nombre} guardada en Firebase como tu universidad sorpresa! 🎉`);
        
      } catch (error) {
        console.error("Error al guardar:", error);
        alert("❌ Error al guardar en Firebase: " + error.message);
      }
    };

    // Buscar otra universidad
    document.getElementById('anotherUniversity').onclick = () => {
      mostrarOriginal(); // Recargar para nueva aleatoria
    };

  } catch (error) {
    content.innerHTML = `
      <div class="error-message">
        <h3>❌ ¡Ups! Algo salió mal</h3>
        <p>No pudimos encontrar tu universidad sorpresa</p>
        <p><em>${error.message}</em></p>
        <button onclick="mostrarOriginal()">🔄 Intentar de nuevo</button>
      </div>
    `;
  }
}

function getFallbackUniversities() {
  return [
    {
      name: "Universidad Nacional de Colombia - Sede Bogotá",
      domains: ["unal.edu.co"],
      web_pages: ["https://unal.edu.co/"]
    },
    {
      name: "Universidad de Los Andes - Facultad de Ingeniería", 
      domains: ["uniandes.edu.co"],
      web_pages: ["https://uniandes.edu.co/"]
    },
    {
      name: "Universidad de Antioquia - Campus Central",
      domains: ["udea.edu.co"],
      web_pages: ["https://www.udea.edu.co/"]
    },
    {
      name: "Pontificia Universidad Javeriana - Sede Principal",
      domains: ["javeriana.edu.co"],
      web_pages: ["https://www.javeriana.edu.co/"]
    },
    {
      name: "Universidad del Valle - Cali",
      domains: ["univalle.edu.co"],
      web_pages: ["https://www.univalle.edu.co/"]
    }
  ];
}