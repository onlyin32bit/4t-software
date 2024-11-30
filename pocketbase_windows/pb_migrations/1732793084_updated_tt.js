/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea")

  // remove
  collection.schema.removeField("jwx7qvhs")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dryxtq2n",
    "name": "1",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "4appxxfb",
    "name": "2",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tk0w1oil",
    "name": "3",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xce6sq3h",
    "name": "4",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("2p3nbmhjzs4rcea")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jwx7qvhs",
    "name": "files",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 100000000,
      "protected": false
    }
  }))

  // remove
  collection.schema.removeField("dryxtq2n")

  // remove
  collection.schema.removeField("4appxxfb")

  // remove
  collection.schema.removeField("tk0w1oil")

  // remove
  collection.schema.removeField("xce6sq3h")

  return dao.saveCollection(collection)
})
