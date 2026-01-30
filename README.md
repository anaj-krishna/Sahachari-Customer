# SAHACHARI Customer App

A React Native (Expo) mobile app for customers of the SAHACHARI delivery service.

## Current Features
- User registration (with name, email, address, serviceable pincodes, password)
- User login
- Token-based authentication (persisted via AsyncStorage)
- Protected home screen with logout
- Role check (only `USER` role allowed in this customer app)
- Basic form validation & error display

## Tech Stack
- React Native + Expo
- Expo Router (file-based routing)
- TanStack Query (for API mutations)
- Zustand (lightweight auth state management)
- Axios (API client)
- AsyncStorage (token & user persistence)
- Tailwind CSS via `nativewind`


## Setup & Run

```bash
# Install dependencies
npm install

# Start development server
npx expo start
# or
npm run start

# Clear cache if needed
npx expo start -c

Backend API: Currently points to http://localhost:3000 → change to production URL in services/api.ts before building.
Only USER role is accepted in this app version.