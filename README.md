Template React/Redux Application
=================

## Project description
This project provides a template for new React/Redux applications. Copy or fork this repository to start a new project.
___


## Using the template
1. Update `settings.gradle`:
    - Set the value of `rootProject.name`. This defines the name of the published artifact.

2. Update `package.json`:
    - Change `name` appropriately and `repository.url` appropriately.
    
3. Update `Docker/nginx.conf.j2`:
    - Change the location directive. This will define the path of the URL at which the application will be available in production. 

4. Update `webpack/constants.js`:
    - Change `devServer.port` (optional) and `devServer.path` (should match path defined in `Docker/nginx.conf.j2`).

5. Update `webpack/index.template.html`:
    - Change the `<title>`.
    - Change the `id` of the `<main>` element. This is used as the render root of the application.

6. Update `src/constants/index.ts`:
    - Change all constants appropriately to reflect the name of your application and it's associated data service.
___


## Structure
src/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[components/](src/components/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[constants/](src/constants/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[containers/](src/containers/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[state/](src/state/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[styles/](src/styles/README.md)<br/>
___


## Running locally
To run this application in development, run `$ ./gradlew start`. This will start `webpack-dev-server`, running by default
on the port specified in `webpack/constants.js`. To view, visit `http://localhost:{PORT}`. Webpack-dev-server will watch all relevant project files, and reload the browser
automatically when those files change.
___


## Runtime configuration:

| Env var | Default | Options |
| ------- |-------- |---------|
|`DEPLOYMENT_ENV`    | dev     | "dev", "staging", "production" |


Differences in builds by environment:

| Target | Sources Maps | Uglification | NODE_ENV === 'production' |
| ------ | ------------ | ------------ |  ------------------------- |
| dev    | true         | false |  false                     |
| staging| true         | false |  false                      |
| production| false      | true |  true                      |
___


## Publishing
By default, Jenkins will build both a gzipped tar archive of all Webpack outputs (e.g., index.html, bundle.js, bundle.css; "build artifacts") 
and a Docker image running an Nginx server, serving those same build artifacts.

### Docker image configuration
| Env var | Required | Default | Notes |
| ------- |-------- |---------|---------|
| `PORT` | - | 80 | Port on which the app will run **inside** the container. |
___


## Known TODOs
1. Extract common utilities into separate NPM packages: [DT-17](https://aicsjira.corp.alleninstitute.org/browse/DT-17)
2. Incorporate Prettier as a pre-commit hook: [DT-18](https://aicsjira.corp.alleninstitute.org/browse/DT-18)
3. Use cookiecutter or similar to avoid manual setup: [DT-19](https://aicsjira.corp.alleninstitute.org/browse/DT-19)
___
