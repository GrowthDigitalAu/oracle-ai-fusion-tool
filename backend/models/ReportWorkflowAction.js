const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const OrganizationUser = require('./OrganizationUser');
const ReportWorkflowInstance = require('./ReportWorkflowInstance');
// const ApprovalWorkflowStep = require('./ApprovalWorkflowStep'); // Model not available yet

const ReportWorkflowAction = sequelize.define('ReportWorkflowAction', {
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
  workflow_instance_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: ReportWorkflowInstance,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  step_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    // references: {
    //   model: ApprovalWorkflowStep,
    //   key: 'id',
    // },
    comment: 'References approval_workflow_steps(id)',
  },
  approver_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: OrganizationUser,
      key: 'id',
    },
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'approve/reject/request_changes',
  },
  comment: {
    type: DataTypes.TEXT,
  },
  acted_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
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
  tableName: 'report_workflow_actions',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

// Relationships
ReportWorkflowAction.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportWorkflowAction.belongsTo(ReportWorkflowInstance, { foreignKey: 'workflow_instance_id' });
ReportWorkflowAction.belongsTo(OrganizationUser, { foreignKey: 'approver_user_id', as: 'Approver' });
// ReportWorkflowAction.belongsTo(ApprovalWorkflowStep, { foreignKey: 'step_id' });

// Association from Parent
ReportWorkflowInstance.hasMany(ReportWorkflowAction, { foreignKey: 'workflow_instance_id' });

module.exports = ReportWorkflowAction;
