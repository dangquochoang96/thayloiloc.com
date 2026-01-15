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
    const fullHash = window.location.hash.slice(1) || '/';
    
    // Separate path from query params
    const [hash] = fullHash.split('?');
    
    // Handle exact routes first
    let route = this.routes[hash];
    let params = {};
    
    if (!route) {
      // Try to match dynamic routes
      for (const routePath in this.routes) {
        if (routePath.includes(':')) {
          const routeRegex = this.createRouteRegex(routePath);
          const match = hash.match(routeRegex);
          if (match) {
            route = this.routes[routePath];
            params = this.extractParams(routePath, hash);
            break;
          }
        }
      }
      
      // Fallback to old dynamic route handling for backward compatibility
      if (!route) {
        const pathParts = hash.split('/');
        const basePath = '/' + pathParts[1]; // e.g., /booking-detail
        
        if (this.routes[basePath]) {
          route = this.routes[basePath];
        } else {
          route = this.routes['*'];
        }
      }
    }

    if (route) {
      this.rootElement.innerHTML = ''; // Clear previous content
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      const content = await route.render(params);
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

  createRouteRegex(routePath) {
    // Convert route path like '/news/:id' to regex
    const regexPath = routePath.replace(/:[^/]+/g, '([^/]+)');
    return new RegExp(`^${regexPath}$`);
  }

  extractParams(routePath, actualPath) {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');
    const params = {};
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = actualParts[i];
      }
    }
    
    return params;
  }

  navigate(path) {
    window.location.hash = path;
  }
}
