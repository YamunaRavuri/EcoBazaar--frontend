import { CanActivateFn } from "@angular/router";
import { inject, Inject } from "@angular/core";
import { Router } from "@angular/router";

export const RoleGuard:CanActivateFn=(route)=>{
    const router = inject(Router);
    const role = localStorage.getItem('role');
    const allowedRoles = route.data?.['roles'] as string[]||[];

    if(role&&allowedRoles.includes(role)){
        return true;
    }

    router.navigate(['/']);
    return false;
}