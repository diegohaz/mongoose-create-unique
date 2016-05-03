# mongoose-create-unique

[![JS Standard Style][standard-image]][standard-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

> Mongoose plugin to create a document or return the existing one based on the unique index

## Install

```sh
npm install --save mongoose-create-unique
```

## Usage

```js
var mongoose = require('mongoose');
mongoose.plugin(require('mongoose-create-unique'));

var ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  }
});

var Artist = mongoose.model('Artist', ArtistSchema);

Artist.createUnique({name: 'Shakira'}).then(function(artist) {
  console.log(artist); // {_id: 1, name: 'Shakira'}
  return Artist.createUnique({name: 'Rihanna'});
}).then(function(artist) {
  console.log(artist); // {_id: 2, name: 'Rihanna'}
  return Artist.createUnique({name: 'Shakira'});
}).then(function(artist) {
  console.log(artist); // {_id: 1, name: 'Shakira'}
})
```

## License

MIT © [Diego Haz](http://github.com/diegohaz)

[standard-url]: http://standardjs.com
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[npm-url]: https://npmjs.org/package/mongoose-create-unique
[npm-image]: https://img.shields.io/npm/v/mongoose-create-unique.svg?style=flat-square

[travis-url]: https://travis-ci.org/diegohaz/mongoose-create-unique
[travis-image]: https://img.shields.io/travis/diegohaz/mongoose-create-unique.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/diegohaz/mongoose-create-unique
[coveralls-image]: https://img.shields.io/coveralls/diegohaz/mongoose-create-unique.svg?style=flat-square

[depstat-url]: https://david-dm.org/diegohaz/mongoose-create-unique
[depstat-image]: https://david-dm.org/diegohaz/mongoose-create-unique.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/mongoose-create-unique.svg?style=flat-square
