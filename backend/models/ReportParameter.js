const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Report = require('./Report');

const ReportParameter = sequelize.define('ReportParameter', {
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
  param_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prompt: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  default_value: {
    type: DataTypes.STRING(255),
  },
  is_mandatory: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  validation_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // LOV/MULTI_LOV/FREE_TEXT/CALENDAR
  },
  lov_source: {
    type: DataTypes.TEXT,
    // SQL or reference to LOV
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
  tableName: 'report_parameters',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['report_id', 'name'],
    },
    {
      name: 'idx_report_parameters_report',
      fields: ['report_id'],
    },
  ],
});

// Relationships
ReportParameter.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportParameter.belongsTo(Report, { foreignKey: 'report_id' });

Report.hasMany(ReportParameter, { foreignKey: 'report_id' });

module.exports = ReportParameter;
