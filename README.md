# Device Registry Service

## Usage

All responses will have the form

```json
{
    "data": "Mixed type holding the content of the response",
    "message": "Description of what happened"
}
```

Subsequent response definitions will only detail the expected value of the `data field`

### List all devices

**Definition**

`GET /api/devices`

**Response**

- `200 OK` on success

```json
[
    {
        "id": "1",
        "name": "Alexander Feldman",
        "device_type": "cardio tracker",
        "is_online": false,
        "last_seen": "1550272682",
    },
    {
        "id": "2",
        "name": "Jane Doe",
        "device_type": "cardio tracker",
        "is_online": true,
        "last_seen": "1550272682",
    }
]
```

### Registering a new device

**Definition**

`POST /api/devices`

**Arguments**

- `"id":int` a globally unique identifier for this device
- `"name":string` a name of a patient using the device
- `"device_type":string` the type of the device used by the patient
- `"is_online":boolean` shows if the device is currently online
- `"last_seen":string` the last time the device went online with unix time stamp

If a device with the given identifier already exists, the existing device will be overwritten.

**Response**

- `201 Created` on success

```json
{
        "id": "3",
        "name": "John Doe",
        "device_type": "cardio tracker",
        "is_online": true,
        "last_seen": "1550272682",
}
```
## Lookup device details

**Definition**

`GET /api/devices`

**Arguments**

- `"id":int` a globally unique identifier for this device
- `"name":string` a name of a patient using the device
- `"device_type":string` the type of the device used by the patient
- `"is_online":boolean` shows if the device is currently online
- `"last_seen":string` the last time the device went online with unix time stamp

**Response**

- `404 Not Found` if the device does not exist
- `200 OK` on success

```json
{
        "id": "3",
        "name": "John Doe",
        "device_type": "cardio tracker",
        "is_online": true,
        "last_seen": "1550272682",
}
```

## Delete a device

**Definition**

`DELETE /devices/<id>`

**Response**

- `404 Not Found` if the device does not exist
- `204 No Content` on success

## Lookup device data

`GET /api/devices/<id>/data`

**Arguments**

- `"id":int` a locally unique identifier if this record
- `"exercise_type":string` a name of an exercise patient completed
- `"time_started":string` unix timestamp of the time exercise started
- `"duration":int` duration of the exercise in seconds
- `"successful":boolean` if the exercise was terminated
- `"distance":float` total distance covered in meters
- `"steps":int` total steps taken during the exercise

**Response**

- `404 Not Found` if the device does not exist
- `200 OK` on success

```json
{
        "id": "1",
        "exercise_type": "Walking",
        "time_started": "1550272682",
        "duration": 300,
        "successful": true,
        "distance": 97.3,
        "steps": 128,
},
{
        "id": "2",
        "exercise_type": "Stairs",
        "time_started": "1550274641",
        "duration": 300,
        "successful": true,
        "distance": 97.3,
        "steps": 128,
},
{
        "id": "3",
        "exercise_type": "Walking",
        "time_started": "1550234120",
        "duration": 40,
        "successful": false,
        "distance": 0,
        "steps": 0,
},
```

### adding new data to the device

**Definition**

`POST /api/devices/<id>/data/add`

**Arguments**

- `"id":int` a locally unique identifier if this record
- `"exercise_type":string` a name of an exercise patient completed
- `"time_started":string` unix timestamp of the time exercise started
- `"duration":int` duration of the exercise in seconds
- `"successful":boolean` if the exercise was terminated
- `"distance":float` total distance covered in meters
- `"steps":int` total steps taken during the exercise

**Response**

- `201 Created` on success

```json
{
        "id": "3",
        "exercise_type": "Walking",
        "time_started": "1550234120",
        "duration": 40,
        "successful": false,
        "distance": 0,
        "steps": 0,
}
```