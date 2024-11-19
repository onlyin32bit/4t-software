/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "pyym7yntfrtumfh",
    "created": "2024-11-18 02:50:25.279Z",
    "updated": "2024-11-18 02:50:25.279Z",
    "name": "vcnv",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "xncurgev",
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
        "id": "kxqpi8nt",
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
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pyym7yntfrtumfh");

  return dao.deleteCollection(collection);
})
