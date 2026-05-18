const Employee = require('../models/Employee');

// @desc    Generate AI Recommendation for Single or Multiple Employees
// @route   POST /api/ai/recommend
// @access  Private
const getAiRecommendation = async (req, res, next) => {
  try {
    const { employeeId, employeeIds } = req.body;

    if (!employeeId && (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0)) {
      res.status(400);
      throw new Error('Please provide either an employeeId or an array of employeeIds');
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.AI_MODEL || 'google/gemini-2.5-flash';

    if (!apiKey) {
      res.status(500);
      throw new Error('OpenRouter API key is missing in server environment');
    }

    if (employeeId) {
      // SINGLE EMPLOYEE ANALYSIS
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        res.status(404);
        throw new Error('Employee not found');
      }

      // Construct system and user prompt for single employee
      const systemPrompt = `You are an expert HR Performance Analytics AI. Your task is to evaluate employee details and provide detailed feedback, promotion eligibility, and training recommendations.
You MUST respond with a valid, clean JSON object, matching EXACTLY this JSON structure, with no markdown code blocks or extra text:
{
  "promotionRecommendation": {
    "eligible": true/false,
    "justification": "Detailed explanation based on their performance score and experience"
  },
  "trainingSuggestions": [
    {
      "skill": "Skill Name",
      "suggestion": "Specific actionable training program/course suggestion",
      "priority": "High" or "Medium" or "Low"
    }
  ],
  "feedback": {
    "strengths": ["Strength 1", "Strength 2"],
    "improvements": ["Improvement area 1", "Improvement area 2"],
    "summary": "A cohesive qualitative paragraph summarizing their performance and growth potential."
  }
}`;

      const userPrompt = `Evaluate this employee:
Name: ${employee.name}
Department: ${employee.department}
Email: ${employee.email}
Skills: ${employee.skills.join(', ')}
Performance Score: ${employee.performanceScore}/100
Years of Experience: ${employee.experience} years

Guidelines:
1. Promotion Eligibility: If performanceScore >= 80 and experience >= 3, they are generally high candidates for promotion. If they have lower stats, explain what is missing.
2. Training Suggestions: Analyze their current skills and department. Recommend 2-3 standard skill enhancements or specific tools they are missing to excel in their department.
3. Feedback: Generate highly tailored strengths and coaching improvements based on their performance level.`;

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'Employee Analytics System'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('OpenRouter error:', data);
        res.status(response.status || 500);
        throw new Error(data.error?.message || 'Failed to generate AI recommendations');
      }

      let aiContent = data.choices[0].message.content.trim();
      // Safe clean in case model added ```json code blocks
      if (aiContent.startsWith('```json')) {
        aiContent = aiContent.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (aiContent.startsWith('```')) {
        aiContent = aiContent.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsedRecommendation = JSON.parse(aiContent);

      return res.status(200).json({
        success: true,
        type: 'single',
        employeeId: employee._id,
        employeeName: employee.name,
        recommendation: parsedRecommendation
      });

    } else {
      // MULTIPLE EMPLOYEE ANALYSIS / COMPARATIVE RANKING
      const employees = await Employee.find({ _id: { $in: employeeIds } });
      
      if (employees.length === 0) {
        res.status(404);
        throw new Error('No employees found for given IDs');
      }

      // Construct system and user prompt for ranking
      const systemPrompt = `You are a strategic HR Operations Director AI. Your task is to compare, rank, and evaluate a list of employees.
You MUST respond with a valid, clean JSON object, matching EXACTLY this JSON structure, with no markdown code blocks or extra text:
{
  "rankings": [
    {
      "rank": 1,
      "employeeId": "Mongoose ID of the employee",
      "name": "Employee Name",
      "score": 95,
      "experience": 3,
      "reason": "Detailed qualitative reason why they are in this rank position",
      "promotionRecommendation": "Promote Now" or "Growth Watchlist" or "Needs Development"
    }
  ],
  "overallSummary": "A high-level executive summary summarizing the overall team distribution, highlighting top stars and key coaching opportunities."
}`;

      const employeeDataStr = employees.map(emp => (
        `ID: ${emp._id} | Name: ${emp.name} | Dept: ${emp.department} | Skills: ${emp.skills.join(', ')} | Score: ${emp.performanceScore} | Exp: ${emp.experience} yrs`
      )).join('\n');

      const userPrompt = `Compare and rank these employees based on their performance scores, experience, and department alignment:
${employeeDataStr}

Guidelines:
1. Rank them in order from 1 (best) to N (lowest performance).
2. For each employee, generate a detailed 'reason' justifying their rank and match their 'employeeId' exactly to the ID provided.
3. Label their 'promotionRecommendation' dynamically based on their standing.`;

      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'Employee Analytics System'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('OpenRouter error:', data);
        res.status(response.status || 500);
        throw new Error(data.error?.message || 'Failed to generate AI rankings');
      }

      let aiContent = data.choices[0].message.content.trim();
      if (aiContent.startsWith('```json')) {
        aiContent = aiContent.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (aiContent.startsWith('```')) {
        aiContent = aiContent.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsedRankings = JSON.parse(aiContent);

      return res.status(200).json({
        success: true,
        type: 'multiple',
        recommendation: parsedRankings
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAiRecommendation,
};
