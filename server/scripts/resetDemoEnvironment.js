/**
 * ADAPTIQ 2.0: 1-CLICK DEMO RESET & SEEDING UTILITY
 * Prepares the AdaptIQ platform for live demonstration at Asian Public School.
 * 
 * Usage:
 *   node server/scripts/resetDemoEnvironment.js
 */

const { resetToBaseline } = require('../services/syntheticStore');
const { runDataValidation } = require('./validateSimulationData');

function resetDemoEnvironment() {
  console.log('================================================================');
  console.log('🏫 ADAPTIQ 2.0 — DEMO RESET & INSTITUTIONAL SEEDING UTILITY');
  console.log('   Target: Asian Public School, Sohna, Gurugram, Haryana');
  console.log('   Official CBSE Affiliation: 530587 | School Code: 40571');
  console.log('================================================================');

  console.log('\n[1/3] Resetting synthetic store to pristine baseline...');
  resetToBaseline();
  console.log('  -> Synthetic store re-seeded successfully.');

  console.log('\n[2/3] Executing strict data validation audit...');
  const audit = runDataValidation();
  if (!audit.success) {
    console.error('❌ Data audit failed! Check generator scripts.');
    process.exit(1);
  }

  console.log('\n[3/3] Demonstration Credentials & Institutional Access Summary:');
  console.log('----------------------------------------------------------------');
  console.log('🏛️  INSTITUTION TENANT:');
  console.log('    Name:         Asian Public School — AdaptIQ Demonstration Environment');
  console.log('    Location:     Sohna, Gurugram, Haryana');
  console.log('    Code:         APS-2026-DEMO (School Code: 40571)');
  console.log('    Affiliation:  CBSE Affiliation 530587');
  console.log('    Session:      2026–2027 Academic Year');
  console.log('\n👤 1. PRINCIPAL / ADMINISTRATOR ACCOUNT:');
  console.log('    Role:         Institutional Administrator');
  console.log('    Name:         Dr. S. K. Sharma (Principal)');
  console.log('    Email:        principal@asianpublicschool.edu');
  console.log('    Password:     admin123');
  console.log('    Access:       Full School Analytics, Teacher Assignment, Multi-Grade Curriculum');
  console.log('\n👩‍🏫 2. CERTIFIED TEACHER ACCOUNT:');
  console.log('    Role:         Teacher / Faculty');
  console.log('    Name:         Mrs. Ananya Sharma (Head of Mathematics)');
  console.log('    Email:        sharma.math@asianpublicschool.edu');
  console.log('    Password:     teacher123');
  console.log('    Classrooms:   Grade 7-A (Math), Grade 8-A (Math)');
  console.log('    Join Codes:   APS7AM (Grade 7-A), APS8AM (Grade 8-A)');
  console.log('    Tools:        Assessment Builder, Live Test Centre, Descriptive Grading');
  console.log('\n🎓 3. STUDENT DEMO ACCOUNT:');
  console.log('    Role:         Student (Top Performer Tier)');
  console.log('    Name:         Aarav Patel');
  console.log('    Roll Number:  APS-07-001');
  console.log('    PIN:          1234');
  console.log('    Classroom:    Grade 7-A (Classroom ID: cls-07-a)');
  console.log('    Profile:      88% Historical Accuracy, BKT Mastery 0.88');
  console.log('\n🎓 4. STUDENT INTERVENTION ACCOUNT (Demonstrating Learning Gaps):');
  console.log('    Role:         Student (Intervention Required Tier)');
  console.log('    Name:         Rohan Gupta');
  console.log('    Roll Number:  APS-07-003');
  console.log('    PIN:          1234');
  console.log('    Weak Topics:  Rational Numbers & Sign Rules, Fraction Operations');
  console.log('    Profile:      52% Historical Accuracy, BKT Mastery 0.48');
  console.log('\n📋 5. READY-TO-LAUNCH ASSESSMENTS:');
  console.log('    - Diagnostic Pre-Test (Grade 7):  asm-g7-pre (12 STEM items: 6 Math + 6 Sci)');
  console.log('    - Diagnostic Post-Test (Grade 7): asm-g7-post (12 equivalent disjoint items)');
  console.log('    - Live Invigilation Demo:         Open Live Test Centre in Teacher Command Centre');
  console.log('================================================================');
  console.log('🚀 SYSTEM READY FOR LIVE INSTITUTIONAL DEMONSTRATION');
  console.log('================================================================\n');
}

if (require.main === module) {
  resetDemoEnvironment();
}

module.exports = { resetDemoEnvironment };

