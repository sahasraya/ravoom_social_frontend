import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export abstract class BaseRouteReuseStrategy implements RouteReuseStrategy {
  protected storedRoutes = new Map<string, DetachedRouteHandle>(); // To store routes and their cached components

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // Use route data or other conditions to determine if the route should be detached (cached)
    return route.data && route.data['reuseRoute'] ? true : false;
  }

  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    // Store the route and its component for later reuse
    if (route.data && route.data['reuseRoute']) {
      console.log('Storing route:', route.routeConfig?.path);
      this.storedRoutes.set(route.routeConfig?.path!, detachedTree);
    }
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    // Return true if there's a stored component for the route
    return !!route.data && !!this.storedRoutes.get(route.routeConfig?.path!);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    // Retrieve the stored route from the map, if available
    if (route.data && route.data['reuseRoute']) {
      console.log('Retrieving stored route:', route.routeConfig?.path);
      return this.storedRoutes.get(route.routeConfig?.path!) || null;
    }
    return null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    // Prevent re-initialization if the future and current routes are the same
    // This ensures the route is reused based on the path (or other custom logic)
    return future.routeConfig === curr.routeConfig;
  }
}
