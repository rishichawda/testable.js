/* eslint-disable valid-jsdoc */
/* eslint-disable no-console */
import React, { Component } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import hoistNonReactStatics from 'hoist-non-react-statics'

/**
 * @typedef {TReactTestableComponentId} TReactTestableComponentId
 * @property {TReactTestableComponentId} selectors
 */

/**
 * Testable decorator.
 * @param {Node|ReactElement} TestableComponent - Component
 * @param {TReactTestableComponentId} selectors - Selectors
 * @returns {function(TestableComponent:Function):Function} - TestableComponent
 */
export default (TestableComponent, selectors = []) => {
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
      this._properties = [ 'class', 'id' ]
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
    attachSelector = (selector, { nodeElement }, property) => {
      property === this._properties[0]
        ? nodeElement.classList.add(selector)
        : nodeElement.setAttribute(property, selector)
    };

    /**
     * Whitespace cleanup for path.
     * @memberof Testable
     */
    cleanPath = path => {
      for (let x in path) {
        path[x] = path[x].trim()
      }
      return path
    };

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
        let nodeCount = 1
        if (node.indexOf('(') !== -1) {
          nodeCount = +node.slice(node.indexOf('(') + 1, node.indexOf(')'))
          node = node.slice(0, node.indexOf('('))
        }
        if (currentNode.children.hasOwnProperty(node)) {
          currentNode = currentNode.children[node][nodeCount - 1]
        } else {
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
            if (branches[localName]) {
              branches[localName].push({
                children: this.generateTreeNodes(children[child]),
                nodeElement: children[child]
              })
            } else {
              branches[localName] = [
                {
                  children: this.generateTreeNodes(children[child]),
                  nodeElement: children[child]
                }
              ]
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
        [_rootNode.localName]: {
          nodeElement: _rootNode,
          children: this.generateTreeNodes(_rootNode)
        }
      }
    };

    /**
     * @param {arrayOf(string)} path
     * @param {string} selector
     * @param {string} property
     * @memberof Testable
     */
    validate = (path, selector, property) => {
      let { valid, node } = this._treeNodes.hasOwnProperty(path[0])
        ? this.findPath(path.slice(1), this._treeNodes[path[0]])
        : { valid: false, node: null }
      if (valid) {
        this.attachSelector(selector, node, property)
      } else {
        console.error(
          `Error: Cannot find the DOM node at "${path.join(
            ' > '
          )}". Invalid path provided to testable.js`
        )
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
        let path = selectors[selector]
        if (typeof path === 'object') {
          for (let index in path) {
            let nPath = this.cleanPath(path[index].split('>'))
            this.validate(nPath, selector, this._properties[0])
          }
        } else {
          path = this.cleanPath(path.split('>'))
          this.validate(path, selector, this._properties[1])
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
