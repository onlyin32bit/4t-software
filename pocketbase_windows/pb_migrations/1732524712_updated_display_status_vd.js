/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jb3ye0yy8ing399")

  // remove
  collection.schema.removeField("dikgmusl")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hjirtm1l",
    "name": "1",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "skkeep37",
    "name": "2",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kxmmoer9",
    "name": "3",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qkbis3ux",
    "name": "4",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("jb3ye0yy8ing399")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dikgmusl",
    "name": "field",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("hjirtm1l")

  // remove
  collection.schema.removeField("skkeep37")

  // remove
  collection.schema.removeField("kxmmoer9")

  // remove
  collection.schema.removeField("qkbis3ux")

  return dao.saveCollection(collection)
})
