![David](https://img.shields.io/david/rishichawda/testable.js.svg?style=popout)
![David](https://img.shields.io/david/dev/rishichawda/testable.js.svg?style=popout)
![GitHub issues](https://img.shields.io/github/issues/rishichawda/testable.js.svg?style=popout)

# Testable.js

A library that simplifies selecting nodes without changing your source code! Now you can spend more time ( and lines ) writing meaningful tests rather than navigating to correct nodes. :tada: :confetti_ball:

Using `testable.js`, you can now attach selectors to nodes you want to access while writing tests. No need to hard code them into your component's source code!

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
      "element-id": "element-path",
      "element-class": ["element-2-path"]
  };
  
  // Wrap the component with testable to attach ids to the elements.
  const TestableComponent = testable(Component, selectors);  // <------  This is where magic happens!
  
  // Mount the component.
  const wrapper = shallow(
    <TestableComponent />
  );
  
  // Test it out!
  wrapper.find("#element-id").to.have.lengthOf(1);
  wrapper.find(".element-class").to.have.lengthOf(1);
});
```

As you can see, the `testable` function takes two parameters - `Component` and `selectors`.

Here, `selectors` is an object with keys as selectors for element which you want to assign that selector to, and value for the key is the path to element.

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
    "header-id": "div>div>header",
};
```

Here, the path `div>div>header` represents the `header` element which is nested inside two `div`s.

<br />

Let's say you want to attach same class to the two `p` tags in your component. You can edit the selector object as follows :

```
const selector = {
    "header-id": "div>div>header",
    "paragraph-class": ["div>div(2)>p", "div>p"]
};
```

The path `div>div(2)>p` is interpreted as the paragraph element inside the second child of type `div` inside the `div` element at root of the component.

To attach a class name to any element, just pass the element(s) in an array and `testable` will automatically understand that you want to use the selector as a class name for the element(s). For attaching as an `id`, you just need to pass a path as a `string`.

<br/>

That's all! Now you have attached selectors to your elements without modifying the component source code and on the go while writing tests!

Moreover, now it is more readable for anyone else attempting to modify / update tests for your components! :eyes:

<br/>

If you run into any bug(s) or have a request, open an issue [here](https://github.com/rishichawda/testable.js/issues).

If you would like to contribute to the project, even better! Just fork the repository and open a pull request!
