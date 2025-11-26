import { CanActivateFn } from "@angular/router";
import { inject, Inject } from "@angular/core";
import { Router } from "@angular/router";


export const AuthGuard:CanActivateFn=(route, state)=>{

    const router = inject(Router);
    const token = localStorage.getItem('token');

    if(token){
        return true;
    }

    router.navigate(['/login']);
    return false;
    
};