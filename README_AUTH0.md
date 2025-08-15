# Auth0 Integration Guide

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new Application (Regular Web App)
3. Set Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
4. Set Allowed Logout URLs: `http://localhost:3000`
5. Set Allowed Web Origins: `http://localhost:3000`
6. Copy your Domain, Client ID, and Client Secret to `.env.local`
7. Set a random string for AUTH0_SECRET (e.g. `openssl rand -hex 32`)
8. Use the `withAdmin` HOC for admin-only pages. Customize the role/email check as needed.
9. Use `/api/auth/login` and `/api/auth/logout` for login/logout flows.

See https://auth0.com/docs/quickstart/webapp/nextjs for more details.
