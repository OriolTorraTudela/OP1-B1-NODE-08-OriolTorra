/**
 * User model 
 * - Adds roles[] reference to Role
 * - Adds helper methods to compute effective permissions
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
}, { timestamps: true });

UserSchema.virtual('fullName').get(function() {
  return this.name;
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

UserSchema.methods.addRole = async function(roleId) {
  if (!this.roles.some(r => r.toString() === roleId.toString())) {
    this.roles.push(roleId);
    await this.save();
  }
  return this;
};

UserSchema.methods.removeRole = async function(roleId) {
  this.roles = this.roles.filter(r => r.toString() !== roleId.toString());
  if (this.roles.length === 0) {
    // never allow 0 roles
    throw new Error('User must have at least one role');
  }
  await this.save();
  return this;
};

UserSchema.methods.getEffectivePermissions = async function() {
  // Populate roles + permissions
  await this.populate({
    path: 'roles',
    populate: { path: 'permissions', model: 'Permission' }
  });

  const permSet = new Set();
  for (const role of this.roles) {
    for (const perm of (role.permissions || [])) {
      permSet.add(perm.name);
    }
  }
  return Array.from(permSet);
};

UserSchema.methods.hasPermission = async function(permissionName) {
  const perms = await this.getEffectivePermissions();
  return perms.includes(permissionName);
};

module.exports = mongoose.model('User', UserSchema);
