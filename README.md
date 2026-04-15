# Retail Inventory Management System

A full-stack web Inventory Management System for retail operations.

Stack:
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT with role-based access (Admin and Staff)

## What Is Implemented

- Authentication and authorization
	- Signup, login, current user endpoint
	- Roles: Admin, Staff
	- Permission middleware for protected APIs

- Product management
	- Product CRUD endpoints
	- Search and filter support
	- Barcode and QR generation endpoints

- Inventory management
	- Real-time quantity updates
	- Manual stock adjustments (including damaged/lost style adjustments)
	- Low-stock query endpoint
	- Stock movement history collection

- Sales and billing
	- Sales transaction creation and finalization
	- GST and discount calculations
	- Payment methods: Cash, UPI, Card, Credit
	- Invoice PDF download endpoint
	- Credit limit enforcement for credit sales

- Purchase management
	- Purchase creation and listing
	- Auto stock increment on purchase

- Customer and supplier management
	- CRUD-style list/create/update flows
	- History endpoints

- Reports and analytics
	- Dashboard summary API (daily/weekly/monthly/yearly range)
	- Stock report
	- Fast/slow movement report
	- Sales CSV export

- Utilities and security
	- Input validation
	- Centralized error handling
	- Basic audit log entries
	- Environment-based configuration

## Project Structure

		backend/
			src/
				config/
				controllers/
				middleware/
				models/
				routes/
				services/
				scripts/
				utils/
		frontend/
			src/
				components/
				context/
				hooks/
				pages/
				services/
				utils/

## Prerequisites

- Node.js 20 or above
- npm 10 or above
- MongoDB Community Server (local) OR MongoDB Atlas connection

## First-Time Setup (Recommended Local Flow)

1. Clone/open this project and install dependencies.

Backend:

		cd backend
		npm install

Frontend:

		cd frontend
		npm install

2. Create environment files.

Backend file:

		backend/.env

Frontend file:

		frontend/.env

Copy from examples and update values.

3. Set Mongo connection in backend env.

For local MongoDB:

		MONGO_URI=mongodb://127.0.0.1:27017/ims_db

For Atlas:

		MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/ims_db?retryWrites=true&w=majority

4. Start backend.

		cd backend
		npm run dev

5. Start frontend in another terminal.

		cd frontend
		npm run dev

## URLs

- Frontend: http://localhost:5173
- Backend API base: http://localhost:5000/api/v1
- Backend health: http://localhost:5000/api/health

## Seed Demo Data (25 records each major module)

To quickly fill all tabs and reports with realistic data:

		cd backend
		npm run seed

Seed creates and simulates data for:
- Users: 25
- Products: 25
- Inventory: 25
- Customers: 25
- Suppliers: 25
- Purchases: 25
- Sales: 25
- Stock movements and audit logs

Important:
- Seed clears and recreates demo data in core collections.
- Run only when you want a fresh dataset.

## Demo Login Credentials After Seed

- Admin
	- Email: admin@test.com
	- Password: password123

- Staff examples
	- Email: staff1@test.com
	- Password: password123

## Quick Simulation Checklist

1. Login as Admin.
2. Open Products tab and verify product rows exist.
3. Open Inventory tab and verify quantities and stock states.
4. Open Customers and Suppliers tabs and verify lists.
5. Open Purchases tab and verify generated entries.
6. Open Sales tab and verify finalized invoices.
7. Open Reports tab and export CSV.
8. Login as Staff and verify restricted capabilities.

## Available Backend Scripts

In backend:

- Development server

			npm run dev

- Production start

			npm run start

- Seed and simulate

			npm run seed

## Environment Reference

Backend variables:
- NODE_ENV
- PORT
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- DEFAULT_GST_RATE
- INVOICE_PREFIX
- INVOICE_DIGITS
- CLIENT_URL

Frontend variables:
- VITE_API_URL

## Docker Note

The project contains docker-compose scaffolding, but for backend container-to-mongo connection you must use service hostname in backend env:

		MONGO_URI=mongodb://mongo:27017/ims_db

If you use localhost inside backend container, Mongo connection will fail.

## Troubleshooting

1. Signup/Login returns 500
- Ensure backend is running and connected to Mongo.
- Check backend console logs.
- Confirm JWT_SECRET is set in backend env.

2. UI loads without styles
- Run frontend install again.

			cd frontend
			npm install

- Restart frontend dev server.
- Hard refresh browser (Ctrl + Shift + R).

3. Backend starts but frontend cannot call APIs
- Verify frontend env has:

			VITE_API_URL=http://localhost:5000/api/v1

- Restart frontend after env changes.

4. Seed command fails
- Ensure Mongo is reachable via MONGO_URI.
- Ensure no other process is locking files during npm operations.

## Current Scope Notes

Implemented as production-style foundation with core modules active.
Planned next iterations can include advanced returns workflow, richer notifications UX, and deeper payment ledger UI.
