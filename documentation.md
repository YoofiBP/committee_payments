openapi: 3.0.0
info:
title: Class of 2019 Welfare committee payment Project
description: >-
This application helps the members of the class of 2019 easily make
donations for milestone events.
contact:
email: joseph.brown-pobee@ashesi.edu.gh
license:
name: Apache 2.0
url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
version: 1.0.0
servers:
- url: 'https://production-class-committee.herokuapp.com'
  description: Production server
- url: 'https://staging-class-committee.herokuapp.com'
  description: Staging server
- url: 'http://localhost:5000'
  description: Local development server
  security:
- BearerAuth:
    - admin
    - user
      tags:
- name: admins
  description: Secured Admin-only calls
- name: general
  description: Operations available to unauthenticated users
- name: users
  description: >-
  Operations available to authenticated and verified users. Note: Non-admin
  users can only execute this route with their currently authenticated ID
  (their own profile). Admin users can execute this on all users
  paths:
  /admin/users:
  get:
  tags:
  - admins
  summary: Gets all users
  description: Retrieves all active users from database
  responses:
  '200':
  description: search results matching criteria
  content:
  application/json:
  schema:
  type: array
  items:
  $ref: '#/components/schemas/UserModel'
  '500':
  description: Internal Server Error
  security:
  - BearerAuth:
  - admin
  /admin/contributions:
  get:
  tags:
  - admins
  summary: Gets all contributions
  description: Retrieves all contributions from database
  responses:
  '200':
  description: Array of contributions
  content:
  application/json:
  schema:
  type: array
  items:
  $ref: '#/components/schemas/ContributionModel'
  '401':
  description: Unauthorized
  '500':
  description: Internal Server Error
  '/users/{id}':
  get:
  tags:
  - users
  summary: Gets specific user resource
  parameters:
  - name: id
  in: path
  description: ID of user to be obtained
  required: true
  style: simple
  explode: false
  schema:
  type: string
  responses:
  '200':
  description: User Found
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/UserModel'
  '401':
  description: User is unauthorized to perform request
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/AuthErrorModel'
  '500':
  description: Internal Server Error
  delete:
  tags:
  - users
  summary: Deletes specific user resource
  parameters:
  - name: id
  in: path
  description: ID of user to be obtained
  required: true
  style: simple
  explode: false
  schema:
  type: string
  responses:
  '200':
  description: User Deleted
  content:
  text/plain:
  schema:
  type: string
  example: Deleted
  '401':
  description: User is unauthorized to perform request
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/AuthErrorModel'
  '500':
  description: Internal Server Error
  patch:
  tags:
  - users
  summary: Update specific user resource
  parameters:
  - name: id
  in: path
  description: ID of user to be obtained
  required: true
  style: simple
  explode: false
  schema:
  type: string
  responses:
  '200':
  description: User updated successfully
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/UserModel'
  '401':
  description: User is unauthorized to perform request
  content:
  application/json:
  schema:
  $ref: '#/components/schemas/AuthErrorModel'
  '500':
  description: Internal Server Error
  '/contributions/verify':
  get:
  tags:
    - general
      summary: Verify and store contributions
      description: Verifies contribution made with payment provider and stores contribution in database
      parameters:
        - in: query
          name: reference
          schema:
          type: string
          description: Payment reference returned from payment provider
          responses:
          '301':
          description: Payment verified and user redirected
          '400':
          description: Duplicate contribution found
          content:
          application/json:
          schema:
          type: object
          properties:
          status:
          type: string
          example: error
          message:
          type: string
          example: Contribution already recorded
          '500':
          description: Transaction failed at payment provider/Internal Server Error
          '/contributions/contribute':
          post:
          tags:
    - users
      summary: Initiates payment with payment provider
      description: Calls paystack API which pops over and allows the user to intiate payment.
      requestBody:
      description: Amount should be multiplied by 100 for the Paystack API. E.g. GHS 50 should have 5000 as the amount
      required: true
      content:
      application/json:
      schema:
      type: object
      properties:
      email:
      type: string
      example: joseph.brown-pobee@ashesi.edu.gh
      amount:
      type: number
      example: 5000
      responses:
      '200':
      description: Paystack API called successfully, payment initiated and authorization url called successfully
      content:
      application/json:
      schema:
      type: object
      properties:
      authorization_url:
      type: string
      example: https://checkout.paystack.com/dt1nuetzcupp2fy
      '401':
      description: User unauthenticated
      content:
      application/json:
      schema:
      $ref: '#/components/schemas/AuthErrorModel'
      '500':
      description: Internal Server Error. Payment initiation failed
      /users/signup:
      post:
      tags:
        - general
          summary: Creates new user
          description: Creates a new user and stores them in the DB
          requestBody:
          description: User Schema to add
          content:
          application/json:
          schema:
          $ref: '#/components/schemas/UserModel'
          required: true
          responses:
          '201':
          description: user created
          content:
          application/json:
          schema:
          type: object
          properties:
          user:
          $ref: '#/components/schemas/UserModel'
          token:
          type: string
          example: >-
          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzAxYTVmODAyZGFlYjgxMWQxM2JlYiIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYwNjY3OTY4OSwiZXhwIjoxNjA2NzY2MDg5fQ.Gm726lRGRarjuG-iBuQ7FAPLxLXVtHPDiSJn_CFKbuA
          '422':
          description: 'Invalid Input: Missing key fields or duplicate email'
          content:
          application/json:
          schema:
          type: object
          properties:
          status:
          type: string
          example: error
          message:
          type: string
          example: Password missing
          security: []
          /users/login:
          post:
          tags:
        - general
          summary: Authenticates user
          description: Checks if users credentials are valid and returns a token
          requestBody:
          content:
          application/json:
          schema:
          type: object
          properties:
          email:
          type: string
          example: joseph.brown-pobee@gmail.com
          password:
          type: string
          example: qwerty1234
          required: true
          responses:
          '200':
          description: User authenticated successfully
          content:
          application/json:
          schema:
          type: object
          properties:
          user:
          $ref: '#/components/schemas/UserModel'
          token:
          type: string
          example: >-
          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYzAxYTVmODAyZGFlYjgxMWQxM2JlYiIsInJvbGUiOiJiYXNpYyIsImlhdCI6MTYwNjY3OTY4OSwiZXhwIjoxNjA2NzY2MDg5fQ.Gm726lRGRarjuG-iBuQ7FAPLxLXVtHPDiSJn_CFKbuA
          '401':
          description: User credentials not found
          content:
          application/json:
          schema:
          type: object
          properties:
          status:
          type: string
          example: error
          message:
          type: string
          example: Unable to Login
          security: []
          /users/confirmation:
          get:
          tags:
        - general
          summary: Verifies user using auth Token
          description: >-
          When a user signs up they receive an email with a verification token
          which directs to this route
          parameters:
        - name: token
          in: query
          description: The verification token assigned to the user
          required: false
          style: form
          explode: true
          schema:
          type: string
          responses:
          '200':
          description: User verified successfully
          '401':
          description: Invalid token
          security: []
          components:
          schemas:
          UserModel:
          required:
        - email
        - name
        - password
        - phoneNumber
          type: object
          properties:
          name:
          type: string
          example: Wayne Gakuo
          email:
          type: string
          format: email
          example: joseph.brown-pobee@gmail.com
          password:
          type: string
          example: qwerty1234
          phoneNumber:
          type: string
          example: '+233248506381'
          ContributionModel:
          required:
        - contributorId
        - amount
        - paymentGatewayReference
          type: object
          properties:
          contributorId:
          type: string
          amount:
          type: number
          example: 50
          paymentGatewayReference:
          type: string
          example: 'nfjdsn930'
          AuthErrorModel:
          type: object
          properties:
          status:
          type: string
          example: error
          message:
          type: string
          example: You are not allowed to perform this operation
          securitySchemes:
          BearerAuth:
          type: http
          scheme: bearer
          bearerFormat: JWT