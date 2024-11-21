import { ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle } from '@angular/router';

interface RouteData {
  reuseRoute?: boolean;
}

export class CustomReuseStrategy implements RouteReuseStrategy {
  storedHandles: { [key: string]: DetachedRouteHandle } = {};

  // Check if the route should be cached based on the reuseRoute flag
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Cast route.data to the custom RouteData interface
    return (route.data as RouteData).reuseRoute || false; 
  }

  // Store the route's detached handle if reuseRoute is true
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const id = this.createIdentifier(route);
    if ((route.data as RouteData).reuseRoute) {
      this.storedHandles[id] = handle;
    }
  }

  // Check if the route should be re-attached
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const id = this.createIdentifier(route);
    const handle = this.storedHandles[id];
    return !!route.routeConfig && !!handle;
  }

  // Retrieve the stored route handle for re-attaching
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const id = this.createIdentifier(route);
    if (!route.routeConfig || !this.storedHandles[id]) {
      return null; // Now TypeScript allows 'null' to be returned
    }
    return this.storedHandles[id];
  }

  // Compare the route configurations to decide whether to reuse the route
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // Generate a unique identifier for each route based on the route's path
  private createIdentifier(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot.map(segment => segment.url.join('/')).join('/');
  }
}
