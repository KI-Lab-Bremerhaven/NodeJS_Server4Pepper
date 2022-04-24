# Express Web Application for Pepper

This web application serves as an interface between the university robot Pepper and the Internet. It is part of the work at the AI Transfer Center Bremerhaven as well as part of the bachelor project of Benjamin T. Schwertfeger, Jacob B. Menge and Kristian Kellermann.

It will be used to dynamically send data to Pepper from the Internet, and will also connect to a Nextcloud database to which Pepper will automatically backup and retrieve data via this service. This application will run on the university server in a Docker on a shared user.

![Dashboard Image](static/images/dashboard.png?raw=true "Dashboard")

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

- mysql (v8+)

```bash
$ mysql --version
Ver 8.0.27 for macos12.0 on x86_64 (Homebrew)
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

- create database (edit .env for custom credentials)

```bash
mysql -e "CREATE DATABASE pepperbackend"
```

- edit .env file (example configuration in .exanple_env)

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

- To run this application with the dashboard / login function you will need to create a rsa keypair!

