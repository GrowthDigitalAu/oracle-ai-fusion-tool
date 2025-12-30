const sequelize = require('../config/database');
const Report = require('../models/Report');

async function verify() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync just to be sure (server.js likely did it, but this is a separate process)
    await Report.sync(); 
    console.log('Report table synced.');

    const tableDesc = await sequelize.getQueryInterface().describeTable('reports');
    console.log('Table "reports" exists with columns:', Object.keys(tableDesc));
    
    // checks specific columns
    const columns = Object.keys(tableDesc);
    const required = ['project_id', 'code', 'name', 'status', 'output_html', 'delivery_email'];
    const missing = required.filter(col => !columns.includes(col));
    
    if (missing.length > 0) {
        console.error('Missing columns:', missing);
        process.exit(1);
    } else {
        console.log('All key columns found.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database or verify table:', error);
    process.exit(1);
  }
}

verify();
