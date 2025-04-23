document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const menuItems = document.querySelectorAll('.sidebar-menu li a');
    
    // Función para abrir el sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
    
    // Función para cerrar el sidebar
    function closeSidebarMenu() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Permitir scroll
    }
    
    // Event listeners
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', openSidebar);
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeSidebarMenu);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebarMenu);
    }
    
    // Activar página y resaltar ítem de menú
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase activa de todos los ítems
            menuItems.forEach(menuItem => {
                menuItem.parentElement.classList.remove('active');
            });
            
            // Agregar clase activa al ítem seleccionado
            this.parentElement.classList.add('active');
            
            // Obtener la página a mostrar
            const pageId = this.getAttribute('data-page');
            
            // Ocultar todas las páginas
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Mostrar la página seleccionada
            document.getElementById(pageId).classList.add('active');
            
            // Cerrar el sidebar en modo móvil
            if (window.innerWidth <= 768) {
                closeSidebarMenu();
            }
        });
    });
    
    // Detección de cambio de tamaño de ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // En desktop, asegurar que el sidebar esté visible
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
