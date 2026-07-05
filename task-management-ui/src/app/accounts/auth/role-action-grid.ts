export const RoleActionGrid: {
    [role: string]: { [module: string]: string[] }
} = {
    manager: {
        "Portal.Dashboard": ["view"],
        "Portal.TaskManagement.Tasks": ["add", "edit", "delete", "view", "assign"],
        "Portal.UserManagement.Users": ["add", "edit", "delete", "view"],
    },
    teamlead: {
        "Portal.Dashboard": ["view"],
        "Portal.TaskManagement.Tasks": ["add", "edit", "delete", "view", "assign"],
    },
    employee: {
        "Portal.Dashboard": ["view"],
        "Portal.TaskManagement.Tasks": ["add", "edit", "view"],
    },
};
