# Keymit (ALPHA)

## What is it?

Keymit is an object store that allows you to subscribe to changes at any depth
of the object store. You can subscribe to all changes in the store, changes to
only certain branches, or subscribe to only when a single value changes.

## Usage

#### Creating a keymit object

```js
const Keymit = require('keymit');

let keymit = new Keymit();
```

#### Settings keys values

```js
// Set/update values in the keysore with an object
keymit.set({
  canada: {
    ontario: {
      toronto: {
        population: 2615000,
        temperature: 27.8
      }
    }
  },
  usa: {
    texas: {
      huston: {
        population: 2196000,
        temperature: 30.2
      }
    }
  }
});

// Alternatively, you can set/update values with flat keys
// (default delimiter is a '.')
keymit.set({
  'canada.alberta.calgary': 'my string',
  'canada.alberta.edmonton': 123,
  'canada.ontario.london': [1, 2, 3],
  'usa.taxas.austin': 'my other string',
  'usa.texas.dalas': true
});

// If your keys values have been serialized from another language (such as C#),
// you can simply pass those too
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
  - Creates a new keymit instance.
  - **Parameters**
    - `String`: optional delimiter for all keys [default is '.']
- Delete
  - Deletes a branch or value from the store.
  - **Parameters**
    - `String`: optional delimited path to delete [defaults to deleting all records] 
- set
  - Sets a branch or value in the store.
  - **Parameters**
    - `String` or `Object`: The key string or object of key values
    - `*`: value to use if previous parameter was a string 
- get
  - Gets a branch or value from the store.
  - **Parameters**
    - `String`: optional delimited path to filter by
- subscribe
  - Adds a subscription.
  - **Parameters**
    - `String`: optional delimited path to subscribe to [defaults to all records]
    - `Function`: callback to run on change
    - `Object`: optional options
      - `Boolean`: **flatten** flatten the records with the delimiter before passing them back [default is false]
      - `Boolean`: **triggerNow** have the callback immediately execute with the current value [defaults is false]
      - `Boolean`: **lean** have only changes sent (excluding the initial triggerNow) [default is false]
- unsubscribe
  - Remove a subscription.
  - **Parameters**
    - `String`: optional delimited path to unsubscribe to [defaults to all records]
    - `Function`: callback to unsubscribe
- unsubscribeAll
  - Removes all subscriptions.

##### Properties

  - `listenerCount` (Number): Number of active subscriptions 

## Tests

Install `npm mocha` either local or globally and run `mocha tests`.
