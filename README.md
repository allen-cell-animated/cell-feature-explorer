# Cell Feature Explorer

---

## Description

Main features in a brief descriptive text.

## Installation


## Structure
src/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[components/](src/components/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[constants/](src/constants/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[containers/](src/containers/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[state/](src/state/README.md)<br/>
&nbsp;&nbsp;&nbsp;&nbsp;[styles/](src/styles/README.md)<br/>
___

## Documentation

If you have more extensive technical documentation (whether generated or not), ensure they are published to the following address:
For full package documentation please visit
[organization.github.io/projectname](https://organization.github.io/projectname/index.html).

## Quick Start

### Running locally
To run this application in development, run `$ ./gradlew start`. This will start `webpack-dev-server`, running by default
on the port specified in `webpack/constants.js`. To view, visit `http://localhost:{PORT}`. Webpack-dev-server will watch all relevant project files, and reload the browser
automatically when those files change.
___


### Runtime configuration:

| Env var | Default | Options |
| ------- |-------- |---------|
|`DEPLOYMENT_ENV`    | dev     | "dev", "staging", "production" |


Differences in builds by environment:

| Target | Sources Maps | Uglification | NODE_ENV === 'production' |
| ------ | ------------ | ------------ |  ------------------------- |
| dev    | true         | false |  false                     |
| staging| true         | false |  false                      |
| production| false      | true |  true                      |

*Note as of June 25, 2020*: To deal with an error `~/cell-feature-explorer/node_modules/@grpc/proto-loader/node_modules/protobufjs/src/root.js:236
        throw Error("not supported");`
              ^
protobufjs has code that fixes this error, but it's not yet included in a stable release: [PR](https://github.com/protobufjs/protobuf.js/pull/1363/), so we're using the beta version of 6.10. It looks like it's planned to be included in 6.9.1 as soon as they can verify it doesn't break things.
Also, to make sure grpc wasn't installing an older version of protobufjs, it has been removed it from the package's dependencies and the package-lock file as been shrinkwrapped.

TODO in the future, once there is a stable release of protobufjs with this fix, and grpc has been updated to depend on it, we can remove these changes.


### Deployment
Once built, Webpack outputs (e.g., index.html, JS and CSS files) are put into a tar archive, gzipped, and stored in
Artifactory in the `maven-snapshot-local` repo. From there, deployments involve: a) pulling a particular artifact (referenced by git tag) out of Artifactory
and b) copying the contents of the artifact to an S3 website bucket. For both staging and production deployments, these 
steps are captured in this project's Jenkinsfile and can be executed by setting the proper parameters for the Jenkins build.

#### Staging deployment
Automatically builds from `main`, can also be manually triggered on Jenkins

#### Production deployment
On `main` branch
1. Make a new version: `npm version [patch/minor/major]`
2. Push the new package.json version: `git push origin main`
3. Push the new tag: `git push origin [NEW_TAG]`

This will trigger a github workflow which copies the assets from the staging bucket into the production bucket.
## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for information related to developing the code.
