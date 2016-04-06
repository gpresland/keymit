# Keymit (ALPHA)

## What is it?

Keymit is an object store that allows you to subscribe to changes at any depth
of the object store. You can subscribe to all changes in the store, changes to
only certain branches, or subscribe to only when a single value changes.

## Usage

#### Creating a keymit object

```js
const Keymit = require('deepkey');

let keymit = new Keymit();
```

#### Settings keys values

```js
// Set/update values in the keysore with an object
keymit.set({
  canada: {
    ontario: {
      toronto: 1
    }
  },
  usa: {
    texas: {
      huston: 1
    }
  }
});

// Alternatively, you can set/update values with flat keys (default delimiter is a '.')
keymit.set({
  'canada.alberta.calgary': 'my string',
  'canada.alberta.edmonton': 123,
  'canada.ontario.london': [1, 2, 3],
  'usa.taxas.austin': 'my other string',
  'usa.texas.dalas': true
});

// If your keys values have been serialized from another language, you can use those too
keymit.set([
  { 'canada.alberta.calgary': 'my string' },
  { 'canada.alberta.edmonton': 123 },
  { 'canada.ontario.london': [1, 2, 3] },
  { 'usa.taxas.austin': 'my other string' },
  { 'usa.texas.dalas': true }
]);
```

#### Gettings key values

```js
// Get a copy of all values
let all = keymit.get();

// Get a copy of only specific path
let ontario = keymit.get('canada.ontario');
```

#### Subscribing

```js
function onChange(record) {
  console.log(record);
}

// Subscribe to all records
keymit.subscribe(onChange);

// Subscribe to only a portion of the records
keymit.subscribe('canada.ontario', onChange);

// Subsribe to only a single record
keymit.subscribe('canada.ontario.toronto', onChange);
```

#### Unsubscribing

```js
function onChange(record) {
  console.log(record);
}

// Unsubscribe to all records
keymit.unsubscribe(onChange);

// Unsubscribe to only a portion of the records
keymit.unsubscribe('canada.ontario', onChange);

// Unsubscribe to only a single record
keymit.unsubscribe('canada.ontario.toronto', onChange);
```

## Documentation

##### Methods

- ()
  - **Parameters**
    - `String`: optional delimiter for all keys [default is '.']
- Delete
  - **Parameters**
    - `String`: optional delimited path to delete [defaults to deleting all records] 
- set
  - **Parameters**
    - `String` or `Object`: The key string or object of key values
    - `*`: value to use if previous parameter was a string 
- get
  - **Parameters**
    - `String`: optional delimited path to filter by
- subscribe
  - **Parameters**
    - `String`: optional delimited path to subscribe to [defaults to all records]
    - `Function`: callback to run on change
    - `Boolean`: optionally have the callback immediately execute with the current value [defaults is true]
- unsubscribe
  - **Parameters**
    - `String`: optional delimited path to unsubscribe to [defaults to all records]
    - `Function`: callback to unsubscribe

## Tests

Tests under `tests/` use `npm mocha` module.
