# Backend for todogame project

---

### Server API methods

#### Public methods

**`POST /auth/signup`**

Method for user signup

Input: 
1. login
2. email
3. password

Response:
1. access token

**`POST /auth/signin`**

Method for user signin

Input: 
1. login
2. password

Response:
1. access token

---

#### Private methods
***ALL private methods requiers access token***


**`POST /refresh`**

Refreshing access token

Input:
1. refresh token

Response:
1. access token

**`POST /logout`**
Clears cookies

**`GET /get/list`**

Response:
1. All tasks
2. All categories

**`GET /get/task`**

Input:
1. id

Response:
1. task

**`GET /get/category`**

Input:
1. id

Response:
1. category

**`POST /task *or* category/create`**

Input:
1. title
2. description

Output:
1. task

**`POST /task *or* category/delete`**

Input:
1. id

**`POST /task *or* category/change`**

Input:
1. title
2. description

