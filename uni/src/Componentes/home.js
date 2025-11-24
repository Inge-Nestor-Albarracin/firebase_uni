export default async function mostrarHome() {
  const appContainer = document.getElementById("app");
  
  // Si ya existe el nav, mantenerlo y limpiar solo el contenido
  const existingNav = document.querySelector('.main-nav');
  appContainer.innerHTML = '';
  if (existingNav) {
    appContainer.appendChild(existingNav);
  }
  
  const content = document.createElement('div');
  content.className = 'home-content';
  content.innerHTML = '<h2>Cargando proyectos...</h2>';
  appContainer.appendChild(content);

  try {
    const response = await fetch("https://diaztibata.github.io/sanagustin/json/miercoles-avanzada.json");
    const proyectos = await response.json();

    content.innerHTML = '<h2>📱 Proyectos del Curso</h2>';
    
    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    
    proyectos.forEach((proyecto) => {
      const card = document.createElement("div");
      card.classList.add("project-card");
      card.innerHTML = `
        <img src="${proyecto.icono}" alt="Icono de ${proyecto.nombreapp}" class="project-icon">
        <div class="project-info">
          <h3>${proyecto.nombreapp}</h3>
          <p class="project-description">${proyecto.descripcion}</p>
          <p><strong>👥 Integrantes:</strong> ${proyecto.integrantes.join(", ")}</p>
          <p><strong>📚 Actividad:</strong> ${proyecto.actividad}</p>
          <a href="${proyecto.url}" target="_blank" class="project-link">🔗 Ver proyecto</a>
        </div>
      `;
      grid.appendChild(card);
    });
    
    content.appendChild(grid);
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    content.innerHTML = `
      <div class="error-message">
        <p>❌ Error al cargar los proyectos</p>
        <small>${error.message}</small>
      </div>
    `;
  }
}