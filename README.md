# Bahrain HRMS — WPS 2.0 Compliant

A full-stack HR Management System for the Bahrain Private Sector, compliant with Labour Law No. 36 of 2012 and 2026 WPS 2.0 mandates.

## Stack
- **Frontend**: React (Vite) + Tailwind CSS + i18next (Arabic/English)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (Mongoose, Decimal128 for BHD)

## Quick Start

### Backend
```bash
cd backend
npm install
# Add your values to .env (copy from .env.example)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Compliance Modules
- ✅ WPS 2.0 — SIF file generation, Maker-Checker-WRP pipeline, Fawri Transfer
- ✅ SIO/GOSI 2026 — 18%+8% Bahraini, 4.2%/8.4% Expat EOSB
- ✅ PDPL — Field-level encryption (CPR, Salary, Address), Audit logs
- ✅ Bahrainisation quota tracker
- ✅ Document expiry radar (CPR, Passport, Work Permit)
- ✅ Bilingual UI (Arabic RTL / English)

## Environment Variables
See `backend/.env.example`
