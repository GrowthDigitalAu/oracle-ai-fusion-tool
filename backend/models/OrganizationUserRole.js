const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const OrganizationUser = require('./OrganizationUser');
const Role = require('./Role');

const OrganizationUserRole = sequelize.define('OrganizationUserRole', {
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
  organization_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: OrganizationUser,
      key: 'id',
    },
    onDelete: 'CASCADE',
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
  tableName: 'organization_user_roles',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['organization_user_id', 'role_id'],
    },
  ],
});

// Relationships
OrganizationUser.hasMany(OrganizationUserRole, { foreignKey: 'organization_user_id', onDelete: 'CASCADE' });
OrganizationUserRole.belongsTo(OrganizationUser, { foreignKey: 'organization_user_id' });

Role.hasMany(OrganizationUserRole, { foreignKey: 'role_id', onDelete: 'CASCADE' });
OrganizationUserRole.belongsTo(Role, { foreignKey: 'role_id' });

Organization.hasMany(OrganizationUserRole, { foreignKey: 'organization_id' });
OrganizationUserRole.belongsTo(Organization, { foreignKey: 'organization_id' });

module.exports = OrganizationUserRole;
