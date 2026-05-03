const toNumber = (decimal128) => parseFloat(decimal128.toString());

// 2026 SIO Rates
const RATES = {
  bahraini: { employer: 0.18, employee: 0.08 },
  expat: { year1to3: 0.042, year4plus: 0.084 },
};

exports.calculateSIO = (employee, payroll) => {
  const basic = toNumber(payroll.basicSalary);
  const years = employee.yearsOfService || 0;

  if (employee.isBahraini) {
    return {
      employerContribution: +(basic * RATES.bahraini.employer).toFixed(3),
      employeeDeduction:    +(basic * RATES.bahraini.employee).toFixed(3),
      type: 'SIO_BAHRAINI',
    };
  } else {
    const rate = years < 4 ? RATES.expat.year1to3 : RATES.expat.year4plus;
    return {
      employerContribution: +(basic * rate).toFixed(3),
      employeeDeduction:    0,
      type: 'EOSB_EXPAT',
    };
  }
};

exports.calculateOvertime = (employee, hours, isRamadan = false, isNight = false) => {
  const hourlyRate = toNumber(employee.basicSalary) / (isRamadan ? 180 : 208);
  const multiplier = isNight ? 1.5 : 1.25;
  return +(hourlyRate * multiplier * hours).toFixed(3);
};
