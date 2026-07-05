export class AppMenuItem {
    name = '';
    permissionName = '';
    icon = '';
    route = '';
    routeTemplates: string[] = []; // Explicitly set type to string[]
    items: AppMenuItem[];
    external: boolean;
    requiresAuthentication: boolean;
    featureDependency: any;
    parameters: {};

    constructor(
        name: string,
        permissionName: string,
        icon: string,
        route: string,
        routeTemplates?: string[],
        items?: AppMenuItem[],
        external?: boolean,
        parameters?: Object,
        featureDependency?: any,
        requiresAuthentication?: boolean
    ) {
        this.name = name;
        this.permissionName = permissionName;
        this.icon = icon;
        this.route = route;
        this.routeTemplates = routeTemplates ?? []; // Use nullish coalescing to default to an empty array
        this.external = external ?? false;
        this.parameters = parameters ?? {};
        this.featureDependency = featureDependency;

        this.items = items ?? [];

        this.requiresAuthentication = this.permissionName ? true : requiresAuthentication ?? false;
    }

}
