import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';

@Injectable({ providedIn: 'root' })
export class AppNavigationService {
    constructor(
    ) { }

    /**
     * Returns true when the current user is allowed to see the menu item.
     * - Empty permissionName  → visible to everyone.
     * - Non-empty permissionName → must contain the user's role (comma-separated list).
     *   Supported roles: manager, teamlead, employee
     */
    hasPermission(permissionName: string): boolean {
        if (!permissionName) return true;
        const role = JSON.parse(sessionStorage.getItem('userDetails') ?? '{}').role;
        if (!role) return false;
        return permissionName.split('.').map(r => r.trim()).includes(role);
    }

    getMenu(): AppMenu {
        const allItems: AppMenuItem[] = [
            new AppMenuItem('Dashboard', '', 'pi pi-home', '/portal/dashboard'),
            new AppMenuItem('Task Management', '', 'pi pi-list me-1', '', [],
                [
                    new AppMenuItem('Tasks', '', '', '/portal/task-management/tasks'),
                ]
            ),
            new AppMenuItem('User Management', 'manager', 'pi pi-user me-1', '', [],
                [
                    new AppMenuItem('Users', 'manager', '', '/portal/user-management/users'),
                ]
            ),
        ];

        const filtered = allItems.filter(item => this.hasPermission(item.permissionName));
        return new AppMenu('MainMenu', 'MainMenu', filtered);
    }


    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach((menuItem) => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach((subMenu) => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}

