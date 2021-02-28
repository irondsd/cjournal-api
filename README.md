# CJournal API

## Technology stack

built using `typescript`, `node`, `express`
`mongodb` for database
`Microsoft Identity Server` for authorization is required

## Config

Requires .env file in root with:

-   `NODE_ENV` currently 3 options are supported. _development_, _production_ or _docker_
-   `MONGO_DB` mongoDB connection url
-   `LOG_LEVEL` winston log level
-   `TEST_USERNAME` (optional) identity username (only to runtests)
-   `TEST_PASSWORD` (optional) identity password (only to runtests)

## Authoriation

Using IdentityServer protocol

headers: { Authorization: "Bearer <Token>" }

**body**

-   `id` integer
-   `username` string
-   `sub` string
-   `idinv` string containing id of investigation
-   `last_seen` integer of unix timestamp format
-   `hide_elements` array of strings
-   `course_therapy` array of strings
-   `relief_of_attack` array of strings
-   `tests` array of strings

**example response**

```json
[
    {
        "id": 1,
        "sub": "b8344dff-9053-4064-9b9d-b91266ec3443",
        "username": "ggn00b",
        "idinv": "GGG_342_653_234_123",
        "hide_elements": [],
        "language": "ru",
        "last_seen": 1613311440,
        "users_id": 1,
        "course_therapy": [
            "Acetaminophen",
            "Adderall",
            "Alprazolam",
            "Amitriptyline",
            "Amlodipine",
            "Amoxicillin",
            "Ativan",
            "Atorvastatin"
        ],
        "relief_of_attack": ["pill1", "pill2", "pill3"],
        "tests": ["pill1", "pill2", "pill3"]
    }
]
```

## Activity

**Definition**

-   `GET /api/users/<id>/acivity/`
-   `GET /api/users/<id>/acivity/<id>`
-   `POST /api/users/<id>/acivity/`
-   `PUT /api/users/<id>/acivity/<id>`
-   `DELETE /api/users/<id>/acivity/<id>`
-   `PATCH /api/users/<id>/acivity/<id>`

**query options**

-   `api_key` (required) an API key
-   `from` (timestamp) shows activities from specific timestamp
-   `to` (timestamp) shows activities until specific timestamp
-   `deleted` (true, false) only shows deleted activities. Default is false
-   `uploaded` shows timestamp of sync time
-   `version` (bool) shows version of the record
-   `page` the number of page to show. Always sorted by time_started
-   `limit` limit of records per page

**responses**

-   `200` (GET) On success
-   `201` (POST, PUT) Created
-   `404` (GET, PUT, DELETE) Not found
-   `500` Internal Error

**body**

-   `id` integer
-   `users_id` integer
-   `activity_type` string
-   `time_started` integer of unix timestamp format
-   `time_ended` integer of unix timestamp format
-   `tasks_id` integer of tasks' id
-   `ref_id` refferal id, the previous version of changed activity
-   `last_updated` integer of unix timestamp format
-   `comment` string
-   `data` object with optional data

**example response**

```json
{
    "id": 3,
    "users_id": 1,
    "activity_type": "Walking",
    "time_started": 1554197138,
    "time_ended": 1554283421,
    "tasks_id": 1,
    "ref_id": 36,
    "last_updated": 1554283421,
    "comment": "easy pace",
    "data": {
        "steps": 10.3,
        "distance": 15,
        "state": "Good"
    }
}
```

## Virtual activity

**Definitions**
_queries with id from activity table_

-   `GET /api/users/<id>/acivity/`
-   `GET /api/users/<id>/acivity/<id>`
-   `POST /api/users/<id>/acivity/`
-   `PUT /api/users/<id>/acivity/<id>`
-   `DELETE /api/users/<id>/acivity/<id>`
-   `PATCH /api/users/<id>/acivity/<id>`

**Definitions** _queries with id from virtual_activity table are marked with v in front of it_

-   `GET /api/users/<id>/acivity/v<id>`
-   `PUT /api/users/<id>/acivity/v<id>`
-   `DELETE /api/users/<id>/acivity/v<id>`
-   `PATCH /api/users/<id>/acivity/v<id>`

**query options**

-   `api_key` (required) an API key
-   `from` (timestamp) shows activities from specific timestamp
-   `to` (timestamp) shows activities until specific timestamp
-   `deleted` (true, false) only shows deleted activities. Default is false
-   `uploaded` shows timestamp of sync time
-   `doctor_id` limits results for only a specific doctor id

**responses**

-   `200` (GET) On success
-   `201` (POST, PUT) Created
-   `404` (GET, PUT, DELETE) Not found
-   `500` Internal Error

**body**

-   `id` integer
-   `users_id` integer
-   `activity_id` integer
-   `doctor_id` integer
-   `activity_type` string
-   `time_started` integer of unix timestamp format
-   `time_ended` integer of unix timestamp format
-   `tasks_id` integer of tasks' id
-   `ref_id` refferal id, the previous version of changed activity
-   `set_deleted` deleted flag to mark activity as deleted
-   `last_updated` integer of unix timestamp format
-   `comment` string
-   `data` object with optional data

**example response**

```json
{
    "id": "v7",
    "activity_id": 3,
    "users_id": 1,
    "doctor_id": 3,
    "activity_type": "Walking",
    "time_started": 1554197138,
    "time_ended": 1554283421,
    "tasks_id": 3,
    "set_deleted": 0,
    "comment": "comment",
    "data": {
        "steps": 10.3,
        "distance": 13
    }
}
```

## Tasks

**Definition**

-   `GET /api/users/<id>/tasks/`
-   `GET /api/users/<id>/tasks/<id>`
-   `POST /api/users/<id>/tasks/`
-   `PUT /api/users/<id>/tasks/<id>`
-   `DELETE /api/users/<id>/tasks/<id>`
-   `PATCH /api/users/<id>/tasks/<id>`

**query options**

-   `api_key` (required) an API key
-   `from` (timestamp) shows tasks from specific timestamp
-   `to` (timestamp) shows tasks until specific timestamp
-   `deleted` (true, false) only shows deleted or not tasks. Default is false
-   `completed` (true, false) only shows completed or not tasks

**responses**

-   `200` (GET) On success
-   `201` (POST, PUT) Created
-   `404` (GET, PUT, DELETE) Not found
-   `500` Internal Error

**body**

-   `id` integer
-   `users_id` integer
-   `activity_type` string
-   `time` integer of unix timestamp format
-   `ref_id` refferal id, the previous version of changed activity
-   `last_updated` integer of unix timestamp format
-   `data` object with optional data

**example response**

```json
{
    "id": 7,
    "users_id": 1,
    "activity_type": "DeviceInstall",
    "time": 1570108904,
    "ref_id": null,
    "completed": 0,
    "data": {},
    "last_updated": 1570105214
}
```

## Prescriptions

**Definition**

-   `GET /api/users/<id>/prescriptions/`
-   `POST /api/users/<id>/prescriptions/`
-   `PUT /api/users/<id>/prescriptions/`

**query options**

-   `api_key` (required) an API key

**responses**

-   `200` (GET) On success
-   `201` (POST, PUT) Created
-   `404` (GET, PUT) Not found
-   `500` Internal Error

**body**

-   `users_id` integer
-   `course_therapy` array of strings
-   `relief_of_attack` array of strings
-   `tests` array of strings

**example response**

```json
{
    "users_id": 1,
    "course_therapy": ["Acebutolol", "Diclofenac", "Etocolac"],
    "relief_of_attack": ["Bisoprolol", "Betaxolol"],
    "tests": ["Olol", "Lolol"]
}
```

## Login

**Definition**

-   `POST /api/login`
-   `POST /api/loginqr`
-   `POST /api/qr`

**query options**

-   `api_key` (required for /api/qr) an API key

**responses**

-   `200` (POST) On success
-   `404` (POST) Not found
-   `500` Internal Error

**body for logins**

-   `username` string
-   `password` string

**example response**

```json
{
    "id": 1,
    "name": "Alexander Feldman",
    "username": "ggn00b",
    "gender": "male",
    "birthday": "10.05.1957",
    "api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicGVybWlzc2lvbnMiOjEsImlhdCI6MTU3MDUzMjUyMn0.vpkO3u795KN5W29WiTlZN9EujyUv7B6w_n33iyUre44",
    "idinv": "045_000_00107_00096.dat",
    "information": "Patient info",
    "hide_elements": [],
    "course_therapy": ["Acebutolol", "Atenolol"],
    "relief_of_attack": ["Bisoprolol", "Betaxolol"],
    "tests": ["lolol", "Propranolol"],
    "language": "ru",
    "permissions": 1
}
```

## Prescriptions

**Definition**

-   `GET /api/users/<id>/patients/`
-   `GET /api/users/<id>/doctors/`
-   `POST /api/users/<id>/patients/`
-   `DELETE /api/users/<id>/patients/`

**query options**

-   `api_key` (required) an API key

**responses**

-   `200` (GET) On success
-   `201` (POST) Created
-   `500` Internal Error

**body**

-   `patient_id` integer or an array of integers

**example response**

```json
{
    {
        "id": 1,
        "name": "Alexander Feldman",
        "birthday": "10.05.1957",
        "gender": "male",
        "username": "ggn00b",
        "idinv": "045_000_00107_00093.dat",
        "last_seen": 1570532954,
        "course_therapy": "[\"Acebutolol\",\"Atenolol\"]",
        "relief_of_attack": "[\"Bisoprolol\",\"Betaxolol\"]",
        "tests": "[\"lolol\",\"Propranolol\"]"
    },
    {
        "id": 2,
        "name": "Carl Sagan",
        "birthday": "10.05.1987",
        "gender": "male",
        "username": "ggn00b",
        "idinv": "045_000_00107_00031.dat",
        "last_seen": 1550507313,
        "course_therapy": "[\"Acebutolol\", \"Atenolol\"]",
        "relief_of_attack": "[\"Bisoprolol\", \"Betaxolol\"]",
        "tests": "[\"Nadolol\", \"Propranolol\"]"
    }
}
```
