import {
    Directive,
    Input,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';

@Directive({
    selector: '[appShowGridAction]',
})
export class ShowGridActionDirective implements OnInit {
    @Input('appShowGridAction') public appShowGridAction: Array<string> = [];
    @Input('appShowGridActionPermissonValue')
    public appShowGridActionPermissonValue: string = '';

    // ============= Example How to use in template ============
    //  <div *appShowGridAction="['add','edit','delete','view'];permissonValue: 'update'"> Hello </div>
    // ============= Example How to use in template ============

    constructor(
        private viewContainerRef: ViewContainerRef,
        private templateRef: TemplateRef<any>
    ) { }

    public ngOnInit() {
        if (
            this.appShowGridAction != undefined &&
            this.appShowGridAction != null &&
            this.appShowGridAction.length > 0 &&
            this.appShowGridAction.findIndex(
                (x) => x == this.appShowGridActionPermissonValue
            ) > -1
        ) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        } else this.viewContainerRef.clear();
    }
}
