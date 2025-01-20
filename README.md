# Guide to Run the Service

This guide provides step-by-step instructions to set up and run the service.

---

## 1. Install Node.js and npm
Ensure you have Node.js and npm installed on your system. You can download and install them from [Node.js official website](https://nodejs.org/).

To verify the installation:
```bash
node -v
npm -v
```

---

## 2. Install Dependencies
Run the following command to install the required dependencies:

```bash
npm install
```

---

## 3. Set Up Configuration File
Create an `.env` file in the root of the project directory to set the environment variables. Add the following content, replacing the placeholder values with your actual configuration:

```
SERVER_HOST=localhost
SERVER_PORT=5000
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=your_database_name
DATABASE_HOST=your_database_host
DATABASE_PORT=5432
```

---

## 4. Update the Config File
Ensure the `config.js` file is correctly set up to read environment variables from the `.env` file.

Example `config.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

const { SERVER_HOST, SERVER_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_HOST, DATABASE_PORT } = process.env;

if (!SERVER_PORT || !SERVER_HOST || !DATABASE_USERNAME || !DATABASE_PASSWORD || !DATABASE_NAME || !DATABASE_HOST || !DATABASE_PORT) {
    console.log('Environment variables are not properly set.');
    process.exit(1);
}

export default {
    app: {
        host: SERVER_HOST,
        port: SERVER_PORT
    },
    database: {
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        name: DATABASE_NAME,
        host: DATABASE_HOST,
        port: DATABASE_PORT
    }
};
```

---

## 5. Compile TypeScript to JavaScript
Run the following command to compile TypeScript files into JavaScript:

```bash
tsc
```

The compiled JavaScript files will be located in the `dist` directory.

---

## 6. Run the Service
Start the application using the compiled JavaScript files:

```bash
node dist
```

---
