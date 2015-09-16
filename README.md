# React-SlickGrid

> React wrapper component for [SlickGrid](https://github.com/defunctzombie/SlickGrid).

## Props and Options
Information coming soon...


## Setting Up with Local Data
React-SlickGrid requires just one prop to display local data: ```data```.
```
<ReactSlickGrid
  data={myObjectArray}
/>
```
 This prop should be an array objects that contains your row and column information as such:
 ```
 [
   { name: "Johnny Appleseed", profession: "Engineer", age: 31 },
   ...
 ]
 ```

## Setting Up with Remote (Ajax) Fetching

Remote fetching is built in to this component to work as simple as possible. All you need to do is supply the component with a few default props:
```
<ReactSlickGrid
  table="MyDatabaseTableOrCollection"
  endpoint='http://...'
  responseItem="responseProperty"
  filter={}
/>
```


### - table
A string of the name of the database table or collection you wish to query on the server.

### - endpoint
URL React-SlickGrid will use to request data whenever necessary. Then endpoint itself must be a POST and it should be built to receive the following object:
```
{
  table:     STRING  (database table or collection to query),
  limit:     INTEGER (number of records to fetch),
  skip:      INTEGER (number of records to offset),
  sort:      STRING  (sorted column),
  direction: STRING  (sorted column direction; 'ASC' or 'DESC'),
  filter:    OBJECT  (external filter prop for creating a WHERE clause)
}
```
Response must be JSON.

### - responseItem
This is the property from the JSON response that React-SlickGrid will use to generate your rows and columns. If your records are stored in the response property ```records``` as such:
```
{
  "records" : [
    { name: "Johnny Appleseed", profession: "Engineer", age: 31 },
    ...
  ]
}
```
Then you would give your component ```records``` as the ```responseItem``` prop:
```
<ReactSlickGrid
  responseItem="records"
  ...
/>
```

### - filter
An external JSON object that will be sent to the server for creating a WHERE clause.
