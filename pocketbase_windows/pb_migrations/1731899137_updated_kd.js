/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f")

  // remove
  collection.schema.removeField("0csr73kv")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0csr73kv",
    "name": "state",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
})
