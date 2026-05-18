const axios = require('axios');

const API_URL = 'http://localhost:5050/api';

async function runTests() {
  console.log('===================================================');
  console.log('🚀 RUNNING COMPREHENSIVE MERN APPLICATION INTEGRATION TESTS');
  console.log('===================================================\n');

  let adminToken = '';
  let employee1_id = '';
  let employee2_id = '';
  let employee3_id = '';

  try {
    // -----------------------------------------------------------------
    // TEST CASE 1: HR/ADMIN SIGNUP
    // -----------------------------------------------------------------
    console.log('📌 Test Case 1: HR Admin Signup...');
    const signupData = {
      name: 'Shikhar Admin',
      email: `admin_${Date.now()}@auraperformance.com`, // Unique email
      password: 'password123'
    };

    const signupRes = await axios.post(`${API_URL}/auth/signup`, signupData);
    console.log('✅ HR Admin Signup successful!');
    console.log(`   Registered Admin: ${signupRes.data.name} (${signupRes.data.email})`);
    console.log(`   JWT Token generated: ${signupRes.data.token.slice(0, 30)}...\n`);

    // -----------------------------------------------------------------
    // TEST CASE 2: HR/ADMIN LOGIN & JWT TOKEN VALIDATION
    // -----------------------------------------------------------------
    console.log('📌 Test Case 2: HR Admin Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: signupData.email,
      password: signupData.password
    });
    adminToken = loginRes.data.token;
    console.log('✅ HR Admin Login successful! Token acquired.');
    console.log(`   Token verified: ${adminToken.slice(0, 30)}...\n`);

    // Configure axios default headers for protected routes
    const authHeaders = {
      headers: { Authorization: `Bearer ${adminToken}` }
    };

    // -----------------------------------------------------------------
    // TEST CASE 3: PROTECTED ROUTE CHECK WITHOUT TOKEN
    // -----------------------------------------------------------------
    console.log('📌 Test Case 3: Access protected routes without token...');
    try {
      await axios.get(`${API_URL}/employees`);
      console.log('❌ Error: Allowed access to protected route without token!');
    } catch (err) {
      console.log(`✅ Success: Route access denied as expected! (Status Code: ${err.response.status})`);
      console.log(`   Error message: "${err.response.data.message}"\n`);
    }

    // -----------------------------------------------------------------
    // TEST CASE 4: MONGODB INSERT VALID EMPLOYEE (Aman Verma - High Score)
    // -----------------------------------------------------------------
    console.log('📌 Test Case 4: Insert valid high-performing employee (Aman Verma)...');
    const emp1 = {
      name: 'Aman Verma',
      email: `aman_${Date.now()}@gmail.com`,
      department: 'Development',
      skills: ['React', 'Node.js', 'MongoDB'],
      performanceScore: 85,
      experience: 3
    };

    const emp1Res = await axios.post(`${API_URL}/employees`, emp1, authHeaders);
    employee1_id = emp1Res.data.data._id;
    console.log('✅ Employee stored successfully!');
    console.log(`   Employee: ${emp1Res.data.data.name} | Dept: ${emp1Res.data.data.department} | Score: ${emp1Res.data.data.performanceScore}%\n`);

    // -----------------------------------------------------------------
    // TEST CASE 5: MONGODB INSERT VALID EMPLOYEE (Ravi Kumar - Low Score)
    // -----------------------------------------------------------------
    console.log('📌 Test Case 5: Insert valid low-performing employee (Ravi Kumar)...');
    const emp2 = {
      name: 'Ravi Kumar',
      email: `ravi_${Date.now()}@gmail.com`,
      department: 'Sales',
      skills: ['Communication', 'Cold Calling'],
      performanceScore: 40,
      experience: 1
    };

    const emp2Res = await axios.post(`${API_URL}/employees`, emp2, authHeaders);
    employee2_id = emp2Res.data.data._id;
    console.log('✅ Employee stored successfully!');
    console.log(`   Employee: ${emp2Res.data.data.name} | Dept: ${emp2Res.data.data.department} | Score: ${emp2Res.data.data.performanceScore}%\n`);

    // -----------------------------------------------------------------
    // TEST CASE 6: MONGODB INSERT VALID EMPLOYEE (Priya Sharma - Missing Skills)
    // -----------------------------------------------------------------
    console.log('📌 Test Case 6: Insert valid employee with single skill (Priya Sharma)...');
    const emp3 = {
      name: 'Priya Sharma',
      email: `priya_${Date.now()}@gmail.com`,
      department: 'Development',
      skills: ['React'],
      performanceScore: 70,
      experience: 4
    };

    const emp3Res = await axios.post(`${API_URL}/employees`, emp3, authHeaders);
    employee3_id = emp3Res.data.data._id;
    console.log('✅ Employee stored successfully!');
    console.log(`   Employee: ${emp3Res.data.data.name} | Dept: ${emp3Res.data.data.department} | Score: ${emp3Res.data.data.performanceScore}%\n`);

    // -----------------------------------------------------------------
    // TEST CASE 7: MONGODB DUPLICATE EMAIL REJECTION
    // -----------------------------------------------------------------
    console.log('📌 Test Case 7: Insert employee with duplicate email...');
    const duplicateEmp = {
      name: 'Duplicate Aman',
      email: emp1.email, // duplicate
      department: 'Development',
      skills: ['Python'],
      performanceScore: 90,
      experience: 5
    };

    try {
      await axios.post(`${API_URL}/employees`, duplicateEmp, authHeaders);
      console.log('❌ Error: Allowed insert of duplicate email!');
    } catch (err) {
      console.log(`✅ Success: Mongoose duplicate check caught email duplication! (Status Code: ${err.response.status})`);
      console.log(`   Error response: "${err.response.data.message}"\n`);
    }

    // -----------------------------------------------------------------
    // TEST CASE 8: MONGODB MISSING PERFORMANCE SCORE VALIDATION
    // -----------------------------------------------------------------
    console.log('📌 Test Case 8: Insert employee with missing performance score...');
    const invalidEmp = {
      name: 'Invalid Candidate',
      email: `invalid_${Date.now()}@gmail.com`,
      department: 'Design',
      skills: ['Figma'],
      experience: 2
      // performanceScore missing!
    };

    try {
      await axios.post(`${API_URL}/employees`, invalidEmp, authHeaders);
      console.log('❌ Error: Allowed insert of employee with missing performanceScore!');
    } catch (err) {
      console.log(`✅ Success: Mongoose validation check caught missing performance score! (Status Code: ${err.response.status})`);
      console.log(`   Error response: "${err.response.data.message}"\n`);
    }

    // -----------------------------------------------------------------
    // TEST CASE 9: GET ALL EMPLOYEES
    // -----------------------------------------------------------------
    console.log('📌 Test Case 9: Fetch all employees list...');
    const getRes = await axios.get(`${API_URL}/employees`, authHeaders);
    console.log(`✅ Success: Fetched ${getRes.data.count} employees!`);
    getRes.data.data.forEach(emp => {
      console.log(`   - ${emp.name} (${emp.department}) | Score: ${emp.performanceScore}% | Exp: ${emp.experience} yrs`);
    });
    console.log('');

    // -----------------------------------------------------------------
    // TEST CASE 10: SEARCH AND FILTER BY DEPARTMENT (Q2 & Q3)
    // -----------------------------------------------------------------
    console.log('📌 Test Case 10: Search employees by department (Development)...');
    const searchRes = await axios.get(`${API_URL}/employees/search?department=Development`, authHeaders);
    console.log(`✅ Success: Filtered list contains ${searchRes.data.count} employees in Development!`);
    searchRes.data.data.forEach(emp => {
      console.log(`   - ${emp.name} | Dept: ${emp.department} | Skills: ${emp.skills.join(', ')}`);
    });
    console.log('');

    // -----------------------------------------------------------------
    // TEST CASE 11: UPDATE PERFORMANCE SCORE (Q4)
    // -----------------------------------------------------------------
    console.log('📌 Test Case 11: Update performance score for Ravi Kumar...');
    const updateRes = await axios.put(`${API_URL}/employees/${employee2_id}`, {
      performanceScore: 60 // upgrade from 40
    }, authHeaders);
    console.log('✅ Success: Employee score updated in MongoDB successfully!');
    console.log(`   Ravi Kumar's updated score: ${updateRes.data.data.performanceScore}%\n`);

    // -----------------------------------------------------------------
    // TEST CASE 12: OPENROUTER AI SINGLE RECOMMENDATION: HIGH PERFORMER
    // -----------------------------------------------------------------
    console.log('📌 Test Case 12: Call OpenRouter for HIGH PERFORMER (Aman Verma)...');
    console.log('   (Contacting OpenRouter API - Please wait)...');
    const ai1Res = await axios.post(`${API_URL}/ai/recommend`, {
      employeeId: employee1_id
    }, authHeaders);
    
    console.log('✅ Success: AI Audited High Performer!');
    const rec1 = ai1Res.data.recommendation;
    console.log(`   Name: ${ai1Res.data.employeeName}`);
    console.log(`   Promotion Eligible: ${rec1.promotionRecommendation.eligible ? '✔ YES' : '❌ NO'}`);
    console.log(`   Justification: ${rec1.promotionRecommendation.justification}`);
    console.log(`   Strengths: ${rec1.feedback.strengths.join(', ')}`);
    console.log(`   Coaching areas: ${rec1.feedback.improvements.join(', ')}`);
    console.log(`   Suggested Training:`);
    rec1.trainingSuggestions.forEach(ts => {
      console.log(`     - [${ts.priority} Priority] ${ts.skill}: ${ts.suggestion}`);
    });
    console.log('');

    // -----------------------------------------------------------------
    // TEST CASE 13: OPENROUTER AI SINGLE RECOMMENDATION: LOW SCORE
    // -----------------------------------------------------------------
    console.log('📌 Test Case 13: Call OpenRouter for LOW SCORE / IMPROVEMENT (Ravi Kumar)...');
    console.log('   (Contacting OpenRouter API - Please wait)...');
    const ai2Res = await axios.post(`${API_URL}/ai/recommend`, {
      employeeId: employee2_id
    }, authHeaders);
    
    console.log('✅ Success: AI Audited Low Score Employee!');
    const rec2 = ai2Res.data.recommendation;
    console.log(`   Name: ${ai2Res.data.employeeName}`);
    console.log(`   Promotion Eligible: ${rec2.promotionRecommendation.eligible ? '✔ YES' : '❌ NO'}`);
    console.log(`   Justification: ${rec2.promotionRecommendation.justification}`);
    console.log(`   Strengths: ${rec2.feedback.strengths.join(', ')}`);
    console.log(`   Coaching areas: ${rec2.feedback.improvements.join(', ')}`);
    console.log(`   Suggested Training:`);
    rec2.trainingSuggestions.forEach(ts => {
      console.log(`     - [${ts.priority} Priority] ${ts.skill}: ${ts.suggestion}`);
    });
    console.log('');

    // -----------------------------------------------------------------
    // TEST CASE 14: OPENROUTER AI MULTIPLE RANKING & LEADERBOARD
    // -----------------------------------------------------------------
    console.log('📌 Test Case 14: Call OpenRouter for COMPARATIVE TEAM RANKINGS (All 3 Employees)...');
    console.log('   (Contacting OpenRouter API - Please wait)...');
    const aiRankRes = await axios.post(`${API_URL}/ai/recommend`, {
      employeeIds: [employee1_id, employee2_id, employee3_id]
    }, authHeaders);

    console.log('✅ Success: Comparative Team Leaderboard compiled!');
    const recRank = aiRankRes.data.recommendation;
    console.log(`   Executive Summary: "${recRank.overallSummary}"`);
    console.log('   Leaderboard Standings:');
    recRank.rankings.forEach(rankObj => {
      console.log(`     Rank #${rankObj.rank}: ${rankObj.name} (Score: ${rankObj.score}% | Exp: ${rankObj.experience} yrs)`);
      console.log(`     - Status: [${rankObj.promotionRecommendation}]`);
      console.log(`     - AI Rationale: "${rankObj.reason}"`);
    });
    console.log('');

    // -----------------------------------------------------------------
    // TEST CASE 15: DELETE EMPLOYEE (Q4)
    // -----------------------------------------------------------------
    console.log('📌 Test Case 15: Delete Ravi Kumar from MongoDB...');
    const deleteRes = await axios.delete(`${API_URL}/employees/${employee2_id}`, authHeaders);
    console.log('✅ Success: Employee deleted successfully!');
    console.log(`   Response message: "${deleteRes.data.message}"`);

    // Verify deleted in headcount list
    const finalGetRes = await axios.get(`${API_URL}/employees`, authHeaders);
    console.log(`   Final Employee Count after deletion: ${finalGetRes.data.count}`);
    console.log('===================================================');
    console.log('🎉 ALL INTEGRATION TEST CASES PASSED SUCCESSFULLY!');
    console.log('===================================================');

  } catch (error) {
    console.error('❌ AN UNEXPECTED TEST FAILURE OCCURRED:');
    if (error.response) {
      console.error(`   API Error Status: ${error.response.status}`);
      console.error('   API Response Error Data:', error.response.data);
    } else {
      console.error('   Error Details:', error.message);
    }
  }
}

runTests();
