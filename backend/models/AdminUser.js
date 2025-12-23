const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: true, // Assuming it might be null initially or handled elsewhere, but standard is usually not null. The image shows data so likely not null. I'll stick to basic types.
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'admin_users',
  timestamps: false,
});

module.exports = AdminUser;
