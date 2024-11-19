/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "4nx8jqbkxnpql7q",
    "created": "2024-11-18 02:50:25.279Z",
    "updated": "2024-11-18 02:50:25.279Z",
    "name": "vd",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "kadu0bmq",
        "name": "contestant",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "jacmrtbe",
        "name": "question",
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
  const collection = dao.findCollectionByNameOrId("4nx8jqbkxnpql7q");

  return dao.deleteCollection(collection);
})
