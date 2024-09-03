/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "4nx8jqbkxnpql7q",
    "created": "2024-08-29 12:45:35.101Z",
    "updated": "2024-08-29 12:45:35.101Z",
    "name": "ques_vd",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "uwtczblp",
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
  const collection = dao.findCollectionByNameOrId("4nx8jqbkxnpql7q");

  return dao.deleteCollection(collection);
})
