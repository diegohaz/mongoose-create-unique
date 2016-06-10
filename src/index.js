const createUniquePlugin = (schema) => {
  const paths = schema.indexes()
    .filter((index) => index[1].unique)
    .map((index) => Object.keys(index[0]))

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
      let promises = [Promise.resolve()]
      doc.forEach((d, i) => {
        promises.push(promises[i].then(() => this.createUnique(d)))
      })
      return Promise.all(promises.slice(1)).then((result) => {
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

    let query = {}
    doc = new this(doc)

    if (!paths.length) {
      return doc.save(callback)
    } else if (paths.length > 1) {
      query = {$or: paths.map((path) => ({[path[0]]: doc[path[0]]}))}
    } else {
      paths[0].forEach((path) => {
        query[path] = doc[path]
      })
    }

    return doc.save().then((doc) => {
      callback && callback(null, doc)
      return doc
    }, (err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        return this.findOne(query, callback)
      } else {
        if (callback) {
          callback(err)
        } else {
          throw err
        }
      }
    })
  }
}

export default createUniquePlugin
module.exports = exports = createUniquePlugin
