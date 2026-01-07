const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Report = require('./Report');

const ReportSourceColumn = sequelize.define('ReportSourceColumn', {
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
  column_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  column_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  source_navigation: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data_type: {
    type: DataTypes.STRING(50),
  },
  comments: {
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
  tableName: 'report_source_columns',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['report_id', 'column_name'],
    },
    {
      name: 'idx_report_source_report',
      fields: ['report_id'],
    },
  ],
});

// Relationships
ReportSourceColumn.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportSourceColumn.belongsTo(Report, { foreignKey: 'report_id' });

Report.hasMany(ReportSourceColumn, { foreignKey: 'report_id' });

module.exports = ReportSourceColumn;
