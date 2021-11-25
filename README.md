# Express Web Application for Pepper

This web application serves as an interface between the university robot Pepper and the Internet. It is part of the work at the AI Transfer Center Bremerhaven as well as part of the bachelor project of Benjamin T. Schwertfeger, Jacob B. Menge and Kristian Kellermann.

It will be used to dynamically send data to Pepper from the Internet, and will also connect to a Nextcloud database to which Pepper will automatically backup and retrieve data via this service. This application will run on the university server in a Docker on a shared user.

## Requirements

- NodeJS (v16.6.1+)

```bash
$ node --version
v16.6.1
```

- npm (v7.20.3+)

```bash
$ npm --version
7.20.3
```

## Installation

```bash
git clone https://github.com/ProjectPepperHSB/NodeJS_Server4Pepper.git
```

## Initialization

- install required node packages

```bash
NodeJS_Server4Pepper:~$ npm i
```

## Run the application

- in development mode

```bash
NodeJS_Server4Pepper:~$ npm run dev
```

- in production mode

```bash
NodeJS_Server4Pepper:~$ npm run prod
```

## Notes

## Todo

- create new routes
- connect to nextcloud DB
