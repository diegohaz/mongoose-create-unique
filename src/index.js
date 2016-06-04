export default function createUniquePlugin (schema, options) {
  let paths = schema.indexes()
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

    return this.findOne(query).then((foundDoc) => {
      return foundDoc ? foundDoc : doc.save()
    })
  }
}
