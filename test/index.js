import test from 'tape'
import mongoose, {Schema} from 'mongoose'
import createUniquePlugin from '../src'

mongoose.connect('mongodb://localhost/mongoose-create-unique-test')
mongoose.plugin(createUniquePlugin)

test('createUniquePlugin not', (t) => {
  t.plan(4)

  const TestSchema = new Schema({
    name: {
      type: String
    }
  })

  const Test = mongoose.model('Test1', TestSchema)
  let doc

  Test.remove({}).then(() => {
    t.true(Test.createUnique, 'should exist create unique static method')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    doc = result
    t.true(result, 'should create a document')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    t.notSame(result._id, doc._id, 'should create another document')

    return Test.remove({})
  }).then(() => {
    t.pass('should remove items')
  }).catch(console.log)
})

test('createUniquePlugin single', (t) => {
  t.plan(5)

  const TestSchema = new Schema({
    name: {
      type: String,
      unique: true
    }
  })

  const Test = mongoose.model('Test2', TestSchema)
  let doc

  Test.remove({}).then(() => {
    t.true(Test.createUnique, 'should exist create unique static method')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    doc = result
    t.true(result, 'should create a document')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    t.same(result._id, doc._id, 'should return existing document when trying to create a duplicate')

    return Test.createUnique({name: 'test'})
  }).then((result) => {
    t.notSame(result._id, doc._id, 'should create another document')

    return Test.remove({})
  }).then(() => {
    t.pass('should remove items')
  }).catch(console.log)
})

test('createUniquePlugin multiple', (t) => {
  t.plan(7)

  const TestSchema = new Schema({
    name: {
      type: String,
      unique: true
    },
    category: {
      type: Number,
      unique: true
    }
  })

  const Test = mongoose.model('Test3', TestSchema)
  let doc, otherDoc

  Test.remove({}).then(() => {
    t.true(Test.createUnique, 'should exist create unique static method')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    doc = result
    t.true(result, 'should create a document')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    t.same(result._id, doc._id, 'should return existing document when trying to create a duplicate')

    return Test.createUnique({name: 'test', category: 2})
  }).then((result) => {
    otherDoc = result
    t.notSame(result._id, doc._id, 'should create another document')

    return Test.createUnique({name: 'Test', category: 3})
  }).then((result) => {
    t.same(result._id, doc._id, 'should return existing document when trying to create a duplicate')

    return Test.createUnique({name: 'aaa', category: 2})
  }).then((result) => {
    t.same(result._id, otherDoc._id, 'should return existing document when trying to create a duplicate')

    return Test.remove({})
  }).then(() => {
    t.pass('should remove items')
  }).catch(console.log)
})

test('createUniquePlugin multiple compound', (t) => {
  t.plan(7)

  const TestSchema = new Schema({name: String, category: Number})
  TestSchema.index({name: 1, category: 1}, {unique: true})

  const Test = mongoose.model('Test4', TestSchema)
  let doc, otherDoc

  Test.remove({}).then(() => {
    t.true(Test.createUnique, 'should exist create unique static method')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    doc = result
    t.true(result, 'should create a document')

    return Test.createUnique({name: 'Test'})
  }).then((result) => {
    t.same(result._id, doc._id, 'should return existing document when trying to create a duplicate')

    return Test.createUnique({name: 'test', category: 2})
  }).then((result) => {
    otherDoc = result
    t.notSame(result._id, doc._id, 'should create another document')

    return Test.createUnique({name: 'Test', category: 2})
  }).then((result) => {
    t.notSame(result._id, doc._id, 'should create another document')

    return Test.createUnique({name: 'test', category: 2})
  }).then((result) => {
    t.same(result._id, otherDoc._id, 'should return existing document when trying to create a duplicate')

    return Test.remove({})
  }).then(() => {
    t.pass('should remove items')
  }).catch(console.log)
})

test('createUniquePlugin array', (t) => {
  t.plan(7)

  const TestSchema = new Schema({
    name: {
      type: String,
      unique: true
    }
  })

  const Test = mongoose.model('Test5', TestSchema)
  let doc, otherDoc

  Test.remove({}).then(() => {
    t.true(Test.createUnique, 'should exist create unique static method')

    return Test.createUnique({name: 'Test'}, {name: 'test'}, {name: 'Test'})
  }).then((results) => {
    doc = results[0]
    otherDoc = results[1]
    t.true(doc, 'should create a document')
    t.true(otherDoc, 'should create a document')
    t.same(doc._id, results[2]._id, 'should return existing document')

    return Test.createUnique({name: 'Test'}, {name: 'aaa'})
  }).then((results) => {
    t.same(results[0]._id, doc._id, 'should return existing document when trying to create a duplicate')
    t.notSame(results[1]._id, otherDoc._id, 'should create a document')

    return Test.remove({})
  }).then(() => {
    t.pass('should remove items')
  }).catch(console.log)
})

test('createUniquePlugin id', (t) => {
  t.plan(6)

  const TestSchema = new Schema({
    _id: {
      type: String,
      unique: true,
      default: () => '234'
    }
  })

  const Test = mongoose.model('Test6', TestSchema)
  let doc

  Test.remove({}).then(() => {
    t.true(Test.createUnique, 'should exist create unique static method')

    return Test.createUnique({_id: '123'}, {_id: '123'})
  }).then((result) => {
    doc = result[0]
    const otherDoc = result[1]
    t.true(result, 'should create a document')
    t.equal(doc._id, otherDoc._id, 'should return existing document when trying to create a duplicate at same time')

    return Test.createUnique({_id: '123'})
  }).then((result) => {
    t.same(result._id, doc._id, 'should return existing document when trying to create a duplicate')

    return Test.createUnique({_id: '456'})
  }).then((result) => {
    t.notSame(result._id, doc._id, 'should create another document')

    return Test.remove({})
  }).then(() => {
    t.pass('should remove items')
  }).catch(console.log)
})

test.onFinish(() => {
  mongoose.disconnect()
})
