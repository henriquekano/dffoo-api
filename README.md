  ### How to generate the DB file

  - ./scripts/extract.js: get data from dissidiadb and dumps json files in the root
  - ./scripts/sheets.js: get data from the monster locator spreadsheet and dumps a json file at root
  - ./scripts/format.js: get the json files at root (hardcoded) and creates the db.json file

  ### Deploy
   - google cloud: setup a "start" script to start the server. Create a app.yaml with the gcloud notation. Install the gcloud CLI
```bash
    gcloud app deploy
```
    

  ### Acknowledgements
  u/marvan09 - monster locator spreadsheet (https://docs.google.com/spreadsheets/d/1NXh0Rng0sDL8RMd60TUUZC-5uD65O8expf-r3tlbXFs/edit#gid=0)
  u/phantasmage - dissidiadb (https://dissidiadb.com/)