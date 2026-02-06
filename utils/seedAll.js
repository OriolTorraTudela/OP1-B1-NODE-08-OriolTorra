const seedPermissions = require('./seedPermissions');
const seedRoles = require('./seedRoles');

/**
 * seedAll
 * - Idempotent seeding for permissions and roles.
 */
module.exports = async function seedAll() {
  await seedPermissions();
  await seedRoles();
};
