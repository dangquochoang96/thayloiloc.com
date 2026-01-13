export class Router {
  constructor(routes, rootElementId = 'app') {
    this.routes = routes;
    this.rootElement = document.getElementById(rootElementId);
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  async handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    
    // Handle dynamic routes (e.g., /booking-detail/123)
    let route = this.routes[hash];
    
    if (!route) {
      // Try to match dynamic routes
      const pathParts = hash.split('/');
      const basePath = '/' + pathParts[1]; // e.g., /booking-detail
      
      if (this.routes[basePath]) {
        route = this.routes[basePath];
      } else {
        route = this.routes['*'];
      }
    }

    if (route) {
      this.rootElement.innerHTML = ''; // Clear previous content
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const content = await route.render();
      if (typeof content === 'string') {
        this.rootElement.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.rootElement.appendChild(content);
      }
      
      if (route.afterRender) {
        route.afterRender(); 
      }
    } else {
      this.rootElement.innerHTML = '<h1>404 Not Found</h1>';
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}
