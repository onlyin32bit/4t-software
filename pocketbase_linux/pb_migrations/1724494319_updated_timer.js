/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ho6harc2a7oeycc")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wwukkqal",
    "name": "timer",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "-1",
        "5",
        "10",
        "15",
        "30"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("ho6harc2a7oeycc")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wwukkqal",
    "name": "timer",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "-1",
        "10",
        "15",
        "30"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
