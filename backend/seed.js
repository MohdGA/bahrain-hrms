require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  const Employee = require('./models/Employee');
  await Employee.deleteMany({ employeeId: 'EMP-0001' });

  const password = await bcrypt.hash('Admin@1234', 12);

  await Employee.create({
    employeeId:  'EMP-0001',
    firstName:   'James',
    lastName:    'Franklyn',
    email:       'admin@hrms.bh',
    password,
    role:        'admin',
    department:  'Administration',
    designation: 'System Administrator',
    nationality: 'Bahraini',
    isBahraini:  true,
    joinDate:    new Date('2024-01-01'),
    cprNumber:   '900000001',
    basicSalary: mongoose.Types.Decimal128.fromString('1500.000'),
    iban:        'BH29BMAG1299123456BH00',
    bankName:    'Bank of Bahrain and Kuwait',
  });

  console.log('✅ Admin user created!');
  console.log('   Email:    admin@hrms.bh');
  console.log('   Password: Admin@1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
