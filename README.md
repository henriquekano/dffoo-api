  ### How to generate the DB file

  - ./scripts/extract.js: get data from dissidiadb
  - ./scripts/sheets.js: get data from the monster locator spreadsheet
  - ./scripts/format.js: creates the db.json file
  - ./scripts/extractAltema.js: extract banner information from altema
  - ./scripts/alterBanner.js: uses the extracted altema's banner data and the current banner.json to create a new banner.json. Add new banner info (with id) to banner.json to autocomplete.
  - ./scripts/buildDb.js: run everything in the appropriate order and writes the db.json file.

  ### Deploy
   - google cloud: setup a "start" script to start the server. Create a app.yaml with the gcloud notation. Install the gcloud CLI
```bash
    gcloud app deploy
```
    

  ### Acknowledgements
  u/marvan09 - monster locator spreadsheet (https://docs.google.com/spreadsheets/d/1NXh0Rng0sDL8RMd60TUUZC-5uD65O8expf-r3tlbXFs/edit#gid=0)
  u/phantasmage - dissidiadb (https://dissidiadb.com/)
  altema (https://altema.jp/dffoo)