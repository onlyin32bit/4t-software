/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f")

  collection.name = "ques_kd"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f")

  collection.name = "questions"

  return dao.saveCollection(collection)
})
