const Role = require('../models/Role');
const Permission = require('../models/Permission');

/**
 * Creates default roles:
 * - admin: all permissions (system role)
 * - user: CRUD task permissions (system role)
 * - viewer: tasks:read
 * - editor: tasks CRUD
 */
module.exports = async function seedRoles() {
  const allPerms = await Permission.find();
  const byName = (name) => allPerms.find(p => p.name === name);

  const roleDefs = [
    {
      name: 'admin',
      description: 'Accés total (tots els permisos)',
      isSystemRole: true,
      permissions: allPerms.map(p => p._id)
    },
    {
      name: 'user',
      description: 'Usuari per defecte (tasques pròpies)',
      isSystemRole: true,
      permissions: ['tasks:create','tasks:read','tasks:update','tasks:delete'].map(n => byName(n)?._id).filter(Boolean)
    },
    {
      name: 'viewer',
      description: 'Només lectura',
      isSystemRole: false,
      permissions: ['tasks:read'].map(n => byName(n)?._id).filter(Boolean)
    },
    {
      name: 'editor',
      description: 'CRUD tasques',
      isSystemRole: false,
      permissions: ['tasks:create','tasks:read','tasks:update','tasks:delete'].map(n => byName(n)?._id).filter(Boolean)
    }
  ];

  for (const r of roleDefs) {
    const exists = await Role.findOne({ name: r.name });
    if (!exists) {
      await Role.create(r);
    } else {
      // keep system role flag for admin/user, but ensure permissions exist 
      if (exists.isSystemRole !== r.isSystemRole) {
        exists.isSystemRole = r.isSystemRole;
      }
      if (!exists.permissions || exists.permissions.length === 0) {
        exists.permissions = r.permissions;
      }
      await exists.save();
    }
  }
};
