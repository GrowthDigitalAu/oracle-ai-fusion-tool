const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Organization = require('./models/Organization');
const OrganizationUser = require('./models/OrganizationUser');
const Role = require('./models/Role');
const AdminUser = require('./models/AdminUser');
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