# CJournal API

## Technology stack

built using `typescript`, `node`, `express`

`mongodb` for database

`Microsoft Identity Server` for authorization is required

## Config

Requires `.env` file in root directory.

-   `NODE_ENV` Options supported: _development_, _production_ and _docker_
-   `MONGO_DB` mongoDB connection url
-   `LOG_LEVEL` winston log level
-   `TEST_USERNAME` (optional) identity username (only to runtests)
-   `TEST_PASSWORD` (optional) identity password (only to runtests)

## Running

`npm install`

`npm start`

`npm run test` for testing

## Authorization

Using Identity Server protocol

headers: { Authorization: "Bearer {{token}} }

## Endpoints

**users:**

-   `GET `/api/users/
-   `GET` /api/users/:id
-   `PUT` /api/users/:id

**patient**

-   `GET `/api/patients/
-   `GET` /api/patients/:id
-   `PUT` /api/patients/:id

**idinv**

-   `GET `/api/idinv/
-   `GET` /api/idinv/:idinv

**activity**

-   `GET `/api/users/:id/activity
-   `GET `/api/patients/:id/activity
-   `GET `/api/idinv/:idinv/activity
-   `GET `/api/users/:id/activity/:id
-   `GET `/api/patients/:id/activity/:id
-   `GET `/api/idinv/:idinv/activity/:id
-   `POST `/api/users/:id/activity/
-   `POST `/api/patients/:id/activity
-   `POST `/api/idinv/:idinv/activity
-   `PUT `/api/users/:id/activity/:id
-   `PUT `/api/patients/:id/activity/:id
-   `PUT `/api/idinv/:idinv/activity/:id
-   `DELETE `/api/users/:id/activity/:id
-   `DELETE `/api/patients/:id/activity/:id
-   `DELETE `/api/idinv/:idinv/activity/:id

**activity history**

-   `GET `/api/users/:id/activity/history
-   `GET `/api/patients/:id/activity/history
-   `GET `/api/idinv/:idinv/activity/history
-   `GET `/api/users/:id/activity/history/:id
-   `GET `/api/patients/:id/activity/history/:id
-   `GET `/api/idinv/:idinv/activity/history/:id

**task**

-   `GET `/api/users/:id/tasks
-   `GET `/api/patients/:id/tasks
-   `GET `/api/idinv/:idinv/tasks
-   `GET `/api/users/:id/tasks/:id
-   `GET `/api/patients/:id/tasks/:id
-   `GET `/api/idinv/:idinv/tasks/:id
-   `POST `/api/users/:id/tasks/
-   `POST `/api/patients/:id/tasks
-   `POST `/api/idinv/:idinv/tasks
-   `PUT `/api/users/:id/tasks/:id
-   `PUT `/api/patients/:id/tasks/:id
-   `PUT `/api/idinv/:idinv/tasks/:id
-   `DELETE `/api/users/:id/tasks/:id
-   `DELETE `/api/patients/:id/tasks/:id
-   `DELETE `/api/idinv/:idinv/tasks/:id
