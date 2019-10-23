[![Build Status](https://api.travis-ci.org/tedbarth/webpack-extended-import-glob-loader.svg)](https://travis-ci.org/webpack-extended-import-glob-loader)
[![npm version](https://badge.fury.io/js/webpack-extended-import-glob-loader.svg)](https://badge.fury.io/js/webpack-extended-import-glob-loader.)
# webpack-extended-import-glob-loader
Expands globbing patterns for ES6 `import` statements (as preloader for Webpack) .

This is a fork of https://github.com/fred104/import-glob.
In comparison to the original project this loader is exposing the imported modules together with its file name. This allows to process the individually found module to be handled in respect to its file name. A possible usecase could be to extract a key from the filename as identifier for the content of dynamically imported JSON files.

---
```js
import modules from "./foo/**/*.js";
```
Expands into
```js
import * as module0 from "./foo/1.js";
import * as module1 from "./foo/bar/2.js";
import * as module2 from "./foo/bar/3.js";

var modules = [
  {fileName: "./foo/1.js", module: module0},
  {fileName: "./foo/bar/2.js", module: module1},
  {fileName: "./foo/bar/3.js", module: module2}];
```
---
For importing from node module
```js
import modules from "a-node-module/**/*js";
```
Expands into
```js
import * as module0 from "a-node-module/foo/1.js";
import * as module1 from "a-node-module/foo/bar/2.js";
import * as module2 from "a-node-module/foo/bar/3.js";

var modules = [module0, module1, module2]
```
---
__For side effects:__

```js
import "./foo/**/*.scss";
```
Expands into
```js
import "./foo/1.scss";
import "./foo/bar/2.scss";
```
---
__For sass:__

```scss
@import "./foo/**/*.scss";
```
Expands into
```scss
@import "./foo/1.scss";
@import "./foo/bar/2.scss";
```

---

## Install
```sh
npm install webpack-import-glob-loader --save-dev
```

## Usage
You can use it one of two ways, the recommended way is to use it as a preloader

```js
// ./webpack.config.js

module.exports = {
  ...
  module: {
    rules: [
      {
          test: /\.js$/,
          use: 'webpack-extended-import-glob-loader'
      },
      {
          test: /\.scss$/,
          use: 'webpack-extended-import-glob-loader'
      },
    ]
  }
};
```

Alternatively you can use it as a chained loader
```js
// foo/bar.js
import "./**/*.js";

// index.js
import 'webpack-extended-import-glob-loader!foo/bar.js';
```
