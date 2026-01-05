const ReportRequirement = require('../models/ReportRequirement');
const Report = require('../models/Report'); // To verify report exists or check organization
const Organization = require('../models/Organization');

exports.getRequirements = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Fetch ALL requirements for the report
    const requirements = await ReportRequirement.findAll({
      where: { report_id: reportId },
      order: [['created_at', 'ASC']]
    });

    res.json({ success: true, data: requirements });
  } catch (error) {
    console.error('Error fetching requirements:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createRequirement = async (req, res) => {
  try {
    const { reportId } = req.params;
    const {
        purpose,
        pre_condition,
        data_access_level,
        domain,
        module,
        category,
        is_new_report,
        task_reference,
        functional_arch_approved,
        validated_in_repository,
        sample_layout_file_id,
        company_logo_file_id,
        grouping_applicable,
        grouping_columns,
        sorting_applicable,
        sorting_columns,
        totals_applicable,
        totals_columns,
        subtotals_applicable,
        subtotals_columns,
        client_signoff_notes,
        notes,
        remark
    } = req.body;

    const report = await Report.findByPk(reportId);
    if (!report) {
         return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const requirement = await ReportRequirement.create({
        report_id: reportId,
        organization_id: report.organization_id, // Inherit from report
        purpose,
        pre_condition,
        data_access_level,
        domain,
        module,
        category,
        is_new_report,
        task_reference,
        functional_arch_approved,
        validated_in_repository,
        sample_layout_file_id,
        company_logo_file_id,
        grouping_applicable,
        grouping_columns,
        sorting_applicable,
        sorting_columns,
        totals_applicable,
        totals_columns,
        subtotals_applicable,
        subtotals_columns,
        client_signoff_notes,
        notes,
        remark,
        created_by: req.user.id
    });

    res.status(201).json({ success: true, data: requirement });

  } catch (error) {
    console.error('Error creating requirement:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params; // Requirement ID
    const {
        purpose,
        pre_condition,
        data_access_level,
        domain,
        module,
        category,
        is_new_report,
        task_reference,
        functional_arch_approved,
        validated_in_repository,
        sample_layout_file_id,
        company_logo_file_id,
        grouping_applicable,
        grouping_columns,
        sorting_applicable,
        sorting_columns,
        totals_applicable,
        totals_columns,
        subtotals_applicable,
        subtotals_columns,
        client_signoff_notes,
        notes,
        remark
    } = req.body;

    let requirement = await ReportRequirement.findByPk(id);

    if (!requirement) {
        return res.status(404).json({ success: false, error: 'Requirement not found' });
    }

    requirement = await requirement.update({
        purpose,
        pre_condition,
        data_access_level,
        domain,
        module,
        category,
        is_new_report,
        task_reference,
        functional_arch_approved,
        validated_in_repository,
        sample_layout_file_id,
        company_logo_file_id,
        grouping_applicable,
        grouping_columns,
        sorting_applicable,
        sorting_columns,
        totals_applicable,
        totals_columns,
        subtotals_applicable,
        subtotals_columns,
        client_signoff_notes,
        notes,
        remark,
        updated_by: req.user.id
    });

    res.json({ success: true, data: requirement });

  } catch (error) {
    console.error('Error updating requirement:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params; // Requirement ID
    
    const requirement = await ReportRequirement.findByPk(id);

    if (!requirement) {
      return res.status(404).json({ success: false, error: 'Requirement not found' });
    }

    await requirement.destroy({
        deleted_by: req.user.id
    });
    
    await ReportRequirement.update({ deleted_by: req.user.id }, { where: { id: requirement.id } });
    await ReportRequirement.destroy({ where: { id: requirement.id } });

    res.json({ success: true, message: 'Requirement deleted successfully' });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};
