const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');

const OrganizationUser = sequelize.define('OrganizationUser', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.TEXT,
  },
  full_name: {
    type: DataTypes.STRING(255),
  },
  job_title: {
    type: DataTypes.STRING(255),
  },
  is_org_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
  tableName: 'organization_users',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['organization_id', 'email'],
    },
    {
      fields: ['organization_id'],
      name: 'idx_org_users_org',
    }
  ]
});

// Define Relationships
Organization.hasMany(OrganizationUser, { foreignKey: 'organization_id' });
OrganizationUser.belongsTo(Organization, { foreignKey: 'organization_id' });

module.exports = OrganizationUser;
