
Built by https://www.blackbox.ai

---

```markdown
# Share Trading API

## Project Overview
This project is a Share Trading API built using Node.js and Express. The API allows users to log in, view companies, buy shares, and manage their investment portfolios. Admin users can also add, remove, and update company information.

## Installation
To install and run the project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd share-trading-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. The API will be running at `http://localhost:3000`.

## Usage
You can interact with the API using tools like Postman or Curl. Here are some example endpoints:

- **Login**
  - `POST /api/login`
    - Request Body: 
      ```json
      {
        "username": "admin",
        "password": "adminpass"
      }
      ```
    - Response: Returns a JWT token.

- **Get Companies**
  - `GET /api/companies`
    - Response: List of all companies.

- **Admin Operations**
  - `POST /api/admin/companies`: Add a new company.
  - `DELETE /api/admin/companies/:id`: Remove a company.
  - `PUT /api/admin/companies/:id/shares`: Update shares available for a company.

- **Buy Shares**
  - `POST /api/buy`
    - Request Body:
      ```json
      {
        "companyId": 1,
        "quantity": 10
      }
      ```
    - Response: Confirmation of share purchase and updated company data.

- **Get Portfolio**
  - `GET /api/portfolio`: Retrieve the current user's share portfolio.

## Features
- User authentication using JWT for secure access.
- Public access to view companies.
- Admin privileges for adding, removing, and updating companies.
- Share purchasing and dynamic price adjustment logic.
- User portfolio retrieval.

## Dependencies
The project employs the following dependencies listed in `package.json`:

- `express`: A web framework for Node.js.
- `body-parser`: Middleware for parsing incoming request bodies.
- `jsonwebtoken`: Library for generating and verifying JSON Web Tokens.
- `fs`: Node.js file system module (built-in).
- `path`: Node.js path module (built-in).

## Project Structure
```
/share-trading-api
├── server.js         # Main server file containing API endpoints and logic
└── package.json      # Project dependencies and metadata
```

### Note:
To ensure proper functionality, make sure to replace `'your_secret_key'` in `server.js` with a secure secret key for JWT.

---
This README provides a comprehensive overview of the Share Trading API project. For further documentation on specific features or code, please refer to the appropriate sections in the codebase.
```