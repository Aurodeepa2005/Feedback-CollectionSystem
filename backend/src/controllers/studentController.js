const Form = require("../models/Form");
const Course = require("../models/Course");
const Submission = require("../models/Submission");
const Response = require("../models/Response");

// Helper to determine subject-based accent color
const getCourseColor = (code) => {
  if (!code) return "#3B82F6";
  const prefix = code.substring(0, 2).toUpperCase();
  switch (prefix) {
    case "CS": return "#3B82F6"; // Blue
    case "MA": return "#8B5CF6"; // Purple
    case "PH": return "#06B6D4"; // Cyan
    case "EN": return "#10B981"; // Green
    case "CH": return "#EC4899"; // Pink
    default: return "#F59E0B";   // Amber
  }
};

// @desc    Get all available feedback forms for the student
// @route   GET /api/student/forms
// @access  Private (Student only)
exports.getForms = async (req, res, next) => {
  try {
    // Optional: Filter forms based on student's department if they have one
    const studentDept = req.user.department;
    
    // Find all forms that are NOT draft
    let query = { status: { $ne: "draft" } };
    
    const forms = await Form.find(query)
      .populate({
        path: "courseId",
        populate: {
          path: "facultyId",
          select: "name",
        },
      })
      .sort({ deadline: 1 });

    const studentSubmissions = await Submission.find({ studentId: req.user.id });
    const submittedFormIds = studentSubmissions.map((sub) => sub.formId.toString());

    const result = forms.map((form) => {
      const isSubmitted = submittedFormIds.includes(form._id.toString());
      const hasExpired = new Date(form.deadline) < new Date();
      
      let status = form.status;
      if (isSubmitted) {
        status = "completed";
      } else if (hasExpired) {
        status = "expired";
      }

      return {
        id: form._id,
        title: form.title,
        subject: form.courseId ? form.courseId.name : "Unknown Subject",
        subjectCode: form.courseId ? form.courseId.code : "N/A",
        facultyName: form.courseId && form.courseId.facultyId ? form.courseId.facultyId.name : "TBD",
        department: form.courseId ? form.courseId.department : "N/A",
        deadline: form.deadline,
        status: status,
        color: getCourseColor(form.courseId ? form.courseId.code : ""),
        questionsTotal: form.questionsTotal,
        questionsAnswered: isSubmitted ? form.questionsTotal : 0,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for a form
// @route   POST /api/student/forms/:formId/submit
// @access  Private (Student only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;

    if (!answers) {
      return res.status(400).json({
        error: "BadRequest",
        message: "Feedback answers are required.",
      });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        error: "NotFound",
        message: "Feedback form not found.",
      });
    }

    if (form.status === "draft") {
      return res.status(400).json({
        error: "BadRequest",
        message: "This feedback form is in draft mode and cannot receive submissions.",
      });
    }

    if (new Date(form.deadline) < new Date()) {
      return res.status(400).json({
        error: "BadRequest",
        message: "The deadline for this feedback form has passed.",
      });
    }

    // Check for duplicate submission
    const existingSubmission = await Submission.findOne({
      studentId: req.user.id,
      formId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        error: "DuplicateSubmission",
        message: "You have already submitted feedback for this course.",
      });
    }

    // Extract answers mapping (Q1: overall course, Q2: teaching quality, Q3: course content, Q4: recommend, Q5: comment)
    const { q1, q2, q3, q4, q5 } = answers;

    // Validate inputs
    if (!q1 || !q2 || !q3 || q4 === undefined) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Please answer all required questions.",
      });
    }

    // 1. Save completely anonymous feedback response
    await Response.create({
      formId,
      overallRating: Number(q1),
      teachingRating: Number(q2),
      contentRating: Number(q3),
      recommendation: q4,
      comment: q5 || "",
      submittedAt: new Date(),
    });

    // 2. Save submission log to prevent duplicate entries and show student history
    await Submission.create({
      studentId: req.user.id,
      formId,
      rating: Number(q1),
      teachingRating: Number(q2),
      contentRating: Number(q3),
      recommendation: q4,
      comment: q5 || "",
      submittedAt: new Date(),
    });

    res.status(200).json({
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's feedback submission history
// @route   GET /api/student/my-feedback
// @access  Private (Student only)
exports.getMyFeedback = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate({
        path: "formId",
        populate: {
          path: "courseId",
          populate: {
            path: "facultyId",
            select: "name",
          },
        },
      })
      .sort({ submittedAt: -1 });

    const result = submissions.map((sub) => {
      const form = sub.formId;
      const course = form ? form.courseId : null;
      const faculty = course ? course.facultyId : null;

      return {
        id: sub._id,
        form: form ? form.title : "Deleted Form",
        formTitle: form ? form.title : "Deleted Form",
        subject: course ? course.name : "Unknown Subject",
        subjectCode: course ? course.code : "N/A",
        code: course ? course.code : "N/A",
        faculty: faculty ? faculty.name : "Unknown Faculty",
        facultyName: faculty ? faculty.name : "Unknown Faculty",
        dept: course ? course.department : "N/A",
        rating: sub.rating || 5,
        submittedAt: sub.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        dateISO: sub.submittedAt.toISOString().slice(0, 10),
        status: "submitted",
        answers: {
          q1: sub.rating,
          q2: sub.teachingRating,
          q3: sub.contentRating,
          q4: sub.recommendation,
          q5: sub.comment
        }
      };
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
