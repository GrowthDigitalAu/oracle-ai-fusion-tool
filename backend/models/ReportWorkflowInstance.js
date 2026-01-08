const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Report = require('./Report');

const ReportWorkflowInstance = sequelize.define('ReportWorkflowInstance', {
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
  report_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Report,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  version_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Ties to report_versions.version_number',
  },
  workflow_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    // References approval_workflows(id) - table doesn't exist yet
  },
  current_step_order: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'in_progress',
    // in_progress/approved/rejected/cancelled
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
  tableName: 'report_workflow_instances',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

// Relationships
ReportWorkflowInstance.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportWorkflowInstance.belongsTo(Report, { foreignKey: 'report_id' });

Report.hasMany(ReportWorkflowInstance, { foreignKey: 'report_id' });

module.exports = ReportWorkflowInstance;
