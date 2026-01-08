const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Role = require('./Role');
const ApprovalWorkflow = require('./ApprovalWorkflow');

const ApprovalWorkflowStep = sequelize.define('ApprovalWorkflowStep', {
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
  workflow_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: ApprovalWorkflow,
      key: 'id',
    },
    onDelete: 'CASCADE',
    comment: 'References approval_workflows(id)',
  },
  step_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  required_role_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: Role,
      key: 'id',
    },
  },
  required_min_approvals: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
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
  tableName: 'approval_workflow_steps',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['workflow_id', 'step_order'],
      where: {
        deleted_at: null
      }
    }
  ]
});

// Relationships
ApprovalWorkflowStep.belongsTo(Organization, { foreignKey: 'organization_id' });
ApprovalWorkflowStep.belongsTo(Role, { foreignKey: 'required_role_id' });
ApprovalWorkflowStep.belongsTo(ApprovalWorkflow, { foreignKey: 'workflow_id' });

module.exports = ApprovalWorkflowStep;
