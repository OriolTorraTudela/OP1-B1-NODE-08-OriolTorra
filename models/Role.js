/**
 * Role model
 * - A role is a collection of permissions.
 */
const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true },
  description: { type: String, default: '', trim: true },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  isSystemRole: { type: Boolean, default: false }
}, { timestamps: true });

RoleSchema.methods.addPermission = async function(permissionId) {
  if (!this.permissions.some(p => p.toString() === permissionId.toString())) {
    this.permissions.push(permissionId);
    await this.save();
  }
  return this;
};

RoleSchema.methods.removePermission = async function(permissionId) {
  this.permissions = this.permissions.filter(p => p.toString() !== permissionId.toString());
  await this.save();
  return this;
};

RoleSchema.methods.hasPermission = async function(permissionName) {
  await this.populate('permissions');
  return this.permissions.some(p => p.name === permissionName);
};

module.exports = mongoose.model('Role', RoleSchema);
