import { db } from '../firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';

export default async function mostrarOriginal() {
  const appContainer = document.getElementById("app");
  
  // Mantener navegación existente
  const existingNav = document.querySelector('.main-nav');
  appContainer.innerHTML = '';
  if (existingNav) {
    appContainer.appendChild(existingNav);
  }
  
  const content = document.createElement('div');
  content.className = 'original-content';
  content.innerHTML = '<h2>🎓 Cargando universidades de Colombia...</h2>';
  appContainer.appendChild(content);

  try {
    // Intentar cargar desde API
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
    header.className = 'original-header';
    header.innerHTML = `
      <h2>🏫 Universidades de Colombia</h2>
      <p>${usingFallback ? '📋 Usando datos de demostración' : `Encontradas: ${universidades.length} universidades`}</p>
    `;
    content.appendChild(header);

    // Contenedor principal
    const mainContainer = document.createElement('div');
    mainContainer.className = 'universities-container';
    
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

    // Mostrar universidades (máximo 20 para rendimiento)
    universidades.slice(0, 20).forEach(universidad => {
      const card = document.createElement('div');
      card.className = 'university-card';
      
      const nombre = universidad.name || 'Universidad Sin Nombre';
      const dominio = universidad.domains?.[0] || 'No disponible';
      const web = universidad.web_pages?.[0] || '';
      
      card.innerHTML = `
        <h4>${nombre}</h4>
        <p>🌐 ${dominio}</p>
        <div class="university-actions">
          ${web ? `<a href="${web}" target="_blank">🔗 Sitio web</a>` : '<span>🌐 Sin sitio web</span>'}
          <button class="btn-favorite">⭐ Agregar a Favoritas</button>
        </div>
      `;
      
      const favoriteBtn = card.querySelector('.btn-favorite');
      favoriteBtn.onclick = () => {
        if (!favoritas.find(fav => fav.name === nombre)) {
          favoritas.push({
            name: nombre,
            domain: dominio,
            web_page: web,
            addedAt: new Date().toLocaleString()
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
        favoritesList.innerHTML = '<p class="no-favorites">No hay universidades favoritas aún</p>';
      } else {
        favoritas.forEach((universidad, index) => {
          const item = document.createElement('div');
          item.className = 'favorite-item';
          item.innerHTML = `
            <div class="favorite-info">
              <strong>${universidad.name}</strong>
              <br><small>${universidad.domain}</small>
              <br><small>Agregada: ${universidad.addedAt}</small>
            </div>
            <button class="btn-remove" data-index="${index}">🗑️</button>
          `;
          favoritesList.appendChild(item);
        });
      }
      
      saveBtn.disabled = favoritas.length === 0;
      saveBtn.textContent = favoritas.length > 0 
        ? `💾 Guardar ${favoritas.length} Favorita(s)` 
        : '💾 Guardar Favoritas';
    }

    // Eliminar favoritas
    content.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove')) {
        const index = parseInt(e.target.dataset.index);
        const universidadEliminada = favoritas[index];
        favoritas.splice(index, 1);
        updateFavorites();
        
        // Reactivar botón en la card
        document.querySelectorAll('.university-card').forEach(card => {
          const nombre = card.querySelector('h4').textContent;
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
          tipo: 'universidades_colombia',
          usuario: auth.currentUser?.email || 'anonimo'
        };

        await addDoc(collection(db, "proyectos"), objetoGuardar);
        alert(`✅ ${favoritas.length} universidades guardadas en Firebase!`);
        
        // Resetear
        favoritas = [];
        updateFavorites();
        
        // Reactivar todos los botones
        document.querySelectorAll('.btn-favorite').forEach(boton => {
          boton.disabled = false;
          boton.textContent = '⭐ Agregar a Favoritas';
          boton.classList.remove('added');
        });
        
      } catch (error) {
        console.error("Error al guardar:", error);
        alert("❌ Error al guardar en Firebase: " + error.message);
      }
    };

    // Inicializar lista de favoritas
    updateFavorites();

  } catch (error) {
    content.innerHTML = `
      <div class="error-message">
        <h3>❌ Error crítico</h3>
        <p>${error.message}</p>
        <button onclick="location.reload()">🔄 Reintentar</button>
      </div>
    `;
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
    }
  ];
}