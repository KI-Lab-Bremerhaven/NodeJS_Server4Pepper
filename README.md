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

1. install required node packages

```bash
NodeJS_Server4Pepper:~$ npm i
```

2. reate database (edit .env for custom credentials)

```bash
mysql -e "CREATE DATABASE pepperbackend"
```

3. Edit .env file (example configuration in .exanple_env)

4. Generate ID RSA Key pairs and save the public and private key in `/keys` (they are needed for JWT-based user authentication)

## Run the application

- in development mode

```bash
NodeJS_Server4Pepper:~$ npm run dev
```

- in production mode

```bash
NodeJS_Server4Pepper:~$ npm run prod
```

## File structure and possibilities

|Directories|Description|
|--------|--------|
|`/assets`|Storrage of for example `topics.json` where one can reply to pepper speach|
|`/keys`|RSA keys for user authentication|
|`/lib`|Data structures which can be used everywhere|
|`/middleware`|Middlewares which are used more than once (maybe)|
|`/routes`|Endpoints of this server application|
|`/static`|files that does not change and can be included dynamically|
|`/views`|`.html`-like files that cann be rendered by the defined routes|

|Files|Description|
|-----|-----|
|`.env`|Credentials and settings file; must be added by hand|
|`.example.env`|This is hot `.env` should loog like|
|`.gitignore`|...|
|`config.js`|This file loads the config files|
|`deploy.sh`|Script to deploy on server|
|`LICENSE`|License statement of the authors.|
|`package-lock.json`|Automatic generated file|
|`package.json`|This defines the framework of this app; scripts are implemented there to start the app|
|`README.md`|...|
|`server.js`|Main program|


#### Reply to speach by server
`/routes/apiv2.js` contains the reply to speach implementation which can be triggered by pepper to anwser text from `/assets/topics.json`. 

#### Save data to Database 
Endpoints for interaction between Pepper and the backend can be found in ``/routes/api.js`
