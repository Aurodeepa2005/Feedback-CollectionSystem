const User = require("../models/User");
const Course = require("../models/Course");
const Form = require("../models/Form");
const Response = require("../models/Response");
const Submission = require("../models/Submission");

// Helper for general query handling (pagination, searching, sorting)
const queryHelper = async (model, req, searchFields = [], populateOptions = []) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Search filter
  let filter = {};
  if (req.query.search && searchFields.length > 0) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = searchFields.map(field => ({ [field]: searchRegex }));
  }

  // Sorting
  let sort = {};
  if (req.query.sort) {
    const dir = req.query.dir === "desc" ? -1 : 1;
    sort[req.query.sort] = dir;
  } else {
    sort.createdAt = -1; // default newest first
  }

  // Query Execution
  let query = model.find(filter).sort(sort).skip(skip).limit(limit);
  
  if (populateOptions.length > 0) {
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
  }

  const data = await query;
  const total = await model.countDocuments(filter);

  return {
    data,
    total,
    page,
    limit
  };
};

// ==========================================
// ADMIN DASHBOARD
// ==========================================

exports.getDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeForms = await Form.countDocuments({ status: "active", deadline: { $gte: new Date() } });
    const totalResponses = await Response.countDocuments();
    
    // Response Rate calculation
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalSubmissions = await Submission.countDocuments();
    const responseRate = totalStudents > 0 ? Math.round((totalSubmissions / totalStudents) * 100) : 0;

    // Recent Users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    // Monthly Activity Activity count (Submissions over last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activityMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      activityMap[months[d.getMonth()]] = 0;
    }

    const submissions = await Submission.find({
      submittedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    });

    submissions.forEach(sub => {
      const mLabel = months[new Date(sub.submittedAt).getMonth()];
      if (activityMap[mLabel] !== undefined) {
        activityMap[mLabel]++;
      }
    });

    const monthlyActivity = Object.keys(activityMap).map(key => ({
      label: key,
      value: activityMap[key]
    }));

    res.status(200).json({
      totalUsers,
      activeForms,
      totalResponses,
      responseRate: responseRate > 100 ? 100 : responseRate,
      recentUsers: recentUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        joined: u.createdAt.toISOString().slice(0, 10),
      })),
      monthlyActivity
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// USER MANAGEMENT (CRUD)
// ==========================================

exports.getUsers = async (req, res, next) => {
  try {
    const list = await queryHelper(User, req, ["name", "email"]);
    
    const formattedData = list.data.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      joined: u.createdAt.toISOString().slice(0, 10),
    }));

    res.status(200).json({
      data: formattedData,
      total: list.total,
      page: list.page,
      limit: list.limit
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role, password, department, studentId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        error: "UserExists",
        message: "Email is already in use.",
      });
    }

    const user = await User.create({
      name,
      email,
      role,
      password,
      department,
      studentId: role === "student" ? studentId : undefined,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      joined: user.createdAt.toISOString().slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password, department, studentId } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "NotFound", message: "User not found" });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "UserExists", message: "Email is already taken" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (studentId !== undefined) user.studentId = studentId;
    if (password) user.password = password; // pre-save hashes it

    await user.save();

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      joined: user.createdAt.toISOString().slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "NotFound", message: "User not found" });
    }
    
    // Also cleanup if they are a faculty teaching courses
    if (user.role === "faculty") {
      await Course.updateMany({ facultyId: user._id }, { $set: { status: "inactive" } });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "NotFound", message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.status(200).json({
      id: user._id,
      name: user.name,
      status: user.status
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FACULTY MANAGEMENT
// ==========================================

exports.getFaculty = async (req, res, next) => {
  try {
    // Find all users with role 'faculty'
    const facultyMembers = await User.find({ role: "faculty" }).sort({ createdAt: -1 });

    const formattedData = await Promise.all(facultyMembers.map(async (f) => {
      const coursesCount = await Course.countDocuments({ facultyId: f._id });
      
      // Calculate overall average rating across all forms taught by this faculty member
      const courses = await Course.find({ facultyId: f._id });
      const courseIds = courses.map(c => c._id);
      const forms = await Form.find({ courseId: { $in: courseIds } });
      const formIds = forms.map(form => form._id);
      const responses = await Response.find({ formId: { $in: formIds } });
      
      let sum = 0;
      responses.forEach(r => {
        sum += r.overallRating;
      });
      const avgRating = responses.length > 0 ? Number((sum / responses.length).toFixed(1)) : 0;

      return {
        id: f._id,
        name: f.name,
        email: f.email,
        department: f.department || "General",
        courses: coursesCount,
        avgRating,
        status: f.status
      };
    }));

    res.status(200).json({ data: formattedData });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COURSE MANAGEMENT
// ==========================================

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate("facultyId", "name").sort({ createdAt: -1 });

    const formattedData = courses.map(c => ({
      id: c._id,
      code: c.code,
      name: c.name,
      department: c.department,
      facultyId: c.facultyId ? c.facultyId._id : null,
      facultyName: c.facultyId ? c.facultyId.name : "N/A",
      semester: c.semester,
      status: c.status
    }));

    res.status(200).json({ data: formattedData });
  } catch (error) {
    next(error);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { code, name, department, facultyId, semester } = req.body;

    const courseExists = await Course.findOne({ code: code.toUpperCase() });
    if (courseExists) {
      return res.status(400).json({ error: "DuplicateCourse", message: "Course code already exists." });
    }

    const course = await Course.create({
      code: code.toUpperCase(),
      name,
      department,
      facultyId,
      semester,
    });

    const populatedCourse = await Course.findById(course._id).populate("facultyId", "name");

    res.status(201).json({
      id: populatedCourse._id,
      code: populatedCourse.code,
      name: populatedCourse.name,
      department: populatedCourse.department,
      facultyId: populatedCourse.facultyId ? populatedCourse.facultyId._id : null,
      facultyName: populatedCourse.facultyId ? populatedCourse.facultyId.name : "N/A",
      semester: populatedCourse.semester,
      status: populatedCourse.status
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const { code, name, department, facultyId, semester, status } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "NotFound", message: "Course not found" });
    }

    if (code && code.toUpperCase() !== course.code) {
      const courseExists = await Course.findOne({ code: code.toUpperCase() });
      if (courseExists) {
        return res.status(400).json({ error: "DuplicateCourse", message: "Course code is already in use." });
      }
      course.code = code.toUpperCase();
    }

    if (name) course.name = name;
    if (department) course.department = department;
    if (facultyId) course.facultyId = facultyId;
    if (semester) course.semester = semester;
    if (status) course.status = status;

    await course.save();

    const populatedCourse = await Course.findById(course._id).populate("facultyId", "name");

    res.status(200).json({
      id: populatedCourse._id,
      code: populatedCourse.code,
      name: populatedCourse.name,
      department: populatedCourse.department,
      facultyId: populatedCourse.facultyId ? populatedCourse.facultyId._id : null,
      facultyName: populatedCourse.facultyId ? populatedCourse.facultyId.name : "N/A",
      semester: populatedCourse.semester,
      status: populatedCourse.status
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "NotFound", message: "Course not found" });
    }
    
    // Delete forms associated with course
    await Form.deleteMany({ courseId: course._id });

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FEEDBACK FORM MANAGEMENT
// ==========================================

exports.getForms = async (req, res, next) => {
  try {
    const forms = await Form.find()
      .populate({
        path: "courseId",
        populate: {
          path: "facultyId",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    const formattedData = await Promise.all(forms.map(async (f) => {
      const course = f.courseId;
      const faculty = course ? course.facultyId : null;

      // Count actual responses submitted
      const responsesCount = await Response.countDocuments({ formId: f._id });

      return {
        id: f._id,
        title: f.title,
        courseId: course ? course._id : null,
        subject: course ? course.name : "N/A",
        subjectCode: course ? course.code : "N/A",
        facultyName: faculty ? faculty.name : "N/A",
        department: course ? course.department : "N/A",
        deadline: f.deadline,
        status: f.status,
        questionsTotal: f.questionsTotal,
        responsesCount
      };
    }));

    res.status(200).json({ data: formattedData });
  } catch (error) {
    next(error);
  }
};

exports.createForm = async (req, res, next) => {
  try {
    const { title, courseId, deadline } = req.body;

    const form = await Form.create({
      title,
      courseId,
      deadline: new Date(deadline),
      status: "draft" // default creation state
    });

    const populatedForm = await Form.findById(form._id).populate({
      path: "courseId",
      populate: { path: "facultyId", select: "name" }
    });

    const course = populatedForm.courseId;
    const faculty = course ? course.facultyId : null;

    res.status(201).json({
      id: populatedForm._id,
      title: populatedForm.title,
      courseId: course ? course._id : null,
      subject: course ? course.name : "N/A",
      subjectCode: course ? course.code : "N/A",
      facultyName: faculty ? faculty.name : "N/A",
      department: course ? course.department : "N/A",
      deadline: populatedForm.deadline,
      status: populatedForm.status,
      questionsTotal: populatedForm.questionsTotal,
      responsesCount: 0
    });
  } catch (error) {
    next(error);
  }
};

exports.updateForm = async (req, res, next) => {
  try {
    const { title, courseId, deadline, status } = req.body;

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "NotFound", message: "Form not found" });
    }

    if (title) form.title = title;
    if (courseId) form.courseId = courseId;
    if (deadline) form.deadline = new Date(deadline);
    if (status) form.status = status;

    await form.save();

    const populatedForm = await Form.findById(form._id).populate({
      path: "courseId",
      populate: { path: "facultyId", select: "name" }
    });

    const course = populatedForm.courseId;
    const faculty = course ? course.facultyId : null;
    const responsesCount = await Response.countDocuments({ formId: form._id });

    res.status(200).json({
      id: populatedForm._id,
      title: populatedForm.title,
      courseId: course ? course._id : null,
      subject: course ? course.name : "N/A",
      subjectCode: course ? course.code : "N/A",
      facultyName: faculty ? faculty.name : "N/A",
      department: course ? course.department : "N/A",
      deadline: populatedForm.deadline,
      status: populatedForm.status,
      questionsTotal: populatedForm.questionsTotal,
      responsesCount
    });
  } catch (error) {
    next(error);
  }
};

exports.publishForm = async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "NotFound", message: "Form not found" });
    }

    // Toggle publish
    form.status = form.status === "active" ? "draft" : "active";
    await form.save();

    res.status(200).json({
      id: form._id,
      title: form.title,
      status: form.status
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteForm = async (req, res, next) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "NotFound", message: "Form not found" });
    }
    
    // Delete associated submissions & responses
    await Response.deleteMany({ formId: form._id });
    await Submission.deleteMany({ formId: form._id });

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ANONYMOUS RESPONSES HISTORY
// ==========================================

exports.getResponses = async (req, res, next) => {
  try {
    const { form, dateFrom, dateTo, minRating } = req.query;

    let responseFilter = {};

    if (form) {
      responseFilter.formId = form;
    }

    if (minRating) {
      responseFilter.overallRating = { $gte: parseInt(minRating) };
    }

    if (dateFrom || dateTo) {
      responseFilter.submittedAt = {};
      if (dateFrom) responseFilter.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) responseFilter.submittedAt.$lte = new Date(dateTo);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await Response.find(responseFilter)
      .populate({
        path: "formId",
        populate: {
          path: "courseId",
          select: "name code"
        }
      })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Response.countDocuments(responseFilter);

    const formattedData = data.map(r => {
      const f = r.formId;
      const c = f ? f.courseId : null;

      return {
        id: r._id,
        formTitle: f ? f.title : "N/A",
        subject: c ? c.name : "N/A",
        subjectCode: c ? c.code : "N/A",
        overallRating: r.overallRating,
        teachingRating: r.teachingRating,
        contentRating: r.contentRating,
        recommendation: r.recommendation,
        comment: r.comment,
        submittedAt: r.submittedAt
      };
    });

    res.status(200).json({
      data: formattedData,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SYSTEM ANALYTICS
// ==========================================

exports.getAnalytics = async (req, res, next) => {
  try {
    // 1. Subject Breakdown (Responses count per course code)
    const courses = await Course.find();
    
    const subjectBreakdown = await Promise.all(courses.map(async (c) => {
      const forms = await Form.find({ courseId: c._id });
      const formIds = forms.map(f => f._id);
      const responsesCount = await Response.countDocuments({ formId: { $in: formIds } });
      
      return {
        label: c.code,
        value: responsesCount
      };
    }));

    // 2. Role Distribution
    const studentCount = await User.countDocuments({ role: "student" });
    const facultyCount = await User.countDocuments({ role: "faculty" });
    const adminCount = await User.countDocuments({ role: "admin" });

    const roleDistribution = [
      { label: "Students", value: studentCount },
      { label: "Faculty", value: facultyCount },
      { label: "Admins", value: adminCount }
    ];

    // 3. Monthly Trend (last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trendMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      trendMap[months[d.getMonth()]] = 0;
    }

    const responses = await Response.find({
      submittedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
    });

    responses.forEach(r => {
      const mLabel = months[new Date(r.submittedAt).getMonth()];
      if (trendMap[mLabel] !== undefined) {
        trendMap[mLabel]++;
      }
    });

    const monthlyTrend = Object.keys(trendMap).map(key => ({
      label: key,
      value: trendMap[key]
    }));

    // 4. Top Rated Subjects
    const topRatedSubjects = await Promise.all(courses.map(async (c) => {
      const forms = await Form.find({ courseId: c._id });
      const formIds = forms.map(f => f._id);
      const courseResponses = await Response.find({ formId: { $in: formIds } });
      
      let sum = 0;
      courseResponses.forEach(r => {
        sum += r.overallRating;
      });
      const avg = courseResponses.length > 0 ? Number((sum / courseResponses.length).toFixed(1)) : 0;

      return {
        code: c.code,
        name: c.name,
        avgRating: avg,
        responses: courseResponses.length
      };
    }));

    // Sort by rating descending and limit to 4
    topRatedSubjects.sort((a, b) => b.avgRating - a.avgRating);
    const topRatedLimited = topRatedSubjects.slice(0, 4);

    res.status(200).json({
      subjectBreakdown: subjectBreakdown.filter(item => item.value > 0), // only subjects with actual responses
      roleDistribution,
      monthlyTrend,
      topRatedSubjects: topRatedLimited
    });
  } catch (error) {
    next(error);
  }
};
