# Device Registry Service

## Usage

### Users

**Definition**

`GET /api/users/`
`GET /api/users/<id>`
`POST /api/users/<id>`
`PUT /api/users/<id>`
`DELETE /api/users/<id>`

**query**

-   `api_key` (Required) An API key

**Responses**

-   `200` On success
-   `404` Not found
-   `409` User exists (on POST or PUT)
-   `500` Internal Error

```json
[
    {
        "id": 1, // integer
        "name": "Alexander Feldman", // string
        "birthday": "10.05.1957", // string
        "gender": "male", // string
        "email": "ggn00b@mail.ru", // string
        "device_type": "incart box v4.3", // string
        "last_seen": 1570184394, // integer in unix timestamp
        "information": "info about the user", // string
        "hide_elements": ["Walking", "Stairs"], // an array of strings
        "language": "ru", // string
        "permissions": 1, // integer of either 1 (patient), 2 (doctor) or 3 (admin)
        "course_therapy": ["Acebutolol", "Atenolol"], // an array of strings
        "relief_of_attack": ["Bisoprolol", "Betaxolol"], // an array of strings
        "tests": ["Nadolol", "Propranolol"] // an array of strings
    },
    {
        "id": 2, // integer
        "name": "Jane Doe", // string
        "birthday": "07.10.2019", // string in format of DD.MM.YYYY
        "gender": "male", // string
        "email": "test@test.com", // string
        "device_type": "incart box v4.3", // string
        "last_seen": 1570015787, // integer in unix timestamp
        "information": "", // string
        "hide_elements": [], // an array of strings
        "language": "ru", // string
        "permissions": 3, // integer of either 1 (patient), 2 (doctor) or 3 (admin)
        "course_therapy": ["Acebutolol", "Atenolol"], // an array of strings
        "relief_of_attack": ["Bisoprolol", "Betaxolol"], // an array of strings
        "tests": ["Nadolol", "Propranolol"] // an array of strings
    }
]
```
