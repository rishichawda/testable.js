import * as React from 'react';

declare module "testable" {
    type TReactTestableComponentId = {
        [key: string]: string
    }

    interface TestComponent<P, S> extends React.Component<P, S> {
    }

    interface TestableComponent<P, S> extends React.ComponentClass<P> {
        new(props?: P, context?: any): TestComponent<P, S>;
      }

    export function testable(
        selectors: Array<String>
      ): <P, S>(component: (new(props?: P, context?: any) => React.Component<P, S>) | React.SFC<P>) =>
        TestableComponent<P, S>;
}