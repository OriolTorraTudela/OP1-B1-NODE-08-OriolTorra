const Permission = require('../models/Permission');

/**
 * Creates default system permissions if missing.
 */
module.exports = async function seedPermissions() {
  const systemPermissions = [
    { name: 'tasks:create', description: 'Crear tasques', category: 'tasks' },
    { name: 'tasks:read', description: 'Veure tasques', category: 'tasks' },
    { name: 'tasks:update', description: 'Editar tasques', category: 'tasks' },
    { name: 'tasks:delete', description: 'Eliminar tasques', category: 'tasks' },

    { name: 'users:manage', description: 'Gestionar usuaris', category: 'users' },
    { name: 'users:read', description: 'Veure usuaris', category: 'users' },

    { name: 'roles:manage', description: 'Gestionar rols', category: 'roles' },
    { name: 'roles:read', description: 'Veure rols', category: 'roles' },

    { name: 'permissions:manage', description: 'Gestionar permisos', category: 'permissions' },
    { name: 'permissions:read', description: 'Veure permisos', category: 'permissions' },

    { name: 'audit:read', description: 'Veure auditoria', category: 'audit' },

    { name: 'reports:view', description: 'Veure informes', category: 'reports' },
    { name: 'reports:export', description: 'Exportar informes', category: 'reports' }
  ];

  for (const p of systemPermissions) {
    const exists = await Permission.findOne({ name: p.name });
    if (!exists) {
      await Permission.create({ ...p, isSystemPermission: true });
    }
  }
};
