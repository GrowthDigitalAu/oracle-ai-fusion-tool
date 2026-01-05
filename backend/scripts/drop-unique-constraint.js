const sequelize = require('../config/database');

const dropConstraint = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Drop the unique constraint
    await sequelize.query('ALTER TABLE report_requirements DROP CONSTRAINT IF EXISTS report_requirements_report_id_key');
    
    console.log('Constraint dropped successfully.');
  } catch (error) {
    console.error('Unable to drop constraint:', error);
  } finally {
    await sequelize.close();
  }
};

dropConstraint();
