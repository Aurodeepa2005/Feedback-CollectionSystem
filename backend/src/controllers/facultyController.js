const Course = require("../models/Course");
const Form = require("../models/Form");
const Response = require("../models/Response");
const User = require("../models/User");

// @desc    Get faculty dashboard statistics
// @route   GET /api/faculty/dashboard
// @access  Private (Faculty only)
exports.getDashboard = async (req, res, next) => {
  try {
    const facultyId = req.user.id;

    // 1. Find all courses taught by this faculty member
    const courses = await Course.find({ facultyId, status: "active" });
    const courseIds = courses.map(c => c._id);

    // 2. Find all forms for these courses
    const forms = await Form.find({ courseId: { $in: courseIds } });
    const formIds = forms.map(f => f._id);

    // 3. Find responses for these forms
    const responses = await Response.find({ formId: { $in: formIds } });

    // Calculate overall stats
    const totalForms = forms.length;
    const totalResponses = responses.length;
    const activeForms = forms.filter(f => f.status === "active" && new Date(f.deadline) >= new Date()).length;

    let overallSum = 0;
    responses.forEach(r => {
      overallSum += r.overallRating;
    });
    const avgRating = totalResponses > 0 ? Number((overallSum / totalResponses).toFixed(1)) : 0;

    // Compile per-course summaries
    const courseSummaries = await Promise.all(courses.map(async (course) => {
      // Find forms for this specific course
      const courseForms = forms.filter(f => f.courseId.toString() === course._id.toString());
      const courseFormIds = courseForms.map(f => f._id);

      // Find responses for these course forms
      const courseResponses = responses.filter(r => courseFormIds.some(fid => fid.toString() === r.formId.toString()));
      
      let courseSum = 0;
      courseResponses.forEach(r => {
        courseSum += r.overallRating;
      });
      const courseAvg = courseResponses.length > 0 ? Number((courseSum / courseResponses.length).toFixed(1)) : 0;

      // Estimate student enrollment: count students in the same department
      const studentCount = await User.countDocuments({ role: "student", department: course.department });
      
      return {
        id: course._id,
        name: course.name,
        code: course.code,
        students: studentCount || 40, // fallback class size
        responseCount: courseResponses.length,
        avgRating: courseAvg,
        responseRate: studentCount > 0 ? Math.round((courseResponses.length / studentCount) * 100) : 100,
        trend: 5 // mock percentage trend vs last sem
      };
    }));

    res.status(200).json({
      totalForms,
      totalResponses,
      avgRating,
      activeForms,
      courses: courseSummaries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback comments & detailed ratings (anonymous)
// @route   GET /api/faculty/feedback
// @access  Private (Faculty only)
exports.getFeedback = async (req, res, next) => {
  try {
    const facultyId = req.user.id;
    const { course, dateFrom, dateTo } = req.query;

    // Find all courses taught by this faculty member
    let courseQuery = { facultyId };
    if (course) {
      courseQuery.code = course.toUpperCase();
    }
    const courses = await Course.find(courseQuery);
    const courseIds = courses.map(c => c._id);

    // Find forms for these courses
    const forms = await Form.find({ courseId: { $in: courseIds } }).populate("courseId");
    const formIds = forms.map(f => f._id);

    // Build response query
    let responseQuery = { formId: { $in: formIds } };
    if (dateFrom || dateTo) {
      responseQuery.submittedAt = {};
      if (dateFrom) responseQuery.submittedAt.$gte = new Date(dateFrom);
      if (dateTo) responseQuery.submittedAt.$lte = new Date(dateTo);
    }

    const responses = await Response.find(responseQuery).sort({ submittedAt: -1 });

    const result = responses.map(r => {
      const form = forms.find(f => f._id.toString() === r.formId.toString());
      return {
        id: r._id,
        formTitle: form ? form.title : "Feedback Form",
        subject: form && form.courseId ? form.courseId.name : "N/A",
        subjectCode: form && form.courseId ? form.courseId.code : "N/A",
        overallRating: r.overallRating,
        teachingRating: r.teachingRating,
        contentRating: r.contentRating,
        recommendation: r.recommendation,
        comment: r.comment,
        submittedAt: r.submittedAt,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get faculty analytics metrics
// @route   GET /api/faculty/analytics
// @access  Private (Faculty only)
exports.getAnalytics = async (req, res, next) => {
  try {
    const facultyId = req.user.id;

    // Find all courses taught by this faculty member
    const courses = await Course.find({ facultyId });
    const courseIds = courses.map(c => c._id);

    // Find forms for these courses
    const forms = await Form.find({ courseId: { $in: courseIds } });
    const formIds = forms.map(f => f._id);

    // Find responses
    const responses = await Response.find({ formId: { $in: formIds } }).sort({ submittedAt: 1 });

    // Overall metrics
    const totalResponses = responses.length;
    
    // Enrollments
    let totalEnrolled = 0;
    for (const c of courses) {
      const count = await User.countDocuments({ role: "student", department: c.department });
      totalEnrolled += (count || 40);
    }
    const responseRate = totalEnrolled > 0 ? Math.round((totalResponses / totalEnrolled) * 100) : 100;

    let overallSum = 0;
    let teachingSum = 0;
    let contentSum = 0;

    responses.forEach(r => {
      overallSum += r.overallRating;
      teachingSum += r.teachingRating;
      contentSum += r.contentRating;
    });

    const avgRating = totalResponses > 0 ? Number((overallSum / totalResponses).toFixed(1)) : 0;
    
    // Criteria breakdown
    const criteriaBreakdown = {
      teaching: totalResponses > 0 ? Number((teachingSum / totalResponses).toFixed(1)) : 0,
      content: totalResponses > 0 ? Number((contentSum / totalResponses).toFixed(1)) : 0,
      clarity: totalResponses > 0 ? Number((overallSum / totalResponses).toFixed(1)) : 0,
      engagement: totalResponses > 0 ? Number(((teachingSum + overallSum) / (2 * totalResponses)).toFixed(1)) : 0,
    };

    // Calculate monthly trends (last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyTrendMap = {};
    
    // Pre-populate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = months[d.getMonth()];
      monthlyTrendMap[mLabel] = 0;
    }

    responses.forEach(r => {
      const date = new Date(r.submittedAt);
      const mLabel = months[date.getMonth()];
      if (monthlyTrendMap[mLabel] !== undefined) {
        monthlyTrendMap[mLabel]++;
      }
    });

    const monthlyTrend = Object.keys(monthlyTrendMap).map(key => ({
      label: key,
      value: monthlyTrendMap[key]
    }));

    res.status(200).json({
      avgRating,
      totalResponses,
      responseRate: responseRate > 100 ? 100 : responseRate,
      monthlyTrend,
      criteriaBreakdown
    });
  } catch (error) {
    next(error);
  }
};
