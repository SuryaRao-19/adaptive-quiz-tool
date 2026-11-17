const LibraryResource = require('../models/LibraryResource');

// @desc Get all library resources with optional filtering
// @route GET /api/library
const getResources = async (req, res, next) => {
  try {
    const { subject, topic, difficulty, search } = req.query;
    const filter = {};

    if (subject && subject !== 'All') {
      filter.subject = subject;
    }
    if (topic && topic !== 'All') {
      filter.topic = topic;
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { summary: { $regex: search.trim(), $options: 'i' } },
        { topic: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let resources = await LibraryResource.find(filter).sort({ createdAt: -1 });

    if (!resources || resources.length === 0) {
      // Return verified Greenwood Public School Grade 7 Mathematics & Science topic-wise theory
      const DEFAULT_G7_RESOURCES = [
        {
          _id: "res-g7-01",
          id: "res-g7-01",
          title: "Class 7 Mathematics: Integers & Operational Sign Rules",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Integers",
          difficulty: "Foundational",
          type: "Concept Guide",
          readTime: "5 min read",
          thumbnail: "🔢",
          summary: "Complete mastery of positive and negative integers, number line directions, sign multiplication rules, and additive inverse properties.",
          formulas: [
            { name: "Subtraction Rule", rule: "a - (-b) = a + b", tip: "Subtracting a negative is equivalent to adding a positive" },
            { name: "Negative Product", rule: "(-a) · (-b) = +(a · b)", tip: "Product of two negative integers is always positive" },
            { name: "Mixed Sign Product", rule: "(-a) · b = -(a · b)", tip: "Product of positive and negative integers is always negative" },
            { name: "Quotient Rule", rule: "(-a) / b = a / (-b) = -(a / b)", tip: "Division of integers with unlike signs gives a negative quotient" }
          ],
          body: `# Chapter 1: Integers — Theory & Core Rules\n\nAn integer is any number from the set {... -3, -2, -1, 0, 1, 2, 3 ...}.\n\n### 1. Fundamental Properties of Integers\n* Closure: a + b and a · b are always integers.\n* Commutative: a + b = b + a and a · b = b · a.\n* Associative: (a + b) + c = a + (b + c).\n* Distributive: a · (b + c) = ab + ac.\n\n### 2. Operational Sign Rules\n* Like signs: (+) · (+) = (+) and (-) · (-) = (+)\n* Unlike signs: (-) · (+) = (-) and (+) · (-) = (-)`
        },
        {
          _id: "res-g7-02",
          id: "res-g7-02",
          title: "Class 7 Mathematics: Fractions, Decimals & Reciprocal Division",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Fractions and Decimals",
          difficulty: "Intermediate",
          type: "Concept Guide",
          readTime: "6 min read",
          thumbnail: "🍰",
          summary: "Visual guide to multiplication of fractions, finding reciprocals, and reciprocal division step-by-step.",
          formulas: [
            { name: "Fraction Multiplication", rule: "(a/b) · (c/d) = (a · c) / (b · d)", tip: "Multiply numerators together and denominators together" },
            { name: "Fraction Division", rule: "(a/b) ÷ (c/d) = (a/b) · (d/c)", tip: "Invert second fraction (reciprocal) and multiply" },
            { name: "Reciprocal Definition", rule: "(a/b) · (b/a) = 1", tip: "Two non-zero numbers whose product is 1 are mutual reciprocals" }
          ],
          body: `# Chapter 2: Fractions and Decimals\n\nA fraction represents part of a whole: a/b where b != 0.\n\n### Why Dividing by a Fraction Means Multiplying by Its Reciprocal\nConsider 6 ÷ (1/2). Every single whole unit contains two halves, so 6 units contain 6 · 2 = 12 halves.\nThus: 6 ÷ (1/2) = 6 · 2 = 12.`
        },
        {
          _id: "res-g7-03",
          id: "res-g7-03",
          title: "Class 7 Mathematics: Rational Numbers & Standard Form",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Rational Numbers",
          difficulty: "Foundational",
          type: "Concept Guide",
          readTime: "5 min read",
          thumbnail: "📐",
          summary: "Understanding rational numbers p/q, positive vs negative rationals, reducing to standard form, and number line mapping.",
          formulas: [
            { name: "Standard Form", rule: "p/q with q > 0 and HCF(|p|, q) = 1", tip: "Denominator must be positive and fraction fully reduced" },
            { name: "Equivalent Rationals", rule: "(p · m) / (q · m) = p/q", tip: "Multiply numerator and denominator by same non-zero integer" }
          ],
          body: `# Chapter 3: Rational Numbers\n\nA number that can be written in the form p/q, where p and q are integers and q != 0, is called a Rational Number.\n\n### Standard Form:\n1. Denominator q is positive.\n2. The only common factor between p and q is 1.`
        },
        {
          _id: "res-g7-04",
          id: "res-g7-04",
          title: "Class 7 Mathematics: Simple Linear Equations & Transposition",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Simple Equations",
          difficulty: "Intermediate",
          type: "Formula Sheet",
          readTime: "5 min read",
          thumbnail: "⚖️",
          summary: "Balance scale method vs transposition method for solving one-variable linear equations.",
          formulas: [
            { name: "Transposition Rule", rule: "ax + b = c => ax = c - b => x = (c - b) / a", tip: "Changing sides changes sign: + becomes -, · becomes ÷" },
            { name: "Additive Inversion", rule: "x - k = m => x = m + k", tip: "Add k to both sides" }
          ],
          body: `# Chapter 4: Simple Equations\n\nAn equation is a statement that two mathematical expressions are equal.\n\n### Transposition Method:\n* A + term becomes - upon transposition.\n* A - term becomes + upon transposition.\n* A · factor becomes ÷ upon transposition.`
        },
        {
          _id: "res-g7-05",
          id: "res-g7-05",
          title: "Class 7 Mathematics: Lines, Angles & Transversal Properties",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Lines and Angles",
          difficulty: "Intermediate",
          type: "Concept Guide",
          readTime: "6 min read",
          thumbnail: "📐",
          summary: "Complementary, supplementary, linear pairs, vertically opposite angles, and parallel lines cut by a transversal.",
          formulas: [
            { name: "Complementary Angles", rule: "∠A + ∠B = 90°", tip: "Two angles whose sum is 90 degrees" },
            { name: "Supplementary Angles", rule: "∠A + ∠B = 180°", tip: "Two angles whose sum is 180 degrees" },
            { name: "Vertically Opposite", rule: "∠1 = ∠3 and ∠2 = ∠4", tip: "Opposite angles formed by two intersecting lines are equal" }
          ],
          body: `# Chapter 5: Lines and Angles\n\n### Angle Pairs:\n* Complementary: sum = 90°\n* Supplementary: sum = 180°\n* Vertically opposite angles are equal.\n\n### Transversal on Parallel Lines:\n* Alternate interior angles are equal.\n* Corresponding angles are equal.\n* Co-interior angles sum to 180°.`
        },
        {
          _id: "res-g7-06",
          id: "res-g7-06",
          title: "Class 7 Mathematics: Triangles & Pythagoras Theorem",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Triangles and Properties",
          difficulty: "Intermediate",
          type: "Concept Guide",
          readTime: "7 min read",
          thumbnail: "🔺",
          summary: "Medians, altitudes, angle sum property, exterior angle theorem, triangle inequality, and Pythagoras theorem.",
          formulas: [
            { name: "Angle Sum Property", rule: "∠A + ∠B + ∠C = 180°", tip: "Total measure of three interior angles of a triangle is 180°" },
            { name: "Pythagoras Theorem", rule: "Hypotenuse² = Base² + Altitude²", tip: "In right-angled triangle: c² = a² + b²" }
          ],
          body: `# Chapter 6: The Triangle and Its Properties\n\n### Angle Sum Property:\nThe sum of the three interior angles of a triangle is always 180°.\n\n### Pythagoras Property:\nIn any right-angled triangle with legs a, b and hypotenuse c:\nc² = a² + b²`
        },
        {
          _id: "res-g7-07",
          id: "res-g7-07",
          title: "Class 7 Mathematics: Comparing Quantities, Percentages & Simple Interest",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Comparing Quantities",
          difficulty: "Intermediate",
          type: "Formula Sheet",
          readTime: "6 min read",
          thumbnail: "📊",
          summary: "Ratios, percentage conversions, profit & loss formulas, and calculating simple interest.",
          formulas: [
            { name: "Percentage Formula", rule: "% = (Part / Whole) · 100", tip: "Convert fraction or decimal to percentage" },
            { name: "Simple Interest", rule: "I = (P · R · T) / 100", tip: "P = Principal, R = Rate %, T = Time in years" },
            { name: "Total Amount", rule: "A = P + I", tip: "Total sum repaid at end of loan period" }
          ],
          body: `# Chapter 7: Comparing Quantities\n\n### Profit and Loss:\n* Profit = SP - CP\n* Loss = CP - SP\n* Profit % = (Profit / CP) · 100\n\n### Simple Interest:\nI = (P · R · T) / 100\nTotal Amount A = P + I`
        },
        {
          _id: "res-g7-08",
          id: "res-g7-08",
          title: "Class 7 Mathematics: Algebraic Expressions & Terms",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Algebraic Expressions",
          difficulty: "Foundational",
          type: "Concept Guide",
          readTime: "5 min read",
          thumbnail: "🧩",
          summary: "Terms, factors, numerical coefficients, like vs unlike terms, and evaluating algebraic expressions.",
          formulas: [
            { name: "Combining Like Terms", rule: "ax + bx = (a + b)x", tip: "Only terms with exact same variable powers can be added" }
          ],
          body: `# Chapter 8: Algebraic Expressions\n\nAn algebraic expression is formed from variables and constants.\n\n### Like vs Unlike Terms:\n* Like terms have identical algebraic factors: 3x² and 5x².\n* Unlike terms have different factors: 3x and 3y.`
        },
        {
          _id: "res-g7-09",
          id: "res-g7-09",
          title: "Class 7 Mathematics: Exponents & Powers Laws",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Exponents and Powers",
          difficulty: "Intermediate",
          type: "Formula Sheet",
          readTime: "5 min read",
          thumbnail: "⚡",
          summary: "The 6 fundamental laws of indices and expressing numbers in scientific standard form.",
          formulas: [
            { name: "Product of Powers", rule: "aᵐ · aⁿ = aᵐ⁺ⁿ", tip: "Add exponents when multiplying powers of the same base" },
            { name: "Quotient of Powers", rule: "aᵐ / aⁿ = aᵐ⁻ⁿ", tip: "Subtract exponents when dividing powers of the same base" },
            { name: "Power of a Power", rule: "(aᵐ)ⁿ = aᵐ·ⁿ", tip: "Multiply powers" }
          ],
          body: `# Chapter 9: Exponents and Powers\n\n### Laws of Exponents:\n1. aᵐ · aⁿ = aᵐ⁺ⁿ\n2. aᵐ ÷ aⁿ = aᵐ⁻ⁿ\n3. (aᵐ)ⁿ = aᵐ·ⁿ\n4. a⁰ = 1`
        },
        {
          _id: "res-g7-10",
          id: "res-g7-10",
          title: "Class 7 Mathematics: Perimeter & Area of Plane Figures",
          subject: "Mathematics",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "Perimeter and Area",
          difficulty: "Intermediate",
          type: "Formula Sheet",
          readTime: "6 min read",
          thumbnail: "📏",
          summary: "Formulas for perimeter and area of squares, rectangles, parallelograms, triangles, and circles.",
          formulas: [
            { name: "Rectangle", rule: "Area = l · b, Perimeter = 2(l + b)", tip: "Length times breadth" },
            { name: "Square", rule: "Area = s², Perimeter = 4s", tip: "Side squared" },
            { name: "Circle Circumference", rule: "C = 2 · π · r", tip: "π ≈ 22/7 or 3.14" },
            { name: "Circle Area", rule: "A = π · r²", tip: "π times radius squared" }
          ],
          body: `# Chapter 10: Perimeter and Area\n\n* Rectangle Area = l · b\n* Parallelogram Area = b · h\n* Triangle Area = (1/2) · b · h\n* Circle Circumference = 2πr\n* Circle Area = πr²`
        },
        {
          _id: "res-07",
          id: "res-07",
          title: "Greenwood Public School — CBSE Official Curriculum Class VII (2026–2027)",
          subject: "All",
          grade: 7,
          gradeLevel: 7,
          gradeWing: "Middle (6–8)",
          topic: "CBSE Syllabus",
          difficulty: "Foundational",
          type: "Curriculum Documents",
          readTime: "Official Syllabus",
          thumbnail: "🏛️",
          summary: "Official Greenwood Public School Class 7 CBSE curriculum syllabus overview covering Mathematics, Science, English, Social Science, and Hindi.",
          body: `# Greenwood Public School, Sector-9, Gurugram\n## Official CBSE Curriculum Structure — Class VII (Session 2026–2027)\nCBSE Affiliation: 530649 | School Code: 40643`
        }
      ];

      resources = DEFAULT_G7_RESOURCES.filter(r => {
        if (subject && subject !== 'All' && r.subject !== subject && r.subject !== 'All') return false;
        if (topic && topic !== 'All' && r.topic !== topic) return false;
        if (difficulty && difficulty !== 'All' && r.difficulty !== difficulty) return false;
        if (search && search.trim()) {
          const s = search.trim().toLowerCase();
          return r.title.toLowerCase().includes(s) || r.summary.toLowerCase().includes(s) || r.topic.toLowerCase().includes(s);
        }
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: resources.length,
      resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc Add new library resource (Teacher / Admin)
// @route POST /api/library
const addResource = async (req, res, next) => {
  try {
    const { title, subject, topic, difficulty, type, readTime, summary, body, videoUrl } = req.body;

    if (!title || !subject || !topic || !summary || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title, subject, topic, summary, and body content are required.'
      });
    }

    const resource = await LibraryResource.create({
      title: title.trim(),
      subject,
      topic: topic.trim(),
      difficulty: difficulty || 'Foundational',
      type: type || 'Article',
      readTime: readTime || '5 min read',
      summary: summary.trim(),
      body: body.trim(),
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Resource published to Reference Library successfully.',
      resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete library resource (Teacher / Admin)
// @route DELETE /api/library/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await LibraryResource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    await resource.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResources,
  addResource,
  deleteResource
};
