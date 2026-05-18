const Employee = require('../models/Employee');

// @desc    Add a new employee
// @route   POST /api/employees
// @access  Private
const addEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    // Check for existing employee with same email
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      res.status(400);
      throw new Error('An employee with this email already exists.');
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      skills,
      performanceScore,
      experience,
      addedBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Employee stored successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter employees
// @route   GET /api/employees/search
// @access  Private
const searchEmployees = async (req, res, next) => {
  try {
    const { department, search, minScore, maxScore, minExperience } = req.query;
    
    // Construct query object
    let query = {};

    // Filter by department
    if (department && department !== 'All') {
      query.department = { $regex: new RegExp(`^${department}$`, 'i') };
    }

    // Filter by general search term (name or email or skills)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by performance score range
    if (minScore || maxScore) {
      query.performanceScore = {};
      if (minScore) query.performanceScore.$gte = Number(minScore);
      if (maxScore) query.performanceScore.$lte = Number(maxScore);
    }

    // Filter by experience
    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }

    const employees = await Employee.find(query).sort({ performanceScore: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, department, skills, performanceScore, experience } = req.body;

    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    // Check if another employee has the target email
    if (email && email !== employee.email) {
      const emailExists = await Employee.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('An employee with this email already exists.');
      }
    }

    // Update fields
    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.department = department || employee.department;
    employee.skills = skills || employee.skills;
    employee.performanceScore = performanceScore !== undefined ? performanceScore : employee.performanceScore;
    employee.experience = experience !== undefined ? experience : employee.experience;

    const updatedEmployee = await employee.save();

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEmployee,
  getEmployees,
  searchEmployees,
  updateEmployee,
  deleteEmployee,
};
