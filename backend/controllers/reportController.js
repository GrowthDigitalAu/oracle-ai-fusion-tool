const Report = require('../models/Report');
const Project = require('../models/Project');
const { Op } = require('sequelize');

exports.getReportsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reports = await Report.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      code,
      name,
      description,
      status,
      report_type,
      is_seeded_reconcile,
      seeded_report_name,
      justification,
      output_html,
      output_excel,
      output_pdf,
      output_word,
      output_xml,
      output_csv,
      delivery_burst,
      delivery_ftp,
      delivery_email,
      delivery_system,
      remark,
    } = req.body;

    // Check project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Check unique code in project
    const existing = await Report.findOne({
      where: { project_id: projectId, code },
    });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Report code must be unique within the project' });
    }

    const report = await Report.create({
      project_id: projectId,
      organization_id: project.organization_id, // Inherit from project
      code,
      name,
      description,
      status: status || 'draft',
      report_type: report_type || 'BI_PUBLISHER',
      is_seeded_reconcile,
      seeded_report_name,
      justification,
      output_html,
      output_excel,
      output_pdf,
      output_word,
      output_xml,
      output_csv,
      delivery_burst,
      delivery_ftp,
      delivery_email,
      delivery_system,
      remark,
      created_by: req.user.id, // Assuming middleware sets req.user
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      status,
      report_type,
      is_seeded_reconcile,
      seeded_report_name,
      justification,
      output_html,
      output_excel,
      output_pdf,
      output_word,
      output_xml,
      output_csv,
      delivery_burst,
      delivery_ftp,
      delivery_email,
      delivery_system,
      remark,
      sql_query,
    } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    await report.update({
      name,
      description,
      status,
      report_type,
      is_seeded_reconcile,
      seeded_report_name,
      justification,
      output_html,
      output_excel,
      output_pdf,
      output_word,
      output_xml,
      output_csv,
      delivery_burst,
      delivery_ftp,
      delivery_email,
      delivery_system,
      remark,
      sql_query,
      updated_by: req.user.id,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    await report.destroy({
        deleted_by: req.user.id
    });
    // If using paranoid, we might want to also set deleted_by before destroy, or relies on soft delete. 
    // Sequelize soft delete sets deletedAt. We can manually update deleted_by if needed, 
    // but typically paranoid destroy just sets deletedAt.
    // Let's update deleted_by first to track who deleted it.
    
    // Actually, destroy() on paranoid model only sets deletedAt. 
    // If we want to track who deleted it in `deleted_by` column, we must update it first.
    // However, since we define deleted_by in the model, we can try to update it.
    await Report.update({ deleted_by: req.user.id }, { where: { id } });
    await Report.destroy({ where: { id } });

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
