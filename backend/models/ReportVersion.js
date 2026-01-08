const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Report = require('./Report');

const ReportVersion = sequelize.define('ReportVersion', {
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
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // draft/in_review/approved/rejected/retired
  },
  change_summary: {
    type: DataTypes.TEXT,
  },
  snapshot: {
    type: DataTypes.JSONB,
    comment: 'Optional snapshot of important fields',
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
  tableName: 'report_versions',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['report_id', 'version_number'],
    },
  ],
});

// Relationships
ReportVersion.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportVersion.belongsTo(Report, { foreignKey: 'report_id' });

Report.hasMany(ReportVersion, { foreignKey: 'report_id' });

module.exports = ReportVersion;
