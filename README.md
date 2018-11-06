# Testable.js

A library that simplifies selecting nodes without changing your source code! Now you can spend more time ( and lines ) writing meaningful tests rather than navigating to correct nodes. :tada: :confetti_ball:

Using `testable.js`, you can now attach `id`s to nodes you want to access while writing tests. No need to hard code them into your source code!

Also, you keep your source code clean and make tests easier to read and understand! :sparkles:

<br />

## :rocket: Installation :

```
npm install react-testable --save-dev
```

<br />

## Usage :

In your test file, import `testable` from `react-testable`, and use it like this : 

```
import { testable } from 'react-testable';
import Component from 'path/to/component';

...
...

it(
  'should run some tests and pass'
  , () => {
  
  // Define selector object with element selectors and unique-id pairs.
  const selectors =  {
      "element-selector": "element-id",
      "element-selector-2": "element-id-2"
  };
  
  // Wrap the component with testable to attach ids to the elements.
  const TestableComponent = testable(Component, selectors);  // <------  This is where magic happens!
  
  // Mount the component.
  const wrapper = shallow(
    <TestableComponent />
  );
  
  // Test it out!
  wrapper.find("#element-id").to.have.lengthOf(1);
  wrapper.find("#element-id-2").to.have.lengthOf(1);
});
```

**NOTE :** The above example is with [enzyme](https://github.com/airbnb/enzyme) and [chai](https://github.com/chaijs/chai), but you can use other test setups too!

As you can see, the `testable` function takes two parameters - `Component` and `selectors`.

`Component` is the component you want to test. `selectors` is an object with keys as selectors for element which you want to assign a unique id to.

<br />

Let's take a React Component for example :

```
import React, { Component } from 'react';

class MyComponent extends Component {
    render() {
        return (
            <div>
                <div>
                    <header>This is a simple header.</header>
                </div>
                <p>This is a simple paragraph.</p>
                <div>
                    <section>This is a random section.</section>
                    <p>This is another paragraph.</p>
                </div>
            </div>
        );
    }
}

export default MyComponent;
```

<br />

To attach an id to `header` tag, you can simply define the `selector` object in your `test.js` file as :

```
const selector = {
    "div>div>header": "header-id",
};
```

<br />

Let's say you want to attach some unique id to the `p` tag adjacent to the `section` element. You can edit the selector object as follows :

```
const selector = {
    "div>div>header": "header-id",
    "div>div(2)>p": "paragraph-id"
};
```

<br />

That's all! Your elements are now selectable with just `wrapper.find('#unique-id')`. No need to spend time (and lines) navigating inside nested elements!

<br />

If you run into any bug(s) or have a request, open an issue [here](https://github.com/rishichawda/testable.js/issues).

If you would like to contribute to the project, even better! Just fork the repository and open a pull request!
