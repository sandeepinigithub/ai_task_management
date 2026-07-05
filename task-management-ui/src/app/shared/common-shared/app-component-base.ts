import { Component, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { PrimengTableHelper } from '../helpers/PrimengTableHelper';
import { DateUtil } from '../utils/dateUtil';
import { RoleActionGrid } from '../../accounts/auth/role-action-grid';

@Component({
    template: ``,
})
export abstract class AppComponentBase implements OnDestroy {
    protected _activatedRoute: ActivatedRoute;
    protected _router: Router;
    protected destroy$ = new Subject<void>();
    protected _messageService: MessageService

    primengTableHelper: PrimengTableHelper;
    dateUtil: DateUtil

    id: string | null = null;
    userDetails
    queryParams: any = {}; // Store query parameters
    isSubmitLoader: boolean = false;


    constructor(injector: Injector) {
        this._activatedRoute = injector.get(ActivatedRoute);
        this._router = injector.get(Router);
        this._messageService = injector.get(MessageService)

        this.primengTableHelper = new PrimengTableHelper();
        this.dateUtil = new DateUtil();

        // Subscribe to route parameters safely
        this._activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.id = params.get('id');
        });
        this.userDetails = sessionStorage.getItem("userDetails") != undefined ? JSON.parse(sessionStorage.getItem("userDetails") || "") : {}

        // Subscribe to query parameters on every page
        this._activatedRoute.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
            this.queryParams = {};
            queryParams.keys.forEach(key => {
                this.queryParams[key] = queryParams.get(key);
            });
        });
    }

    getActionPermissions(module: string): string[] {
        return RoleActionGrid[this.userDetails?.role]?.[module] || [];
    }

    /**
     * Navigate to a specific path
     */
    routerNavigate(path: string): void {
        this._router.navigate([`/${path}`]);
    }

    /**
     * Cleanup to prevent memory leaks
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
