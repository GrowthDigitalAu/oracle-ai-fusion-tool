const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Role = require('./Role');
const Permission = require('./Permission');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  organization_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Organization,
      key: 'organization_id',
    },
  },
  role_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Role,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  permission_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Permission,
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.BIGINT,
  },
  updated_by: {
    type: DataTypes.BIGINT,
  },
  deleted_by: {
    type: DataTypes.BIGINT,
  },
  remark: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id'],
    },
  ],
});

// Relationships
Role.hasMany(RolePermission, { foreignKey: 'role_id', onDelete: 'CASCADE' });
RolePermission.belongsTo(Role, { foreignKey: 'role_id' });

Permission.hasMany(RolePermission, { foreignKey: 'permission_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

Organization.hasMany(RolePermission, { foreignKey: 'organization_id' });
RolePermission.belongsTo(Organization, { foreignKey: 'organization_id' });

module.exports = RolePermission;
