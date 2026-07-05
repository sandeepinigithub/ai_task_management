export const RolePermissions: { [role: string]: string[] } = {
    manager: [
        "Portal.Dashboard",
        "Portal.TaskManagement.Tasks",
        "Portal.UserManagement.Users",
    ],
    teamlead: [
        "Portal.Dashboard",
        "Portal.TaskManagement.Tasks",
    ],
    employee: [
        "Portal.Dashboard",
        "Portal.TaskManagement.Tasks",
    ],
};
