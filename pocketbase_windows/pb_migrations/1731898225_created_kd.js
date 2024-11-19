/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "in93pj9ecq25b1f",
    "created": "2024-11-18 02:50:25.278Z",
    "updated": "2024-11-18 02:50:25.278Z",
    "name": "kd",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "0txol5fm",
        "name": "question",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
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
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": null,
    "updateRule": "",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("in93pj9ecq25b1f");

  return dao.deleteCollection(collection);
})
