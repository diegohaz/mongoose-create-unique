const createUniquePlugin = (schema) => {
  const paths = schema.indexes()
    .filter((index) => index[1].unique)
    .map((index) => Object.keys(index[0]))

  schema.methods.saveUnique = function (options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = undefined
    }

    return this.save(options).then((doc) => {
      callback && callback(null, doc)
      return doc
    }, (err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        const makeOrQuery = (paths) => ({$or: paths.map((path) => makeAndQuery(path))})
        const makeAndQuery = (paths) => {
          let andQuery = {}
          paths.forEach((path) => { andQuery[path] = this[path] })
          return andQuery
        }

        const query = paths.length > 1 ? makeOrQuery(paths) : makeAndQuery(paths[0])
        return this.constructor.findOne(query, callback)
      } else {
        if (callback) {
          callback(err)
        } else {
          throw err
        }
      }
    })
  }

  schema.statics.createUnique = function (doc) {
    const args = [].slice.call(arguments)
    const lastArgument = args[args.length - 1]
    const callback = typeof lastArgument === 'function' ? lastArgument : undefined

    if (callback) {
      args.pop()
    }

    if (args.length > 1) {
      doc = args
    }

    if (Array.isArray(doc)) {
      let promises = doc.map((d) => this.createUnique(d))
      return Promise.all(promises).then((result) => {
        callback && callback(null, result)
        return result
      }, (err) => {
        if (callback) {
          callback(err)
        } else {
          throw err
        }
      })
    }

    doc = new this(doc)

    return doc.saveUnique(callback)
  }
}

export default createUniquePlugin
module.exports = exports = createUniquePlugin
