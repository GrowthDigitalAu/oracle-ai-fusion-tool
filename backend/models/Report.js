const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Project = require('./Project');

const Report = sequelize.define('Report', {
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
  project_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Project,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  report_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'BI_PUBLISHER',
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'draft', // draft/in_review/approved/retired
  },
  is_seeded_reconcile: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  seeded_report_name: {
    type: DataTypes.STRING(255),
  },
  justification: {
    type: DataTypes.TEXT, // business justification
  },
  // Output types
  output_html: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  output_excel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  output_pdf: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  output_word: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  output_xml: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  output_csv: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // Delivery types
  delivery_burst: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  delivery_ftp: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  delivery_email: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  delivery_system: {
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
  tableName: 'reports',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'code'],
    },
    {
      name: 'idx_reports_project',
      fields: ['project_id'],
    },
  ],
});

// Relationships
Report.belongsTo(Organization, { foreignKey: 'organization_id' });
Report.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Report, { foreignKey: 'project_id' });

module.exports = Report;
