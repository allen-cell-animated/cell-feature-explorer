# Cell Feature Explorer

---

## Description

The Cell Feature Explorer is an online tool to access our complete database of segmented and processed cells as curated datasets. We have annotated each of our cells with measured features, such as cellular volume and what stage of mitosis it is in. The tool is composed of a plot and a 3D viewer. In the plot each cell is graphed by its measured features described in our journal publications. To access older data sets, see our Data Downloading page.

## Documentation
For making a dataset that can be read by the Cell Feature Explorer visit the
[Handoff Specification Docs](https://allen-cell-animated.github.io/cell-feature-data/HandoffSpecification.html).

## Quick Start

### Running locally
To run this application in development, run `npm start`. This will start `webpack-dev-server`, running by default
on the port specified in `webpack/constants.js`. To view, visit `http://localhost:{PORT}`. Webpack-dev-server will watch all relevant project files, and reload the browser automatically when those files change.

#### Options
To run pointing at the non production database, run `npm run start:dev-db`
To point at a JSON dataset not hosted on firebase, run `npm run start:internal`. This will load a list of datasets hosted at `http://dev-aics-dtp-001.corp.alleninstitute.org/cfedata/datasets.json`. 

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for information related to developing the code.
