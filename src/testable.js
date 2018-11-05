/* eslint-disable valid-jsdoc */
/* eslint-disable no-console */
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import hoistNonReactStatics from 'hoist-non-react-statics'

/**
 * Testable decorator.
 * @param {Node|ReactElement} TestableComponent - Component
 * @param {Object} selectors - Selectors
 * @returns {function(TestableComponent:Function):Function} - TestableComponent
 */
export default (TestableComponent, selectors = {}) => {
  /**
   * Wrapped instance of TestableComponent.
   * @class Testable
   * @extends {Component}
   */
  class Testable extends Component {
    /**
     * Creates an instance of Testable.
     * @param {*} args
     * @memberof Testable
     */
    constructor(...args) {
      super(...args)
      this._testableComponentRef = null
      this._rootNode = null
      this._treeNodes = {}
    }

    /**
     * Proptypes declaration for Testable.
     * @static
     * @memberof Testable
     */
    static propTypes = {
      ...TestableComponent.propTypes,
      selectorProp: PropTypes.arrayOf(PropTypes.string)
    };

    /**
     * Default props for Testable.
     * @static
     * @memberof Testable
     */
    static defaultProps = {
      ...TestableComponent.defaultProps,
      selectorProp: null
    };


    /**
     * Attach the element selector to node.
     * @memberof Testable
     */
    attachSelector = (selector, { nodeElement }) => {
      nodeElement.setAttribute('id', selector)
    }

    /**
     * Find path to the node.
     * If path exists, return true else false.
     * @param {arrayOf(string)} path - [Array of strings describing the path]
     * @memberof Testable
     */
    findPath = (path, rootNode) => {
      let currentNode = rootNode
      let isPathValid = true
      for (let index in path) {
        let node = path[index]
        let isValid = false
        for (let child in currentNode.children) {
          if (!isValid && currentNode.children[child].hasOwnProperty(node)) {
            isValid = true
            currentNode = currentNode.children[child][node]
            break
          }
        }
        if (!isValid) {
          isPathValid = false
          break
        }
      }
      return { valid: isPathValid, node: currentNode }
    };

    /**
     * Converts DOM tree recursively into object.
     * This is optimised for parsing the selectors and checking
     * their validity against the supplied component.
     * @param {DOMElement} _rootNode - [Current root node]
     * @memberof Testable
     */
    generateTreeNodes = _rootNode => {
      let branches = {}
      if (_rootNode.childElementCount) {
        const { children } = _rootNode
        for (let child in children) {
          const { localName } = children[child]
          if (localName) {
            branches[child] = {
              [localName]: {
                nodeElement: children[child],
                children: this.generateTreeNodes(children[child])
              }
            }
          }
        }
      }
      return branches
    };

    /**
     * Updates tree nodes when DOM is refreshed / as required.
     * @memberof Testable
     */
    updateTreeNodes = _rootNode => {
      this._treeNodes = {
        [_rootNode.localName]: { nodeElement: _rootNode, children: this.generateTreeNodes(_rootNode) }
      }
    };

    /**
     * Validate the given selectors against the DOM tree to check
     * for invalid selectors. If any invalid selector is found,
     * it is ignored.
     * @memberof Testable
     */
    validateSelectors = () => {
      for (let selector in selectors) {
        let path = selector.split('>')
        let { valid, node } = this._treeNodes.hasOwnProperty(path[0])
          ? this.findPath(path.slice(1), this._treeNodes[path[0]])
          : { valid: false, node: null }
        if (valid) {
          this.attachSelector(selectors[selector], node)
        }
      }
    };

    /**
     * To update and validate selectors whenever the component is updated.
     * @memberof Testable
     */
    componentDidUpdate() {
      this._rootNode = findDOMNode(this._testableComponentRef)
      this.updateTreeNodes(this._rootNode)
      this.validateSelectors()
    }

    /**
     * On mounting the component, generate the tree and validate selectors.
     * @memberof Testable
     */
    componentDidMount() {
      this._rootNode = findDOMNode(this._testableComponentRef)
      this.updateTreeNodes(this._rootNode)
      this.validateSelectors()
    }

    /**
     * @returns Wrapped component with new props.
     * @memberof Testable
     */
    render() {
      return React.createElement(TestableComponent, {
        ...this.props,
        ref: ref => (this._testableComponentRef = ref)
      })
    }
  }

  return hoistNonReactStatics(Testable, TestableComponent)
}
