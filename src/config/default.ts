export default {
    db_url: 'mongodb://localhost:27017/cjournal',
    identity: 'https://identity.incart.ru/connect/userinfo',
    port: 8628,
    log_level: 'error',
    test_url: 'http://localhost:8628/api/',
    test_username: process.env.TEST_USERNAME,
    test_password: process.env.TEST_PASSWORD,
    uploads_dir: './uploads',
}
