/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("wkt0ytkaqhj186r");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "wkt0ytkaqhj186r",
    "created": "2024-08-24 09:57:41.895Z",
    "updated": "2024-08-24 09:57:41.895Z",
    "name": "bell",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "duao3lho",
        "name": "contestant",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "q1voxbbp",
        "name": "ringing",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
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
})
