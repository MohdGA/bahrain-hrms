const IBAN_REGEX = /^BH\d{2}[A-Z0-9]{4}\d{14}$/;
const CPR_REGEX  = /^\d{9}$/;

exports.validateSIFRecord = (employee, payroll) => {
  const errors = [];
  const basic = parseFloat(payroll.basicSalary.toString());

  if (!CPR_REGEX.test(employee.cprNumber)) {
    errors.push({ field: 'cprNumber', message: 'CPR must be exactly 9 digits' });
  }

  if (!IBAN_REGEX.test(employee.iban)) {
    errors.push({ field: 'iban', message: 'IBAN must start with BH and follow BH29BMAG format' });
  }

  if (basic <= 0) {
    errors.push({ field: 'basicSalary', message: 'Basic salary must be greater than 0' });
  }

  if (!employee.bankName) {
    errors.push({ field: 'bankName', message: 'Bank name is required for WPS' });
  }

  return errors;
};

exports.validateCPR = (cpr) => CPR_REGEX.test(cpr);
exports.validateIBAN = (iban) => IBAN_REGEX.test(iban);
