const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Report = require('./Report');

const ReportAsset = sequelize.define('ReportAsset', {
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
  asset_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // SQL/DATA_MODEL/REPORT_XML/RTF_TEMPLATE/SAMPLE_DATA/OTHER
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  inline_text: {
    type: DataTypes.TEXT,
  },
  file_id: {
    type: DataTypes.BIGINT,
    // References files(id) - table doesn't exist yet, so making it optional
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
  tableName: 'report_assets',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      // Unique index for active assets of same type per report
      unique: true,
      fields: ['report_id', 'asset_type'],
      where: {
        is_active: true,
      },
      name: 'idx_report_assets_unique_active',
    },
    {
      name: 'idx_report_assets_report',
      fields: ['report_id'],
    },
  ],
});

// Relationships
ReportAsset.belongsTo(Organization, { foreignKey: 'organization_id' });
ReportAsset.belongsTo(Report, { foreignKey: 'report_id' });

Report.hasMany(ReportAsset, { foreignKey: 'report_id' });

module.exports = ReportAsset;
