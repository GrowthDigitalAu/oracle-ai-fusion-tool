const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const OrganizationUser = require('./OrganizationUser');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  organization_id: {
    type: DataTypes.BIGINT,
    allowNull: true, // SQL didn't specify NOT NULL, but usually it is. Keeping flexible based on input.
    references: {
      model: Organization,
      key: 'organization_id',
    },
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'REPORT/PROJECT/REPORT_ASSET/etc',
  },
  entity_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'CREATE/UPDATE/DELETE/APPROVE/REJECT',
  },
  changed_by: {
    type: DataTypes.BIGINT,
    references: {
      model: OrganizationUser,
      key: 'id',
    },
  },
  change_data: {
    type: DataTypes.JSONB,
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
  tableName: 'audit_log',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

// Relationships
AuditLog.belongsTo(Organization, { foreignKey: 'organization_id' });
AuditLog.belongsTo(OrganizationUser, { foreignKey: 'changed_by', as: 'Actor' });

module.exports = AuditLog;
