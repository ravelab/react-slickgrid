var router = require ("express").Router ();
var database = require ('../database/connection');

 /*
  *  Fetches the records off a specific table MySQL table.
  *  -- The DataTable components sends in a few parameters, leveraged in querying:
  *    -- table     : MySQL table that will be queried
  *    -- sort      : The column that will be used in ORDER BY
  *    -- direction : Whether the sorting is ASC or DESC
  *    -- limit     : Record fetching LIMIT (default; 200)
  *    -- skip      : Number of records to skip or OFFSET based on scroll index
  *    -- filter    : JSON object for generating a WHERE statement
  */
 router.post ('/', function (req, res) {
   if (!req.body) return res.sendStatus (400);

   var table = req.body.table;
   var sort = req.body.sort;
   var direction = req.body.direction;
   var limit = parseInt (req.body.limit);
   var skip = parseInt (req.body.skip);
   var filter = req.body.filter;

   var records_query = '';
   if (typeof sort === 'undefined') {
     records_query = (
       'SELECT * FROM `' + table + '` ' +
         'LIMIT ' + limit + ' OFFSET ' + skip
     );
   } else {
     records_query = (
       'SELECT * FROM `' + table + '` ' +
         'ORDER BY ' + sort + ' ' + direction + ' ' +
         'LIMIT ' + limit + ' OFFSET ' + skip
     );
   }

   var count_query = 'SELECT COUNT(*) AS count FROM `' + table + '`';

   var payload = {};
   database.query (records_query, function (error, rows) {
     if (error || rows.length === 0) {
       res.send (error ? error : { error: '0 rows returned' });
     } else {
       payload.records = rows;
       database.query (count_query, function (error, rows) {
         if (error || rows.length === 0) {
           res.send (error ? error : { error: '0 rows returned' });
         } else {
           payload.count = rows[0].count;
           database.query ('SELECT * FROM `filters`', function (error, rows) {
             payload.primaryColumn = 'id';
             payload.skip = skip;
             res.send (payload);
           });
         }
       });
     }
   });
 });

module.exports = router;
