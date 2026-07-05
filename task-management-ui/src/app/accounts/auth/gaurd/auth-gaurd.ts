import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { RolePermissions } from '../role-permission';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  const token = sessionStorage.getItem('token');

  if (!token) {
    router.navigate(['/account/login']);
    return false;
  }

  const userDetails = JSON.parse(sessionStorage.getItem('userDetails') ?? '{}');
  const role: string = userDetails?.role ?? '';

  if (!role) {
    router.navigate(['/account/login']);
    return false;
  }

  function toPascalCase(segment: string): string {
    return segment.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('');
  }

  function urlToPermissionKey(url: string): string {
    const segments = url.split('?')[0].split('/').filter(s => s.length > 0).slice(0, 3);
    return segments.map(toPascalCase).join('.');
  }

  const permissionKey = urlToPermissionKey(state.url);
  const allowedKeys: string[] = RolePermissions[role] ?? [];

  // A URL is allowed when its permission key starts with one of the role's
  // allowed keys — this covers sub-routes like /tasks/:id or /tasks/new
  // without having to list every variant explicitly.
  const hasAccess = allowedKeys.some(key => permissionKey.startsWith(key));

  if (hasAccess) {
    return true;
  }

  // Access denied → redirect to dashboard
  router.navigate(['/portal/dashboard']);
  return false;
};
