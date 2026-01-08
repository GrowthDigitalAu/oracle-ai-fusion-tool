const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');

const File = sequelize.define('File', {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content_type: {
    type: DataTypes.STRING(100),
  },
  storage_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 's3',
  },
  storage_path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_size_bytes: {
    type: DataTypes.BIGINT,
  },
  checksum: {
    type: DataTypes.STRING(128),
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
  tableName: 'files',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['organization_id'],
      name: 'idx_files_org'
    }
  ]
});

// Relationships
File.belongsTo(Organization, { foreignKey: 'organization_id' });

module.exports = File;
