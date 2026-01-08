const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');

const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: "e.g. 'REPORT', 'PROJECT'",
  },
  is_default: {
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
  tableName: 'approval_workflows',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

// Relationships
ApprovalWorkflow.belongsTo(Organization, { foreignKey: 'organization_id' });

module.exports = ApprovalWorkflow;
