const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Organization = require('./models/Organization');
const OrganizationUser = require('./models/OrganizationUser');
const Role = require('./models/Role');
const AdminUser = require('./models/AdminUser');
const Project = require('./models/Project');
const ProjectMember = require('./models/ProjectMember');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const OrganizationUserRole = require('./models/OrganizationUserRole');
const Report = require('./models/Report');
const ReportRequirement = require('./models/ReportRequirement');
const ReportParameter = require('./models/ReportParameter');
const ReportSourceColumn = require('./models/ReportSourceColumn');
const ReportAsset = require('./models/ReportAsset');
const ReportConfig = require('./models/ReportConfig');
const ReportWorkflowInstance = require('./models/ReportWorkflowInstance');
const ReportVersion = require('./models/ReportVersion');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/project-members', require('./routes/projectMemberRoutes'));
app.use('/api/permissions', require('./routes/permissionRoutes'));
app.use('/api/role-permissions', require('./routes/rolePermissionRoutes'));
app.use('/api/organization-user-roles', require('./routes/organizationUserRoleRoutes'));
app.use('/api', require('./routes/reportRoutes')); // Uses /api/projects/:pid/reports and /api/reports/:id
app.use('/api', require('./routes/reportRequirementRoutes'));
app.use('/api', require('./routes/reportParameterRoutes'));
app.use('/api', require('./routes/reportSourceColumnRoutes'));
app.use('/api', require('./routes/reportAssetRoutes'));
app.use('/api', require('./routes/reportConfigRoutes'));
app.use('/api', require('./routes/reportWorkflowInstanceRoutes'));
app.use('/api', require('./routes/reportVersionRoutes'));

// Sync Database and Start Server
sequelize.sync({ force: false }) // Set force: true to drop and re-create tables on every save
  .then(() => {
    console.log('Database synced successfully.');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`); 
    });
  })
  .catch((err) => {
    console.error('Unable to sync database:', err);
  });