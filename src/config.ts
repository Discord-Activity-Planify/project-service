const { SERVER_HOST, SERVER_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_HOST, DATABASE_PORT } = process.env


if ( SERVER_PORT === undefined || SERVER_HOST === undefined || DATABASE_USERNAME === undefined || DATABASE_PASSWORD === undefined || DATABASE_NAME === undefined || DATABASE_HOST === undefined || DATABASE_PORT === undefined) {
    console.log('No ENV')
    process.exit(1)
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
}