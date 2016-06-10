const createUniquePlugin = (schema) => {
  const paths = schema.indexes()
    .filter((index) => index[1].unique)
    .map((index) => Object.keys(index[0]))

  schema.statics.createUnique = function (doc) {
    if (arguments.length > 1) {
      doc = [].slice.call(arguments)
    }

    if (Array.isArray(doc)) {
      let promises = [Promise.resolve()]
      doc.forEach((d, i) => {
        promises.push(promises[i].then(() => this.createUnique(d)))
      })
      return Promise.all(promises.slice(1))
    }

    let query = {}
    doc = new this(doc)

    if (!paths.length) {
      return doc.save()
    } else if (paths.length > 1) {
      query = {$or: paths.map((path) => ({[path[0]]: doc[path[0]]}))}
    } else {
      paths[0].forEach((path) => {
        query[path] = doc[path]
      })
    }

    return doc.save().then((doc) => {
      return doc
    }, (err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        return this.findOne(query)
      } else {
        throw err
      }
    })
  }
}

export default createUniquePlugin
module.exports = exports = createUniquePlugin
