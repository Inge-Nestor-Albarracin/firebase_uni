import { db } from '../firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig.js';

export default async function mostrarHome() {
  const appContainer = document.getElementById("app");
  
  const existingNav = document.querySelector('.main-nav');
  appContainer.innerHTML = '';
  if (existingNav) {
    appContainer.appendChild(existingNav);
  }
  
  const content = document.createElement('div');
  content.className = 'home-content';
  content.innerHTML = '<h2>🎓 Cargando universidades de Colombia...</h2>';
  appContainer.appendChild(content);

  try {
    // Cargar universidades
    let universidades = [];
    let usingFallback = false;
    
    try {
      const response = await fetch('http://universities.hipolabs.com/search?country=colombia');
      if (response.ok) {
        universidades = await response.json();
      } else {
        throw new Error('API no disponible');
      }
    } catch (apiError) {
      console.warn('Usando datos de respaldo:', apiError);
      usingFallback = true;
      universidades = getFallbackUniversities();
    }

    content.innerHTML = '';
    
    const header = document.createElement('div');
    header.className = 'universidades-header';
    header.innerHTML = `
      <h1>🏫 Universidades de Colombia</h1>
      <p class="subtitle">${usingFallback ? '📋 Usando datos de demostración' : `Encontradas: ${universidades.length} universidades`}</p>
      <p class="description">Explora las universidades de Colombia y guarda tus favoritas</p>
    `;
    content.appendChild(header);

    // Contenedor principal
    const mainContainer = document.createElement('div');
    mainContainer.className = 'universities-main-container';
    
    // Lista de universidades
    const universitiesList = document.createElement('div');
    universitiesList.className = 'universities-list';
    
    // Sección de favoritas
    const favoritesSection = document.createElement('div');
    favoritesSection.className = 'favorites-section';
    favoritesSection.innerHTML = `
      <h3>⭐ Mis Universidades Favoritas</h3>
      <div class="favorites-list" id="favoritesList"></div>
      <button id="saveFavorites" disabled>💾 Guardar Favoritas en Firebase</button>
    `;

    mainContainer.appendChild(universitiesList);
    mainContainer.appendChild(favoritesSection);
    content.appendChild(mainContainer);

    let favoritas = [];

    // Mostrar universidades
    universidades.slice(0, 25).forEach(universidad => {
      const card = document.createElement('div');
      card.className = 'university-card';
      
      const nombre = universidad.name || 'Universidad Sin Nombre';
      const dominio = universidad.domains?.[0] || 'No disponible';
      const web = universidad.web_pages?.[0] || '';
      
      card.innerHTML = `
        <div class="university-header">
          <h3>${nombre}</h3>
          <span class="university-badge">🎓</span>
        </div>
        <div class="university-info">
          <p class="domain">🌐 <strong>Dominio:</strong> ${dominio}</p>
          <div class="university-actions">
            ${web ? `<a href="${web}" target="_blank" class="web-link">🔗 Visitar sitio web</a>` : '<span class="no-web">🌐 Sin sitio web</span>'}
            <button class="btn-favorite">⭐ Agregar a Favoritas</button>
          </div>
        </div>
      `;
      
      const favoriteBtn = card.querySelector('.btn-favorite');
      favoriteBtn.onclick = () => {
        if (!favoritas.find(fav => fav.name === nombre)) {
          favoritas.push({
            name: nombre,
            domain: dominio,
            web_page: web,
            addedAt: new Date().toLocaleString(),
            timestamp: new Date()
          });
          updateFavorites();
          favoriteBtn.disabled = true;
          favoriteBtn.textContent = '✓ Agregada';
          favoriteBtn.classList.add('added');
        }
      };
      
      universitiesList.appendChild(card);
    });

    function updateFavorites() {
      const favoritesList = document.getElementById('favoritesList');
      const saveBtn = document.getElementById('saveFavorites');
      
      favoritesList.innerHTML = '';
      
      if (favoritas.length === 0) {
        favoritesList.innerHTML = `
          <div class="no-favorites">
            <p>🎯 Aún no tienes universidades favoritas</p>
            <small>Haz clic en "⭐ Agregar a Favoritas" en alguna universidad</small>
          </div>
        `;
      } else {
        // Ordenar por fecha de agregado (más reciente primero)
        favoritas.sort((a, b) => b.timestamp - a.timestamp);
        
        favoritas.forEach((universidad, index) => {
          const item = document.createElement('div');
          item.className = 'favorite-item';
          item.innerHTML = `
            <div class="favorite-info">
              <strong>${universidad.name}</strong>
              <div class="favorite-details">
                <span class="favorite-domain">${universidad.domain}</span>
                <span class="favorite-date">Agregada: ${universidad.addedAt}</span>
              </div>
            </div>
            <button class="btn-remove" data-index="${index}" title="Eliminar de favoritos">🗑️</button>
          `;
          favoritesList.appendChild(item);
        });
      }
      
      saveBtn.disabled = favoritas.length === 0;
      saveBtn.textContent = favoritas.length > 0 
        ? `💾 Guardar ${favoritas.length} Favorita(s) en Firebase` 
        : '💾 Guardar Favoritas en Firebase';
    }

    // Eliminar favoritas
    content.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove')) {
        const index = parseInt(e.target.dataset.index);
        const universidadEliminada = favoritas[index];
        favoritas.splice(index, 1);
        updateFavorites();
        
        // Reactivar botón en la card correspondiente
        document.querySelectorAll('.university-card').forEach(card => {
          const nombre = card.querySelector('h3').textContent;
          if (nombre === universidadEliminada.name) {
            const boton = card.querySelector('.btn-favorite');
            boton.disabled = false;
            boton.textContent = '⭐ Agregar a Favoritas';
            boton.classList.remove('added');
          }
        });
      }
    });

    // Guardar en Firebase
    document.getElementById('saveFavorites').onclick = async () => {
      try {
        const objetoGuardar = {
          fecha: new Date(),
          favoritas: favoritas,
          totalFavoritas: favoritas.length,
          tipo: 'universidades_colombia_favoritas',
          usuario: auth.currentUser?.email || 'anonimo',
          timestamp: new Date()
        };

        await addDoc(collection(db, "universidades_favoritas"), objetoGuardar);
        alert(`✅ ${favoritas.length} universidades guardadas correctamente en Firebase!`);
        
        // Resetear después de guardar
        favoritas = [];
        updateFavorites();
        
        // Reactivar todos los botones
        document.querySelectorAll('.btn-favorite').forEach(boton => {
          boton.disabled = false;
          boton.textContent = '⭐ Agregar a Favoritas';
          boton.classList.remove('added');
        });
        
      } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        alert("❌ Error al guardar en Firebase: " + error.message);
      }
    };

    // Inicializar lista de favoritas
    updateFavorites();

    // Agregar estadísticas
    const stats = document.createElement('div');
    stats.className = 'universities-stats';
    stats.innerHTML = `
      <div class="stat-card">
        <h4>📊 Estadísticas</h4>
        <p>Universidades cargadas: <strong>${universidades.slice(0, 25).length}</strong></p>
        <p>Disponibles en total: <strong>${universidades.length}</strong></p>
      </div>
    `;
    content.appendChild(stats);

  } catch (error) {
    content.innerHTML = `
      <div class="error-message">
        <h3>❌ Error al cargar las universidades</h3>
        <p>${error.message}</p>
        <div class="error-actions">
          <button onclick="location.reload()">🔄 Reintentar</button>
          <button onclick="usarDatosDemo()">📋 Usar Datos de Demo</button>
        </div>
      </div>
    `;
    
    window.usarDatosDemo = () => {
      mostrarHome(); // Se recargará con datos de respaldo
    };
  }
}

// Datos de respaldo
function getFallbackUniversities() {
  return [
    {
      name: "Universidad Nacional de Colombia",
      domains: ["unal.edu.co"],
      web_pages: ["https://unal.edu.co/"]
    },
    {
      name: "Universidad de Los Andes",
      domains: ["uniandes.edu.co"],
      web_pages: ["https://uniandes.edu.co/"]
    },
    {
      name: "Universidad de Antioquia",
      domains: ["udea.edu.co"],
      web_pages: ["https://www.udea.edu.co/"]
    },
    {
      name: "Pontificia Universidad Javeriana",
      domains: ["javeriana.edu.co"],
      web_pages: ["https://www.javeriana.edu.co/"]
    },
    {
      name: "Universidad del Valle",
      domains: ["univalle.edu.co"],
      web_pages: ["https://www.univalle.edu.co/"]
    },
    {
      name: "Universidad Industrial de Santander",
      domains: ["uis.edu.co"],
      web_pages: ["https://www.uis.edu.co/"]
    },
    {
      name: "Universidad del Norte",
      domains: ["uninorte.edu.co"],
      web_pages: ["https://www.uninorte.edu.co/"]
    },
    {
      name: "Universidad Externado de Colombia",
      domains: ["uexternado.edu.co"],
      web_pages: ["https://www.uexternado.edu.co/"]
    },
    {
      name: "Universidad de La Sabana",
      domains: ["unisabana.edu.co"],
      web_pages: ["https://www.unisabana.edu.co/"]
    },
    {
      name: "Universidad EAFIT",
      domains: ["eafit.edu.co"],
      web_pages: ["https://www.eafit.edu.co/"]
    }
  ];
}