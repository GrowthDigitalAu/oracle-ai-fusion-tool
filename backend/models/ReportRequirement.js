const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Report = require('./Report');

const ReportRequirement = sequelize.define('ReportRequirement', {
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
  purpose: {
    type: DataTypes.TEXT,
  },
  pre_condition: {
    type: DataTypes.TEXT,
  },
  data_access_level: {
    type: DataTypes.STRING(255),
  },
  // Scope
  domain: {
    type: DataTypes.STRING(255),
  },
  module: {
    type: DataTypes.STRING(255),
  },
  category: {
    type: DataTypes.STRING(255),
  },
  is_new_report: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  task_reference: {
    type: DataTypes.STRING(255),
  },
  functional_arch_approved: {
    type: DataTypes.BOOLEAN,
  },
  validated_in_repository: {
    type: DataTypes.BOOLEAN,
  },
  sample_layout_file_id: {
    type: DataTypes.BIGINT,
  },
  company_logo_file_id: {
    type: DataTypes.BIGINT,
  },
  grouping_applicable: {
    type: DataTypes.BOOLEAN,
  },
  grouping_columns: {
    type: DataTypes.TEXT,
  },
  sorting_applicable: {
    type: DataTypes.BOOLEAN,
  },
  sorting_columns: {
    type: DataTypes.TEXT,
  },
  totals_applicable: {
    type: DataTypes.BOOLEAN,
  },
  totals_columns: {
    type: DataTypes.TEXT,
  },
  subtotals_applicable: {
    type: DataTypes.BOOLEAN,
  },
  subtotals_columns: {
    type: DataTypes.TEXT,
  },
  client_signoff_notes: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
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
  tableName: 'report_requirements',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

// Relationships
ReportRequirement.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportRequirement.belongsTo(Report, { foreignKey: 'report_id' });
Report.hasMany(ReportRequirement, { foreignKey: 'report_id', onDelete: 'CASCADE' });

module.exports = ReportRequirement;
