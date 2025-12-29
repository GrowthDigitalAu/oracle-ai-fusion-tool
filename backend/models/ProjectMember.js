const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Project = require('./Project');
const OrganizationUser = require('./OrganizationUser');

const ProjectMember = sequelize.define('ProjectMember', {
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
  organization_user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: OrganizationUser,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  project_role: {
    type: DataTypes.STRING(100),
  },
  is_project_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  allocation_percent: {
    type: DataTypes.DECIMAL(5, 2),
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
  tableName: 'project_members',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'organization_user_id'],
    },
    {
      name: 'idx_project_members_project',
      fields: ['project_id'],
    },
  ],
});

// Relationships
Project.hasMany(ProjectMember, { foreignKey: 'project_id', onDelete: 'CASCADE' });
ProjectMember.belongsTo(Project, { foreignKey: 'project_id' });

OrganizationUser.hasMany(ProjectMember, { foreignKey: 'organization_user_id', onDelete: 'CASCADE' });
ProjectMember.belongsTo(OrganizationUser, { foreignKey: 'organization_user_id' });

Organization.hasMany(ProjectMember, { foreignKey: 'organization_id' });
ProjectMember.belongsTo(Organization, { foreignKey: 'organization_id' });

module.exports = ProjectMember;
