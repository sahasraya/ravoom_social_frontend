import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
    private handlers: { [key: string]: DetachedRouteHandle } = {};

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.routeConfig?.path === 'group/:groupid';
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
        this.handlers[route.routeConfig?.path!] = handle!;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!this.handlers[route.routeConfig?.path!];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return this.handlers[route.routeConfig?.path!] || null;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}
