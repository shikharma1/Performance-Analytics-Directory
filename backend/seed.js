require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const connectDB = require('./config/db');

const initialEmployees = [
  {
    name: 'Aman Verma',
    email: 'aman.verma@gmail.com',
    department: 'Development',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    performanceScore: 85,
    experience: 3,
  },
  {
    name: 'Ravi Kumar',
    email: 'ravi.kumar@gmail.com',
    department: 'Sales',
    skills: ['Communication', 'Cold Calling', 'Negotiation', 'Lead Generation'],
    performanceScore: 40,
    experience: 1,
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    department: 'Development',
    skills: ['React', 'HTML5', 'CSS3', 'JavaScript'],
    performanceScore: 70,
    experience: 4,
  },
  {
    name: 'Shreya Sen',
    email: 'shreya.sen@gmail.com',
    department: 'Design',
    skills: ['UI/UX Design', 'Figma', 'Adobe Illustrator', 'Prototyping', 'User Research'],
    performanceScore: 92,
    experience: 5,
  },
  {
    name: 'Rohan Gupta',
    email: 'rohan.gupta@gmail.com',
    department: 'Marketing',
    skills: ['SEO', 'Google Analytics', 'Copywriting', 'Content Strategy'],
    performanceScore: 55,
    experience: 2,
  },
  {
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@gmail.com',
    department: 'Product',
    skills: ['Product Strategy', 'Agile', 'Scrum', 'Roadmapping', 'Market Analysis'],
    performanceScore: 88,
    experience: 6,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to Database
    await connectDB();

    console.log('🧹 Clearing existing employee records...');
    await Employee.deleteMany({});
    console.log('✅ Existing employee records cleared!');

    console.log('🌱 Seeding initial employee records into MongoDB...');
    const createdEmployees = await Employee.create(initialEmployees);
    console.log(`✅ Successfully seeded ${createdEmployees.length} employees into the database!`);
    
    createdEmployees.forEach(emp => {
      console.log(`   - ${emp.name} | Dept: ${emp.department} | Score: ${emp.performanceScore}% | Experience: ${emp.experience} yrs`);
    });

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
