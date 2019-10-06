# Device Registry Service

## Usage

### Users

**Definition**

-   `GET /api/users/`
-   `POST /api/users/`
-   `GET /api/users/<id>`
-   `PUT /api/users/<id>`
-   `DELETE /api/users/<id>`

**query options**

-   `api_key` (Required) An API key

**responses**

-   `200` (GET) On success
-   `201` (POST, PUT) Created
-   `404` (GET, PUT, DELETE) Not found
-   `409` (POST, PUT) User exists
-   `500` Internal Error

**body**

-   `id` integer
-   `name` string
-   `birthday` string of date format DD.MM.YYYY
-   `email` string
-   `password` string, stored as hash and never displayed
-   `new_password` string, used to change a password
-   `device_type` string
-   `last_seen` integer of unix timestamp format
-   `information` string
-   `hide_elements` array of strings
-   `language` string of either 'en', 'ru' and 'es'
-   `permissions` integer of either 1 for patient, 2 for doctor, and 3 for admin
-   `course_therapy` array of strings
-   `relief_of_attack` array of strings
-   `tests` array of strings

**example response**

```json
[
    {
        "id": 1,
        "name": "Alexander Feldman",
        "birthday": "10.05.1957",
        "gender": "male",
        "email": "ggn00b@mail.ru",
        "device_type": "incart box v4.3",
        "last_seen": 1570184394,
        "information": "info about the user",
        "hide_elements": ["Walking", "Stairs"],
        "language": "ru",
        "permissions": 1,
        "course_therapy": ["Acebutolol", "Atenolol"],
        "relief_of_attack": ["Bisoprolol", "Betaxolol"],
        "tests": ["Nadolol", "Propranolol"]
    },
    {
        "id": 2,
        "name": "Jane Doe",
        "birthday": "07.10.2019",
        "gender": "male",
        "email": "test@test.com",
        "device_type": "incart box v4.3",
        "last_seen": 1570015787,
        "information": "",
        "hide_elements": [],
        "language": "ru",
        "permissions": 3,
        "course_therapy": ["Acebutolol", "Atenolol"],
        "relief_of_attack": ["Bisoprolol", "Betaxolol"],
        "tests": ["Nadolol", "Propranolol"]
    }
]
```

### Activity

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

### Virtual activity

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

### Tasks

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
