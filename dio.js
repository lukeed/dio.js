/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio.js 
 * @author Sultan Tarimo <https://github.com/thysultan>
 * @license MIT
 */
(function (root, factory) {
	'use strict';

	// amd
    if (typeof define === 'function' && define.amd) {
        // register as an anonymous module
        define([], factory);
    }
    // commonjs
    else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        factory(exports);
    } 
    // browser globals
    else {
        factory(root);
    }
}(this, function (exports) {
	'use strict';

	// references for better minification
	// so instead of obj.constructor we would do obj[__constructor].
	// the minifier will then be able to minify that to something like
	// o[c] og which it can't quite do the the former baked in.
	var

	// signatures
	__signatureBase             = '@@dio',
	__streamSignature           = __signatureBase + '/STREAM',
	__storeSignature            = __signatureBase + '/STORE',
	__componentSignature        = __signatureBase + '/COMPONENT',
	__hyperscriptSignature      = __signatureBase + '/HYPERSCRIPT',

	// objects
	__namespace 				= {
		math:  'http://www.w3.org/1998/Math/MathML',
		xlink: 'http://www.w3.org/1999/xlink',
		svg:   'http://www.w3.org/2000/svg',
		html:  'http://www.w3.org/1999/xhtml'
	},
	__document                  = document,
	__window                    = window,

	// types
	__null                      = null,
	__false                     = false,
	__true                      = true,
	__undefined                 = void 0,

	// properties
	__constructor               = 'constructor',
	__prototype                 = 'prototype',
	__length                    = 'length',
	__childNodes                = 'childNodes',
	__children                  = 'children',
	__classList                 = 'classList',
	__className                 = 'className',

	// lifecycle properties
	__getInitialState           = 'getInitialState',
	__getDefaultProps           = 'getDefaultProps',
	__componentWillReceiveProps = 'componentWillReceiveProps',
	__componentDidMount         = 'componentDidMount',
	__componentWillMount        = 'componentWillMount',
	__componentWillUnmount      = 'componentWillUnmount',
	__componentWillUpdate       = 'componentWillUpdate',
	__componentDidUpdate        = 'componentDidUpdate',
	__shouldComponentUpdate     = 'shouldComponentUpdate',

	// functions
	__number                    = Number,
	__array                     = Array,
	__object                    = Object,
	__function                  = Function,
	__string                    = String,
	__boolean                   = Boolean,
	__XMLHttpRequest            = XMLHttpRequest,
	__RegExp                    = RegExp,
	__encodeURIComponent        = encodeURIComponent,
	__setTimeout                = __window.setTimeout;


	/**
	 * convert arguments to arrays
	 * @param  {arugments} arg - array like object
	 * @return {Array}
	 */
	function toArray (arg, index, end) {
		return __array[__prototype].slice.call(arg, index, end);
	}

	
	/**
	 * 'forEach' shortcut
	 * @param  {Array|Object} a 
	 * @param  {Function}     fn
	 * @param  {Boolean}      multiple
	 * @return {Array|Object}
	 */
	function each (arr, fn) {
		// index {Number}
		var 
		index;

		// Handle arrays, and array-like Objects, 
		// array-like objects (have prop .length 
		// that is a number) and numbers for keys [0]
		if (
			is(arr, __array) ||
			arr[__length] && is(arr[__length], __number) && arr[0]
		) {
			// length {Number}
			var 
			length = arr[__length]
			index  = 0;

			for (; index < length; ++index) {
				// break if fn() returns false
				if (fn.call(arr[index], arr[index], index, arr) === __false) {
					return;
				}
			}
		}
		// Handle objects 
		else {
			for (index in arr) {
				// break if fn() returns false
				if (fn.call(arr[index], arr[index], index, arr) === __false) {
					return;
				}
			}
		}
	}


	/**
	 * check Object type
	 * @param  {Any}  obj  - object to check for type
	 * @param  {Any}? type - type to check for
	 * @return {Boolean}   - true/false
	 */
	function is (obj, type) {
		// check if the object is falsey/truethy
		if (!type) {
			return obj ? __true : __false;
		}
		// check if the object of the specified type
		else {
			// obj has a constructor, 
			// we also avoid null values since null has an object constructor
			if (obj !== __undefined && obj !== __null) {
				return obj[__constructor] === type;
			}
			// doesn't have a constructor, is undefined 
			else {
				return __false;
			}
		}
	}


	/**
	 * push task to the event stack
	 * @param  {Function} fn      
	 * @param  {Number?}  duration - delay
	 */
	function debounce (fn, duration) {
		// we may want a custom duration for setTimeout
		duration = duration || 0;

		// push to the end of the event stack
		__setTimeout(fn, duration);
	}


	/**
	 * component lifecycle trigger
	 * @param  {Object}         node  - component, or hyperscript
	 * @param  {String}         state - stage of the lifecycle
	 * @param  {Boolean|Object} props - weather to pass props to stage
	 * @param  {Boolean|Object} state - weather to pass sate to stage
	 * @params {Boolean}        isCmp - weather this is a component or not
	 */
	function lifecycle (node, stage, isComponent, props, state, wildcard) {
		// end quickly
		// if node is not a Component or hyperscript object
		if (!node || 
			(
				node && node[__hyperscriptSignature] && 
				!node[__hyperscriptSignature][__componentSignature] &&
				!node.render
			)
		) {
			return;
		}

		var 
		component;
		
		// node is the component
		if (isComponent) {
			component = node;
		}
		// node is a hyperscript object
		// check if it has a component reference
		else if (
			node && 
			node[__hyperscriptSignature] && 
			node[__hyperscriptSignature][__componentSignature]
		) {
			component = node[__hyperscriptSignature][__componentSignature];
		}

		if (component && component[stage]) {
			// is the props/state truthy? if so check if it is not a boolean
			// if so default to the value in props/state passed, 
			// if it is default to the components own props.
			// if props/state is falsey value, 
			// default to undefined

			// props is either the value of the props passed as an argument
			// or the value of the components
			props = props || component.props,
			state = state || component.state;

			// componentShouldUpdate returns a Boolean
			// so we publish the lifecycle return values
			// which we can use in the vdomToDOM / update () function
			// to see if we should skip an element or not
			return component[stage](props, state, component, wildcard);
		}
	}


	/**
	 * create virtual element : h()
	 * @param  {String} type  - Element, i.e: div
	 * @param  {Object} props - optional properties
	 * @return {Object}       - {type, props, children}
	 * @example
	 * h('div', {class: 'close'}, 'Text Content')
	 * h('div', null, h('h1', 'Text'))
	 */
	function element () {
		function h (type, props) {			
			var 
			args   = arguments,
			length = args[__length],
			// position where children elements start
			key    = 2,
			child;

			// no props specified default 2nd arg to 
			// the position that children elements start
			// and default props to an empty object
			if (
				(props && props[__hyperscriptSignature]) ||
				!is(props, __object)
			) {
				key   = 1;
				props = {};
			}
			// otherwise just insure props is always an object
			else if (
				props === __null || 
				props === __undefined || 
				!is(props, __object)
			) {
				props = {};
			}

			// declare the hyperscript object
			var
			obj = new hyperscriptClass({type: type, props: props, children: []});

			// check if the type is a special case i.e [type] | div.class | #id
			// and alter the hyperscript
			if (
				type.indexOf('[') > -1 ||
				type.indexOf('#') > -1 || 
				type.indexOf('.') > -1
			) {
				obj = parseElementType(obj);
			}

			// auto set namespace for svg and math elements
			// but only if it's not already set
			if ((obj.type === 'svg' || obj.type === 'math') && !obj.props.xmlns) {
				obj.props.xmlns = __namespace[obj.type];
			}

			// construct children
			for (var i = key; i < length; i++) {
				// reference to current layer
				child = args[i];
		
				// if the child is an array go deeper
				// and set the 'arrays children' as children
				if (is(child, __array)) {
					var 
					childLength = child[__length];

					for (var j = 0; j < childLength; j++) {
						obj[__children][(i - key) + j] = setChild(child[j]);
					}
				}
				// deep enough, add this child to children
				else {
					obj[__children][i - key] = setChild(child);
				}
			}

			return obj;
		}

		/**
		 * hyperscript set children
		 * @param  {Any} a
		 * @return {String|Array|Object}
		 */
		function setChild (child) {
			// convert non string children
			// to strings
			if (
				// checks if it is null/undefined
				!is(child) ||
				is(child, __number) || 
				is(child, __boolean)
			) {
				// for non objects adding a strings is enough 
				child = child + '';

				// convert the null, and undefined strings to empty strings
				// we don't convert false since that could 
				// be a valid textnode value returned to the client
				if (child === 'null' || child === 'undefined') {
					child = '';
				}
			}
			
			return child;
		}

		/**
		 * hyperscript tagger
		 * @param  {Object} a - object with opt props key
		 * @param  {Object} b - tag
		 * @return {[Object]} - {props, type}
		 * @example
		 * // return {type: 'input', props: {id: 'id', type: 'checkbox'}}
		 * tag('inpu#id[type=checkbox]')
		 */
		function parseElementType (obj) {
			var 
			classes = [], 
			match,
			// regex to parse type/tag
			regex = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g,
			// copy obj's props to abstract props and type
			// incase obj.props is empty create new obj
			// otherwise just add to already available object
			// we will add this back to obj.props later
			props = !obj.props ? {} : obj.props,
			// since we use type in a while loop
			// we will be updating obj.type directly
			type = obj.type
			// set default type to a div
			obj.type = 'div';

			// execute the regex and loop through the results
			while ((match = regex.exec(type))) {
				var 
				matchedType      = match[1],
				matchedValue     = match[2],
				matchedProp      = match[3],
				matchedPropKey   = match[4],
				matchedPropValue = match[6];

				// no custom prop match
				if (matchedType === '' && matchedValue !== '') {
					obj.type = matchedValue;
				}
				// matches id's - #id
				else if (matchedType === '#') {
					props.id = matchedValue;
				} 
				// matches classes - div.classname
				else if (matchedType === '.') {
					classes.push(matchedValue);
				} 
				// matches - [prop=value]
				else if (matchedProp[0] === '[') {
					var 
					prop = matchedPropValue;

					// make sure we have a prop value
					if (prop) {
						prop = prop.replace(/\\(["'])/g, '$1').replace(/\\\\/g, "\\");
					}
					// if prop value is an empty string assign true
					props[matchedPropKey] = prop || __true;
				}
			}

			// add classes to obj.props if we have any
			if (classes[__length] > 0) {
				props.class = classes.join(' ');
			}

			// as promised, update props
			obj.props = props;
			
			// done
			return obj;
		}

		var 
		hyperscriptClass = getHyperscriptClass();

		return h;
	}


	/**
	 * diff virtual component and update dom
	 * @param {Element} parent   - dom node
	 * @param {Object}  newNode
	 * @param {Object}  oldNode?
	 * @param {Number}  index? 
	 * @param {Object}  component?
	 */
	function vdomToDOM (parent, newNode, oldNode, component) {
		// diff and update dom loop
		function update (parent, newNode, oldNode, index, component, newChildren, oldChildren) {
			index = index || 0;

			// adding to the dom
			if (oldNode === __undefined && newNode) {
				appendChild(parent, createElement(newNode, component), newNode);
			}
			// removing from the dom
			else if (newNode === __undefined) {
				removeChild(parent, nextNode = parent[__childNodes][index], oldNode);
			}
			// update keyed elements
			else if (
				(newNode.props && oldNode.props) && 
				(newNode.props.key || oldNode.props.key) &&
				(newNode.props.key !== oldNode.props.key)
			) {
				var 
				newLength    = newChildren[__length],
				oldLength    = oldChildren[__length],
				op,
				nextNode;

				// element added
				if (newLength > oldLength) { 
					op = +1;
				}
				// element remove
				else if (newLength < oldLength ) { 
					op = -1;
				}

				return updateKeyedElements(parent, oldChildren, op, index, newNode);
			}
			// replacing a node
			else if (nodeChanged(newNode, oldNode)) {
				var 
				prevNode = parent[__childNodes][index],
				isTextNode;

				// textContent optimization
				if (is(newNode, __string) && prevNode.nodeType === 3) {
					nextNode   = newNode;
					isTextNode = __true;
				}
				else {
					nextNode = createElement(newNode);
				}

				replaceChild(parent, nextNode, prevNode, newNode, isTextNode);
			}
			// the lookup loop
			else if (newNode.type) {
				var 
				parentChildren = parent[__childNodes],
				nextNode       = parentChildren[index],
				newLength      = newNode[__children][__length],	
				oldLength      = oldNode[__children][__length];

				// update props
				handlePropChanges(nextNode, newNode, oldNode);

				// loop through children
				for (var i = 0; i < newLength || i < oldLength; i++) {
					var 
					newChildren = newNode[__children],
					oldChildren = oldNode[__children],
					newChild    = newChildren[i],
					oldChild    = oldChildren[i];

					// should component update? if so skip it
					if (shouldComponentUpdate(newChild)) {
						return;
					}

					var
					key = update(
							nextNode, 
							newChild, 
							oldChild, i, 
							__undefined, 
							newChildren, 
							oldChildren
						);

					if (key !== __undefined) {
						newLength += key,
						oldLength += key;
					}
				}	
			}
		}

		function shouldComponentUpdate (newNode) {
			return (
				newNode &&
				newNode[__shouldComponentUpdate] &&
				newNode[__shouldComponentUpdate] === __false
			);
		}

		// update/remove/add keyed elements
		function updateKeyedElements (parent, oldChildren, op, index, newNode) {
			var 
			nextNode,
			currentNode = parent[__childNodes][index];

			// create next node for addition and replace opreations
			if (op > 0 || !op) { 
				nextNode = createElement(newNode) ;
			}

			// element added
			if (op > 0) {
				oldChildren.splice(index, 0, __undefined);
				prependChild(parent, nextNode, currentNode, newNode);
			}
			// element removed
			else if (op < 0) {
				oldChildren.splice(index, 1);
				removeChild(parent, currentNode, newNode);
				// we have to decreement the children length
				return -1;
			}
			// replace
			else {
				replaceChild(parent, nextNode, currentNode, newNode);
			}
		}

		// remove element
		function removeChild (parent, nextNode, oldNode) {
			if (nextNode) {

				// execute componentWillUnmount lifecycle, 
				// store it's return into durtion
				// we can use this to delay unmounting a node from the dom
				// if a time{Number} in milliseconds is returned.
				var 
				duration = lifecycle(
					oldNode, 
					__componentWillUnmount, 
					__undefined, 
					__undefined, 
					__undefined,
					nextNode
				);

				// either duration is a number or it's default 0
				if (!is(duration, __number)) {
					duration = 0;
				}

				debounce(function () {
					// since we debounce this action
					// we check again to see if nextNode is still actually in the dom
					// when this is executed
					if (nextNode) {
						parent.removeChild(nextNode);
					}
				}, duration);
			}
		}

		// add element to the end
		function appendChild (parent, nextNode, newNode) {
			if (nextNode) {
				lifecycle(newNode, __componentWillMount);
				parent.appendChild(nextNode);
				lifecycle(newNode, __componentDidMount);
			}
		}

		// add element at the beginning
		function prependChild (parent, nextNode, beforeNode, newNode) {
			if (nextNode) {
				lifecycle(newNode, __componentWillMount);			
				parent.insertBefore(nextNode, beforeNode);
				lifecycle(newNode, __componentDidMount);
			}
		}

		// replace element
		function replaceChild (parent, nextNode, prevNode, newNode, isTextNode) {
			if (nextNode && prevNode) {	
				// textNodes do not have attributes
				// so we can just update the textContent property,
				// which is faster
				if (isTextNode) {
					prevNode.textContent = nextNode;
				}
				else {
					lifecycle(newNode, __componentWillUpdate);
					parent.replaceChild(nextNode, prevNode);
					lifecycle(newNode, __componentDidUpdate);
				}
			}
		}

		// diffing two nodes
		function nodeChanged (node1, node2) {
			var 
			// diff object type
			obj  = node1[__constructor] !== node2[__constructor],

			// diff text content
			text = !is(node1, __object) && node1 !== node2,

			// diff node type
			// if this is an element diff it's type
			// i.e node.type: div !== node.type: h2
			// will return true, signaling that we should
			// replace the node, if it's a text node
			type = node1.type !== node2.type;
			
			// if either text/type/object constructor has changed
			// this will return true signaling that we should replace the node
			return text || type || obj;
		}

		// create element
		function createElement (node, component, ns) {			
			// handle text nodes
			if (
				node !== __undefined &&
				(
					node[__constructor] === __string ||
					node[__constructor] === __number ||
					node[__constructor] === __boolean
				)
			) {
				return __document.createTextNode(node);
			}

			var 
			el,
			ns;

			// assign namespace if set
			if (node.props && node.props.xmlns) {
				ns = node.props.xmlns;
			}

			// namespaced
			if (ns) {
				el = __document.createElementNS(ns, node.type);
			}
			// default
			else {
				el = __document.createElement(node.type);
			}

			// check if refs are defined?
			if (node.props && node.props.ref) {
				var
				ref = node.props.ref

				// we have a component and string ref
				if (component && is(ref, __string)) {
					// create the refs object if it doesn't already exist
					component.refs = component.refs || {};
					// set string refs
					component.refs[ref] = el;
				}
				// function ref, execute and pass the element as a parameter
				else if (is(ref, __function)) {
					ref(el);
				}
			}

			// diff and update/add/remove props
			setElementProps(el, node.props);
			// add events if any
			addEventListeners(el, node.props);
			
			// only map children arrays
			if (is(node[__children], __array)) {
				each(node[__children], function (child) {
					el.appendChild(createElement(child, component, ns));
				});
			}
		
			return el;
		}

		// check if props is event
		function isEventProp (name, value) {
			// checks if the first two characters are on
			return name.substr(0,2) === 'on' && is(value, __function);
		}
		
		// get event name
		function extractEventName (name) {
			// removes the first two characters and converts to lowercase
			return name.substr(2, name[__length]).toLowerCase();
		}
		
		// add event
		function addEventListeners (target, props) {
			for (var name in props) {
				var 
				value = props[name];

				if (isEventProp(name, value)) {
					// is a callback
					if (value) {
						target.addEventListener(extractEventName(name), value, __false);
					}
				}
			}
		}

		function handlePropChanges (target, newNode, oldNode) {
			// get changes to props/attrs
			var
			propChanges = getPropChanges(newNode.props, oldNode.props);

			// if there are any prop changes,
			// update component props
			if (propChanges[__length]) {
				// before props change
				lifecycle(newNode, __componentWillUpdate);

				each(propChanges, function (obj) {
					updateProp(target, obj.name, obj.value, obj.op);
				});

				// after props change
				lifecycle(newNode, __componentDidUpdate);
			}
		}
		
		// update props
		function getPropChanges (newProps, oldProps) {
			var 
			changes  = [];

			oldProps = oldProps || {};

			// merge old and new props
			var
			props = {};

			for (var name in newProps) { 
				props[name] = newProps[name];
			}
			for (var name in oldProps) { 
				props[name] = oldProps[name];
			}

			// compare if props have been added/delete/updated
			// if name not in newProp[name] : deleted
			// if name not in oldProp[name] : added
			// if name in oldProp !== name in newProp : updated
			for (var name in props) {
				var 
				oldVal = oldProps[name],
				newVal = newProps[name],
				// returns true/false if the prop has changed from it's prev value
				remove = newVal === __undefined || newVal === __null,
				// says only diff this if it's not an event i.e onClick...
				add    = oldVal === __undefined || oldVal === __null || 
						(newVal !== oldVal && !isEventProp(name, props[name])),

				// store value
				value  = remove === -1 ? oldVal : newVal;

				// something changed
				if (add || remove) {
					// we can then add this to the changes arr
					// that we can check later to see if any props have changed
					// and update the props that have changed
					changes.push({
						name:   name, 
						value:  value,
						op: add || remove
					});
				}
			}

			return changes;
		}
		
		// initial creation of props, no checks, just set
		function setElementProps (target, props) {
			for (var name in props) {
				updateProp(target, name, props[name], +1);
			}
		}

		// assign/update/remove prop
		function updateProp (target, name, value, op) {
			// don't add events/refs/keys as props/attrs
			if (
				name === 'ref' || 
				name === 'key' ||
				isEventProp(name, value)
			) {
				return;
			}

			// prop operation type, either remove / set
			if (op === -1) {
				op = 'removeAttribute';
			}
			else {
				op = 'setAttribute';
			}
		
			// set xlink:href attr
			if (name === 'xlink:href') {
				return target[op+'NS'](__namespace['xlink'], 'href', value);
			}

			// don't set xmlns namespace attributes we create an element
			if (value !== __namespace['svg'] && value !== __namespace['math']) {
				// the className property of svg elements are of a different kind
				// lets normalize it
				if (name === __className) {
					name = 'class';
				}

				// value is an object
				// add each of it's properties to the
				// target elements attribute
				if (is(value, __object)) {
					// classes
					if (name === 'class') {
						each(value, function (content, index) {
							// get what operation we will run
							// if the value is empty/false/undefined/null
							// we remove
							// if the values length is more than 0
							// or true or anything not of a falsy value
							// we add
							var 
							type = !content ? 'remove' : 'add';

							// add/remove class
							// target.classList[type](index)
							classList(type, target, index);
						});
					}
					// styles and other object {} type props
					else {
						each(value, function (value, index) {
							if (!is(target[name][index])) {
								target[name][index] = value;
							}
						});
					}
				}
				// is an array of classes
				// this allows us to set classess like 
				// class: ['class1', 'class2']
				else if (is(value, __array) && (name === 'class')) {
					target[op](name, value.join(' '));
				}
				// everything else
				else {
					if (
						target[name]       !== __undefined &&
						target.namespaceURI == __namespace['html']
					) {
						target[name] = value;
					}
					else {
						target[op](name, value);
					}
				}
			}
		}

		update(parent, newNode, oldNode, __undefined, component);
	}


	/**
	 * animate interface
	 * @return {Object} {flip, animate}
	 */
	function animate () {
		/**
		 * flip animate component/element
		 * @param  {Element} element   
		 * @param  {Array}   transforms 'describe additional transforms'
		 * @param  {Number}  duration   'duration of the animation'
		 * @param  {String}  className  'class that represents end state animating to'
		 * @return {Void}
		 * @example
		 * h('.card', {onclick: animate}, h('p', null, a)) 
		 * // className defaults to animation-active end class
		 * // duration defaults to 220ms
		 * // or 
		 * h('.card', {onclick: animate(400, 'active-state', null, 'linear')})
		 * // or 
		 * animate(duration{400},'endClassName'{'.class'},'extra transforms'{'rotate(25deg)')})
		 */
		function flip (className, duration, transformations, transformOrigin, easing) {
			return function (element, callback) {
				transformations  = transformations || '';

				// get element if selector
				if (is(element, __string)) {
					element = document.querySelector(element);
				}

				// check if element exists
				if (!element && element.nodeType) {
					throw 'can\'t animate without an element'
				}

				var
				first, 
				last,
				webAnimations,
				transform        = {},
				invert           = {},
				element          = element.currentTarget || element,
				style            = element.style,
				body             = __document.body,
				runningClass     = 'animation-running',
				transEvtEnd      = 'transitionend';

				// animation type
				// if this is set we opt for the more performant
				// web animations api
				if (is(element.animate, __function)) {
					webAnimations = __true;
				}

				// promote element to individual composite layer
				if (style.willChange !== __undefined) {
					style.willChange = 'transform';
				}

				// get first rect state
				first = getBoundingClientRect(element);
				// assign last state if there is an end class
				if (className) {
					classList('toggle', element, className);
				}
				// get last rect state, 
				// if there is no end class
				// then nothing has changed, save a reflow and just use the first state
				last = className ? getBoundingClientRect(element) : first;

				// get invert values
				invert.x  = first.left   - last.left,
				invert.y  = first.top    - last.top,
				invert.sx = last.width  !== 0 ? first.width  / last.width  : 1,
				invert.sy = last.height !== 0 ? first.height / last.height : 1,

				duration  = duration || 200,
				easing    = easing   || 'cubic-bezier(0,0,0.32,1)',

				transform['1'] = 'translate('+invert.x+'px,'+invert.y+'px) translateZ(0)'+
								' scale('+invert.sx+','+invert.sy+')',
				transform['1'] = transform['1'] + ' ' + transformations,
				transform['2'] = 'translate(0,0) translateZ(0) scale(1,1) rotate(0) skew(0)';

				// assign transform origin if set
				if (transformOrigin) {
					prefix(style, 'transformOrigin', transformOrigin);
				}

				// reflect animation state on dom
				classList('add', element, runningClass);
				classList('add', body, runningClass);

				// use native web animations api if present for better performance
				if (webAnimations) {
					var 
					player = element.animate([
				  		{transform: transform['1']},
				  		{transform: transform['2']}
					], {
						duration: duration,
						easing:   easing
					});

					player.addEventListener('finish', onfinish);
				}
				// use css transitions
				else {
					// set first state
					prefix(style, 'transform', transform['1']);

					// trigger repaint
					element.offsetWidth;
					
					// setup to animate when we change to the last state
					// will only transition transforms and opacity
					prefix(
						style, 
						'transition', 
						'transform '+duration+'ms '+easing + ', '+
						'opacity '+duration+'ms '+easing
					);

					// set last state
					prefix(style, 'transform', transform['2']);
				}

				// cleanup
				function onfinish (e) {
					if (!webAnimations) {
						// bubbled events
						if (e.target !== element) {
							return;
						}

						prefix(style, 'transition', __null);
						prefix(style, 'transform', __null);
					}
					else {
						transEvtEnd = 'finish'
					}

					element.removeEventListener(transEvtEnd, onfinish);

					prefix(style, 'transformOrigin', __null);
					
					if (style.willChange) {
						style.willChange = __null;
					}

					classList('remove', element, runningClass);
					classList('remove', body, runningClass);

					if (callback) {
						callback(element);
					}
				}

				if (!webAnimations) {
					element.addEventListener(transEvtEnd, onfinish);
				}

				return duration;
			}
		}

		/**
		 * transition an element then run call back after
		 * the transition is complete
		 */
		function transition (className) {
			return function (element, callback) {
				// add transition class
				// this will start the transtion
				classList('add', element, className);

				var
				// duration starts at 0
				// for every time we find in transition-duration we add it to duration
				duration   = 0,
				// get transition duration and remove 's' and spaces
				// we will get from this '0.4s, 0.2s' to '0.4,0.2'
				// we then split it to an array ['0.4','0.2']
				// note: the numbers are still in string format
				transition = getComputedStyle(element)
				transition = transition['transitionDuration'];
				transition = transition.replace(/s| /g, '').split(',');

				// increament duration (in ms), also convert all values to a number
				each(transition, function (value) {
					duration += parseFloat(value) * 1000;
				});

				// run callback after duration of transition
				// has elapsed
				if (callback) {
					__setTimeout(function () {
						callback(element);
					}, duration);
				}
			}
		}

		/**
		 * get elements client rect and return a mutable object
		 * with top, left, width, and height values
		 * @param  {Element} element - element to run getBoundingClientRect on
		 * @return {Object}          - {top, left, width, height}
		 */
		function getBoundingClientRect (element) {
			var 
			rect = element.getBoundingClientRect();

			return {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height
			};
		}

		/**
		 * prefix css props
		 * @param  {Object} style - the elements style object
		 * @param  {String} prop  - prop to set
		 * @param  {String} value - value of the prop
		 */
		function prefix (style, prop, value) {
			// exit early if we support un-prefixed prop
	  		if (style && style[prop] === __null) {
	  			// chrome, safari, mozila, ie
    			var 
    			vendors = ['webkit','Webkit','Moz','ms'];

	      		for (var i = 0; i < vendors[__length]; i++) {
	      			// vendor + capitalized prop
	      			prop = vendors[i] + prop[0].toUpperCase() + prop.slice(1);

	      			// add prop if vendor prop exists
  					if (style[prop] !== __undefined) {
  						style[prop] = value;
  					}
	      		}
    		}
    		// set un-prefixed prop
    		else {
    			style[prop] = value;
    		}
		}

		return {
			flip: flip,
			transition: transition
		};
	}


	/**
	 * classList helper
	 * @param  {Element} element
	 * @param  {String}  value
	 * @return {Object} {add, remove, toggle, hasClass}
	 */
	function classList (type, element, className) {
		/**
		 * check if the element has the class/className
		 * @param  {Element}  element   - target element
		 * @param  {String}   className - className to check for
		 * @return {Boolean}
		 */
		function hasClass (element, className) {
			// default to native Element.classList()
		    if (element[__classList]) {
		        return element[__classList].contains(className);
		    } 
		    else {
		    	// this will return true if indexOf does not
		    	// find our class in the className string 
		        return element[__className].indexOf(className) > -1;
		    }
		}

		/**
		 * add a className to an element
		 * @param  {Element}  element   - target element
		 * @param  {String}   className - className to add
		 */
		function add (element, className) {
			// default to native Element.classList.remove()
			if (element[__classList]) {
		        element[__classList].add(className);
		    }
		    // exit early if the class is already added
		    else if (!hasClass(element, className)) {
		    	// create array of current classList
		        var 
		        classes = element[__className].split(" ");
		        // add our new class
		        classes.push(className);
		        // join our classes array and re-assign to className
		        element[__className] = classes.join(" ")
		    }
		}

		/**
		 * remove a className from an element
		 * @param  {Element}  element   - target element
		 * @param  {String}   className - className to remove
		 */
		function remove (element, className) {
			// default to native Element.classList.remove()
		    if (element[__classList]) {
		        element[__classList].remove(className);
		    }
		    else {
		    	// create array of current classList
		        var
		        classes = element[__className].split(" ");
		        // remove the className on this index
		        classes.splice(classes.indexOf(className), 1);
		        // join our classes array and re-ssign to className
		        element[__className] = classes.join(" ");
		    }
		}

		/**
		 * toggle a className on an element
		 * @param  {Element}  element   - target element
		 * @param  {String}   className - classname to toggle
		 */
		function toggle (element, className) {
			// default to native Element.classList.toggle()
		    if (element[__classList]) {
		        element[__classList].toggle(className);
		    }
		    else {
		    	// if has class, remove
		    	if (hasClass(element, className)) {
		    		remove(element, className);
		    	}
		    	// if does not have class, add
		    	else {
		    		add(element, className);
		    	}
		    }
		}

		var 
		methods = {
			add: add,
			remove: remove,
			hasClass: hasClass,
			toggle: toggle
		};

		return methods[type](element, className);
	}


	/**
	 * request interface
	 */
	function request () {
		/**
		 * return the response in it's right type
		 * i.e json as {}, text/html as a document...
		 * @param  {{Object}} xhr
		 * @return {Any} 
		 */
		function getResponse (xhr) {			
			var 
			response,
			responseType,
			responseText   = xhr.responseText,
			responseHeader = xhr.getResponseHeader("content-type");

			// format response header
			// get the type of response
			// so we can use that to format the response body
			// if needed i.e create a dom/parse json
			if (responseHeader.indexOf(';') !== -1) {
				responseType = responseHeader.split(';');
				responseType = responseType[0].split('/');
			}
			else {
				responseType = responseHeader.split('/');
			}

			// extract response type 'html/json/text'
			responseType = responseType[1];

			// json, parse json
			if (responseType === 'json') {
				response = JSON.parse(responseText);
			}
			// html, create dom
			else if (responseType === 'html') {
				response = (new DOMParser()).parseFromString(responseText, "text/html");
			}
			// text, as is
			else {
				response = responseText;
			}

			return response;
		}

		/**
		 * http interface
		 * @param {String}
		 * @param {String}
		 * @param {Object}
		 * @param {Function}
		 */
		function http (url, method, payload, enctype, withCredentials) {
			// return a a stream
			return createStream(function (resolve, reject) {
				// create xhr object 
				var
				xhr      = new __XMLHttpRequest(),
				// get window location to check fo CORS
				location = __window.location,
				// create anchor element and extract url information
				a        = __document.createElement('a');		

				a.href   = url;

				// check if is this a cross origin request
				var
				CORS = !(
					a.hostname        === location.hostname &&
					a.port            === location.port     &&
					a.protocol        === location.protocol &&
					location.protocol !== 'file:'
				);

				// destroy created element
				a = __undefined;
				
				// open request
				xhr.open(method, url);
				
				// on success update the xhrStream
				xhr.onload = function () {
					resolve(getResponse(this));
				};

				xhr.onerror = function () {
					reject(this.statusText);
				};
				
				// cross origin request cookies
				if (CORS && withCredentials) {
					xhr.withCredentials = __true;
				}

				// set content type and payload
				if (method === 'POST' || method === 'PUT') {
					xhr.setRequestHeader('Content-type', enctype);

					if (enctype.indexOf('x-www-form-urlencoded') > -1) {
						payload = param(payload);
					}
					else if (enctype.indexOf('json') > -1) {
						payload = JSON.stringify(payload);
					}
				}

				// send request
				xhr.send(payload);
			});
		}

		/**
		 * serialize + encode object
		 * @param  {Object}  obj   
		 * @param  {Object}  prefix
		 * @return {String}  serialized object
		 * @example
		 * // returns 'url=http%3A%2F%2F.com'
		 * param({url:'http://.com'})
		 */
		function param (obj, prefix) {
			var 
			arr = [];

			// loop through object and create a serialized representation
			for (var key in obj) {
			    var 
			    __prefix = prefix ? prefix + '[' + key + ']' : key,
			    value    = obj[key];

			    // when the value is equal to an object 
			    // that means we have data = {name:'John', addr: {...}}
			    // so we re-run param on addr to serialize 'addr: {...}' as well
			    arr.push(typeof value == 'object' ? 
			    	param(value, __prefix) :
			    	__encodeURIComponent(__prefix) + '=' + __encodeURIComponent(value));
			}

			return arr.join('&');
		}


		/**
		 * request interface
		 * @param {String}
		 * @param {Object}
		 * @param {Function}
		 */
		function request (method) {
			return function (url, payload, enctype, withCredentials) {
				// enctype syntax sugar
				if (enctype) {
					if (enctype === 'json') {
						enctype = 'application/json';
					}
					else if (enctype === 'text') {
						enctype = 'text/plain';
					}
					else if (enctype === 'file') {
						enctype = 'multipart/form-data';
					}
				}
				else {
					// defaults
					enctype     = 'application/x-www-form-urlencoded';
				}

				// return ajax promise
				return http(url, method.toUpperCase(), payload, enctype, withCredentials);
			}
		}

		return {
			get:    request('GET'),
			post:   request('POST'),
			put:    request('PUT'),
			delete: request('DELETE')
		};
	}


	/**
	 * server-side interface converts a hyperscript/component/render to html string
	 * @param {Object} hyperscript - hyperscript object/render/component
	 * @param {Object} props - props to pass to component/render
	 * @param {Object} children - children to pass to component/render
	 * @return {String} html string ouput
	 *
	 * @example
	 * createHTML(h('div', 'Hello World'));
	 * createHTML(component/render, {id:1234}, {item:'first'});
	 */
	function createHTML (arg, props, children) {
		// print node
		function toHTML (vnode, level) {
			// not a hyperscript object
			if (is(vnode, __string)) {
				return vnode;
			}

			// references
			var 
			// i.e 'div'
			type = vnode.type,
			// i.e {id: 123, class: 'one two'}
			props = vnode.props,
			// i.e [obj, obj]
			children = vnode[__children];

			// print voidElements
			if (element[type]) {
				// <type ...props>
				return '<'+type+Props(props)+'>';
			}

			// otherwise...
			// <type ...props>...children</type>
			return '<'+type+Props(props)+'>' + Children(children, level) + '</'+type+'>';
		}

		// print props
		function Props (props) {
			props = __object.keys(props)
							// remove any falsey value
							.filter(function (name) {
								return  props[name] !== __undefined &&
										props[name] !== __null &&
										props[name] !== __false
							})
							// 
							.map(function (name) {
								// <type name="value">
								var 
								value = props[name];

								// don't add events, keys or refs
								if (!is(value, __function) && name !== 'key' && name !== 'ref') {
									// if the value is a falsey/truefy value
									// print just the name
									// i.e checkbox=true
									// will print <type checkbox>
									// otherwise <type value="">
									return value === __true ? name : name+'="'+value+'"';
								}
							})
							// create string, remove trailing space
							// <type ...props > => <type ...props>
							.join(' ').replace(/\s+$/g, '');

			// if props is falsey just return an empty string
			// otherwise return ' ' + ...props
			// this prevents us from having a case of
			// <divclass=a></div>, 
			// so we add a space before props giving us
			// <div class=a></div>
			return props ? (' ' + props) : '';
		}

		// print children
		function Children (children, level) {
			// empty
			if (children[__length] === 0) {
				return '';
			}

			// indent level
			level      = level || 0;

			// print tabs
			var 
			indent     = '\t'.repeat(level + 1),
			lastIndent = '\t'.repeat(level);

			// iterate through and print each child
			return '\n'+indent+children.map(function (child) {
				return toHTML(child, level + 1);
			}).join('\n'+indent)+'\n'+lastIndent;
		}

		// void elements that do not have a close </tag> 
		var
		element = {
			'area': __true,'base':  __true,'br':    __true,'!doctype': __true,
			'col':  __true,'embed': __true,'wbr':   __true,'track':    __true,
			'hr':   __true,'img':   __true,'input': __true,'keygen':   __true,
			'link': __true,'meta':  __true,'param': __true,'source':   __true
		};

		var
		vnode;

		// either a render function or component function
		if (is(arg, __function)) {
			// component functions expose their internals
			// when we pass a third param, on the other hand
			// render functions expose their hyperscript output
			// when we pass a third param
			vnode = arg(
				props, 
				children, 
				(arg.id === __componentSignature) ? __undefined : __componentSignature
			)
		}
		// probably hyperscript
		else {
			vnode = arg;
		}

		return toHTML(vnode);
	}


	/**
	 * store interface
	 * @param  {[type]} reducer [description]
	 * @param {Number} range - timetravel/undo range
 	 * @return {Object} {connect, dispatch, getState, subscribe, timetravel}
	 */
	function createStore (reducer) {
		// if the reducer is an object of reducers (multiple)
		// lets combine the reducers
		if (is(reducer, __object)) {
			return create(combine(reducer));
		}
		// single reducer
		else {
			return create(reducer);
		}

		// combine reducers
		function combine (reducers) {
			return function (state, action) {
				state = state || {};

				return __object.keys(reducers).reduce(function (nextState, key) {
					nextState[key] = reducers[key](state[key], action);

					return nextState;
				}, {});
			}
		}

		// create store
		function create (reducer) {
			var
			state,
			listeners = [];

			// return the state
			function getState () {
				return state;
			}

			// dispatch an action
			function dispatch (action, timetravel) {
				// there are no actions when we are time traveling
				if (!is(action, __object)) {
					throw 'action must be a plain object';
				}
				if (action.type === __undefined) {
					throw 'actions must have a type';
				}

				// get state from reducer
				state = reducer(state, action);

				// dispatch to all listeners
				each(listeners, function (listener) {
					return listener(state);
				})
			}

			// subscribe to a store
			function subscribe (listener) {
				if (!is(listener, __function)) {
			  		throw 'listener should be a function';
				}

				listeners.push(listener);

				// return a unsubscribe function that we can 
				// use to unsubscribe as follows: i.e
				// var sub = store.subscribe()
				// sub() // un-subscribes
				return function unsubscribe () {
					listener = listeners.filter(function (l) {
						return l !== listener;
					});
				}
			}

			// auto subscribe a component to a store
			function connect (render, element) {
				// create a render instance if not one
				if (element) {
					render = createRender(render, element);
				}

				// trigger initial render
				render(getState());

				// trigger subsequent renders on state updates
				subscribe(function () {
					render(getState());
				});
			}

			// dispath initial action
			dispatch({type: __storeSignature});

			return {
				getState: getState, 
				dispatch: dispatch, 
				subscribe: subscribe,
				connect: connect
			};
		}
	}


	/**
	 * router interface
	 * @param {Object} routes
	 * @param {String} rootAddress 
	 * @param {String} onInitNavigateTo
	 * @example
	 * router({
	 * 		'/:page/:name': () => {}
	 * }, '/example', '/user/id')
	 */
	function createRouter () {
		function router (routes, rootAddress, onInitNavigateTo) {
			/**
			 * listens for changes to the url
			 */
			function startListening () {
				// clear the interval if it's already set
				clearInterval(interval);

				// start listening for a change in the url
				interval = setInterval(function () {
					var 
					path = __window.location.pathname;

					// if our store of the current url does not 
					// equal the url of the browser, something has changed
					if (currentPath !== path) {
						// update the currentPath
						currentPath = path;
						// trigger a routeChange
						triggerRouteChange();
					}
				}, 50);
			}

			/**
			 * register routes
			 */
			function registerRoutes () {
				// assign routes
				each(routes, function (value, name) {
					// vars = where we store the variables
					// i.e in /:user/:id - user, id are variables
					var 
					vars = [],
					regex = /([:*])(\w+)|([\*])/g,

					// given the following /:user/:id/*
					pattern = name.replace(regex, function () {
								var 
								// 'user', 'id', undefned
								args = arguments,
								id   = args[2];

								// if not a variable 
								if (!id) {
									return '(?:.*)';
								}
								// capture
								else {
									vars.push(id)
									return '([^\/]+)';
								}
							}),

					pattern      = pattern + '$';
					routes[name] = [value, rootAddress ? rootAddress + pattern : pattern, vars]
				});
			}

			/**
			 * called when the listener detects a route change
			 */
			function triggerRouteChange () {
				each(routes, function (val) {
					var 
					callback = val[0],
					pattern  = val[1],
					vars     = val[2],
					match;

					// exec pattern on url
					match    = currentPath.match(new __RegExp(pattern));

					// we have a match
					if (match) {
						// create params object to pass to callback
						// i.e {user: "simple", id: "1234"}
						var 
						data = match
							// remove the first(url) value in the array
							.slice(1, match[__length])
							.reduce(function (data, val, i) {
								if (!data) {
									data = {};
								}
								// var name: value
								// i.e user: 'simple'
								data[vars[i]] = val;

								return data;
							}, __null);

						// callback is a function, exec
						if (is(callback, __function)) {
							callback(data);
						}
					}
				})
			}

			/**
			 * navigate to path
			 */
			function navigateToPath (path) {
				if (rootAddress) {
					path = rootAddress + path;
				}

				history.pushState(__undefined, __undefined, path);
			}

			var
			currentPath,
			interval;

			// normalize rootAddress formate
			// i.e '/url/' -> '/url'
			if (rootAddress.substr(-1) === '/') {
				rootAddress = rootAddress.substr(0, rootAddress[__length] - 1);
			}

			registerRoutes();
			startListening();

			if (onInitNavigateTo) {
				navigateToPath(onInitNavigateTo);
			}

			return {
				// navigate to a view
				nav: navigateToPath,
				// history back
				back: history.back,
				// history foward
				foward: history.foward,
				// history go
				go: history.go
			};
		}

		return router.apply(__undefined, toArray(arguments));
	}


	/**
	 * creates a render interface
	 * @return {Function}
	 * @example
	 * render = dio.createRender(Component, '.selector')
	 * render()
	 */
	function createRender () {
		// update
		function update (props, children) {
			// get a fresh copy of the vdom
			newNode = component(props, children);

			vdomToDOM(element, newNode, oldNode);
			// this newNode = the next renders oldNode
			oldNode = newNode;
		}

		// initial mount
		function mount (props, children) {
			// don't try to set it's internals if it's statless
			if (!stateless && internal) {
				// reference render, we can then call this
				// in this.setState
				if (!internal['render()']) {
					internal['render()'] = update;	
				}
			}

			// get a fresh copy of the vdom
			newNode = component(props, children);

			// clear dom
			element.innerHTML = '';

			if (newNode) {
				vdomToDOM(element, newNode, __undefined, internal);
				// this newNode = the next renders oldNode
				oldNode = newNode;
				initial = __false;
			}
		}

		// return function that runs update/mount when executed
		function render (props, children, forceUpdate) {
			// don't render to dom, if vdom is requested
			if (forceUpdate === __componentSignature) {
				return component(props, children);
			}
			
			// initial render
			if (initial || forceUpdate) {
				// mount and publish that the initial render has taken place
				mount(props, children);
			}
			// updates
			else {
				update(props, children);
			}

			return render;
		}

		// removes the component from the container
		// or also removes the container as-well
		render.remove = function (all) {
			all ? element.parentNode.removeChild(element) : element.innerHTML = ''
		};

		var
		component,
		newNode,
		oldNode,
		element,
		internal,
		stateless,
		initial = __true,
		args = toArray(arguments);

		// assign args
		each(args, function (value) {
			// a component
			if (is(value, __function) && value.id === __componentSignature) {
				component = value;
			}
			// a pure function / object
			else if (is(value, __function) || is(value, __object)) {
				component = createComponent(value);
			}
			// element
			else if (value && value.nodeType) {
				element = value === __document ? __document.body : value;
			}
			// element selector
			else if (is(value, __string)) {
				element = __document.querySelector(value);
			}
		});

		// default to body
		if (!element) {
			element = __document.body;
		}

		// a component exists
		if (component) {
			// determine if the component is stateless
			if (component.stateless) {
				stateless = __true;
			}

			// don't try to get it's internals if it's stateless
			if (!stateless) {
				internal = component(__undefined, __undefined, __true);
			}

			return render;
		}
		// can't find a component
		else {
			throw 'can\'t find the component';
		}
	}


	/**
	 * creates a component
	 * @param  {Function|Object} arg - component
	 * @return {Function}
	 */
	function createComponent (arg) {
		var 
		obj,
		displayName;

		// maybe the arg is a function that returns an object
		if (is(arg, __function)) {
			obj = arg();

			if (!obj) {
				throw 'no render'
			}
			// a stateless component
			// we assume it returns a hyperscript object
			// rather than a render method
			else if (!obj.render) {
				arg.stateless = __true
				return arg;
			}

			// get displayName from function
			// i.e a function Foo () { ... } // => Foo
 			displayName = /function ([^(]*)/.exec(arg.valueOf())[1];
		}
		// we have an object
		else if (is(arg, __object)) {
			// does the object have a render method
			// if not create one that returns 'arg' which we 
			// assume is a hyperscript object thus a stateless component
			if (arg.render) {
				obj = arg;
			}
			// stateless
			else {
				function __arg () { 
					return arg;
				}
				__arg.stateless = __true;

				return __arg;
			}
		}
		else {
			throw 'invalid component';
		}


		// everything checks out i.e
		// - obj has a render method
		// - or arg() returns an object that has a render method
		// stateless components never reach here
		// 
		// create new component object 
		var
		component = new componentClass(displayName);

		// add the properties to the component instance
		// also bind functions to the component scope
		each(obj, function (value, name) {
			// methods
			if (is(value, __function)) {
				// pass props and state to render
				if (name !== 'render') {
					component[name] = value.bind(component);
				}
			}
			// objects
			else {
				component[name] = value;
			}
		});

		// set initial state
		if (component[__getInitialState]) {
			component.state = component[__getInitialState]();
		}
		// set default props
		if (component[__getDefaultProps]) {
			component.props = component[__getDefaultProps]();
		}

		var 
		h = getHyperscriptClass([
			[__componentSignature, component], 
			[__shouldComponentUpdate, __true]
		]);

		// get the render method
		var
		render = obj.render.bind(component, component.props, component.state, component);;

		// insure the render function returns the newly
		// created hyperscript object
		component.render = function () {
			return new h(render());
		}

		// hyperscript cache
		var
		cache;

		// we will return a function that when called
		// returns the components vdom representation
		// i.e User(props) -> {type: 'div', props: {..props}, children: ...}
		// this is that function
		function Component (props, children, internal) {
			if (internal) {
				return component;
			}

			// add children to props if set
			if (children) {
				props = props || {};
				props[__children] = children;
			}

			// make sure this is not the first render
			// if it is there will be no cached copy
			if (cache) {
				// shouldComponentUpdate?
				// if false, add signal, and return cached copy
				if (
					component[__shouldComponentUpdate] === __false ||
					lifecycle(component, __shouldComponentUpdate, __true, props) === __false
				) {
					cache[__hyperscriptSignature][__shouldComponentUpdate] = __false;
					return cache;
				}
				else {
					cache[__hyperscriptSignature][__shouldComponentUpdate] = __true;
				}
			}

			// publish componentWillReceiveProps lifecycle
			if (props) {
				lifecycle(component, __componentWillReceiveProps, __true, props);
				// set props
				setProps(component, props);
			}

			cache = component.render();
			return cache;
		}
		Component.id = __componentSignature;

		return Component;
	}

	/**
	 * hyperscript class
	 * @param  {Array} args arugments to add to the prototype object
	 * @return {Function}
	 */
	function getHyperscriptClass (args) {
		// interface
		function h (obj) {
			if (!obj) {
				throw 'not a hyperscript';
			}

			var 
			self = this;

			self.type        = obj.type,
			self.props       = obj.props,
			self[__children] = obj[__children];
		}

		// data placeholder for storing internal data
		h[__prototype][__hyperscriptSignature] = {};

		if (args) {
			each(args, function (value, index) {
				h[__prototype][__hyperscriptSignature][value[0]] = value[1];
			});
		}

		// we want the constructor of the resulting created object
		// from new hyperscript()... to be the Object interface
		// and not our h () interface above
		h[__prototype][__constructor] = __object;

		return h;
	}


	/**
	 * component interface
	 */
	function componentClass (displayName) {
		// immutable internal props & state
		this.props = {},
		this.state = {};

		// add displayName if available
		// this will make for better debugging
		if (displayName) {
			this.displayName = displayName;
		}
	}

	/**
	 * component interface methods
	 */
	componentClass[__prototype] = {
		// i.e this.setState({})
		setState: function (data, self) {
			// this allows us to run setState
			// from outside the components namespace
			// i.e this.setState({}, context)
			self = self || this;

			// set state
			// if the state is changed
			// setState will return true
			// thus force and update when
			// that happens
			if (setState(self, data)) {
				// update render
				self.forceUpdate();
			}
		},
		// i.e this.setProps({})
		setProps: function (data, self) {
			// same thing
			self = self || this;

			// set props does not trigger an redraw/update
			setProps(self, data);
		},
		// force update public method
		forceUpdate: function (self) {
			self = self || this;

			// update only if this component is a render instance
			if (self['render()']) {
				self['render()']();
			}
		},
		withAttr: function (props, setters, callback, self) {
			self = self || this;

			if (!is(callback, __function)) {
				callback = function () {
					self.forceUpdate.call(self);
				}
			}

			return withAttr(props, setters, callback.bind(self))
		}
	}


	/**
	 * set/update a components props
	 * @param {Object} self components object
	 * @param {Object} data data with which to update the components props
	 */
	function setProps (self, data) {
		// assign props to {} if it's undefined
		self.props = self.props || {};

		// if the object is a function that returns an object
		if (is(data, __function)) {
			data = data();
		}

		if (data) {
			// set props
			each(data, function (value, name) {
				self.props[name] = value;
			});
		}
	}


	/**
	 * set/update a components state
	 * @param {Object} self components object
	 * @param {Object} data data with which to update the components state
	 */
	function setState (self, data) {
		// assign state to {} if it's undefined
		self.state = self.state || {};

		// if the object is a function that returns an object
		if (is(data, __function)) {
			data = data();
		}

		// make sure we have something to update
		if (data) {
			// set state
			each(data, function (value, name) {
				self.state[name] = value;
			});

			return __true;
		}
	}


	/**
	 * two-way data binding, not to be confused with Function.bind
	 * @param  {String|String[]} props      - the property/attr to look for in the element
	 * @param  {Function|Function[]} setter - the object to update/setter to execute
	 * 
	 * @example
	 * 
	 * direction of binding element ----> setter
	 * this.withAttr(['prop1-from-el', 'prop2-from-el'], to-prop1-setter, to-prop2-setter)
	 * direction of binding element <---- setter
	 * this.withAttr([to-prop1-setter, to-prop2-setter], ['prop1-from-el', 'prop2-from-el'])
	 *
	 * setters are always an array of: functions
	 * and element props: strings
	 */
	function withAttr (props, setters, callback) {
		function update (el, prop, setter) {
			var
			value;

			// prop is a string, get value from element
			if (is(prop, __string)) {
				// get key from element
				// either the prop is a property of the element object
				// or an attribute
				value = (prop in el) ? el[prop] : el.getAttribute(prop);

				// just an <if(value)> doesn't work since the value can be false
				// null or undefined = prop/attr doesn't exist
				if (value !== __undefined && value !== __null) {
					// run the setter
					setter(value);
				}
			}
			// setter is a string, get value from stream
			else {
				value = prop()
				
				if (value !== __undefined && value !== __null) {
					(setter in el) ? el[setter] = value : el.setAttribute(setter, value);
				}
			}
		}

		// the idea is that when you attach a function to an event,
		// i.e el.addEventListener('eventName', fn)
		// when that event is dispatched the function will execute
		// making the this context of this function the element 
		// that the event was attached to
		// we can then extract the value, and run the prop setter(value)
		// to change it's value
		return function () {
			// assign element
			var 
			el  = this;

			// array of bindings
			if (is(props, __array)) {
				each(props, function(value, index) {
					update(el, value, setters[index]);
				});
			}
			// singles
			else {
				update(el, props, setters);
			}

			// execute callback if specified
			if (callback) {
				callback()
			}
		}
	}


	/**
	 * streams utility getter/setter
	 * @param {Any} store value
	 * @param {Function} processor
	 * @return {Function} a stream
	 */
	function createStream (value, mapper) {
		var
		store,
		chain = {
			then: __null,
			catch: __null
		},
		listeners = {
			catch: [],
			then: []
		};

		function stream () {
			return update(arguments);
		}

		function update (args) {
			// update the stream when a value is passed
			if (args[__length]) {
				store = args[0];
				dispatch('then', store);

				return stream;
			}

			// the value we will return
			var
			ret;

			// special store
			if (mapper === __true) {
				ret = store()
			}
			else {
				// we have a mapper, run the store through it
				if (is(mapper, __function)) {
					ret = mapper(store)
				}
				// return the store as is
				else {
					ret = store;
				}
			}

			// return the store
			return ret;      
		}

		function dispatch (type, value) {
			if (listeners[type][__length]) {
				each(listeners[type], function (listener) {
					try {
						// a link in the .then / .catch chain
						var
						link = listener(chain[type] || value);

						// listerner returned a value, add to chain
						// the next .then / .catch listerner
						// will receieve this
						if (link) {
							chain[type] = link;
						}
					} catch (e) {
						stream.reject(e);
					}
				});
			}
		}

		// ...JSON.strinfigy()
		stream.toJSON = function () {
			return store;
		};

		// resolve a value
		stream.resolve = function (value) {
			return stream(value);
		};

		// reject with a reason
		stream.reject = function (reason) {
			dispatch('catch', reason);
		};

		// push a listener
		stream.push = function (to, listener, end) {
			listeners[to].push(function (chain) {
				return listener(chain);
			});

			return !end ? stream : __undefined;
		};

		// add a then listener
		stream.then  = function (listener, error) {
			if (error) {
				stream.catch(error)
			}

			if (listener) {
				return stream.push('then', listener, error);
			}
		};

		// add a done listener, ends the chain
		stream.done = function (listener, error) {
			stream.then(listener, error || __true);
		};

		// add a catch listener
		stream.catch = function (listener) {
			return stream.push('catch', listener);
		};

		// create a map
		stream.map = function (map) {
			var 
			dep  = stream;

			return createStream(function (resolve) {
				resolve(function () {
					return map(dep());
				});
			}, __true);
		};

		// end/reset a stream
		stream.end = function () {
			chain.then      = __null;
			chain.catch     = __null;
			listeners.catch = [];
			listeners.then  = [];
		};

		// a way to distinguish between normal functions
		// and streams
		stream.id = __streamSignature;

		if (is(value, __function)) {
			value(stream.resolve, stream.reject);
		}
		else {
			stream(value);
		}

		return stream;
	}

	/**
	 * combine two or more streams
	 * @param  {Function} reducer
	 * @return {Array} dependecies
	 */
	createStream.combine = function (reducer, deps) {
		// if deps are not in a single array
		// create deps from arguments
		if (!is(deps, __array)) {
			deps = toArray(arguments, 1);
		}

		// creating a stream with the second argument as true
		// allows us to pass a function a the streams store
		// that will be run anytime we retreive it
		return createStream(function (resolve) {
			resolve(function () {
				return reducer.apply(__null, deps);
			});
		}, __true);
	};

	/**
	 * do something after all dependecies have resolve
	 * @param  {Array} dependecies
	 * @return {Function} a stream
	 */
	createStream.all = function (deps) {
		var
		resolved = [];

		// pushes a value to the resolved array
		// and compares if resolved length is equal to deps
		// this will tell us wheather all dependencies
		// have resolved
		function resolver (value, resolve) {
			resolved.push(value);

			if (resolved[__length] === deps[__length]) {
				resolve(resolved)
			}
		}

		return createStream(function (resolve, reject) {
			// check all dependencies
			// if a dependecy is a stream attach a listerner
			// reject / resolve as nessessary.
			each(deps, function (value, index, arr) {
				if (value.id === __streamSignature) {
					value.done(function (value) {
						resolver(value, resolve);
					}, function (reason) {
						reject(reason);
					});
				}
				else {
					resolver(value, resolve);
				}
			});
		});
	};

	/**
	 * creates a new stream that accumulates everytime it is called
	 * @param  {Function} reducer
	 * @param  {Any}      accumulator 
	 * @param  {Function} stream     
	 * @return {Function} stream  
	 *
	 * @example
	 * 
	 * var foo = {Stream}
	 * var bar = stream.scan((sum, n) => { sum+n }, 0, foo) 
	 * foo(1)(1)(2)
	 * // bar => 4
	 */
	createStream.scan = function (reducer, accumulator, stream) {
		return createStream(function (resolve) {
			// attach a listener to stream and update
			// the accumulator with the returned value of the reducer
			// proceed to resolve the store of the stream we return back
			stream.then(function () {
				accumulator = reducer(accumulator, stream);
				resolve(accumulator);
			});
		});
	}


	/**
	 * curry / create / return a function with set arguments
	 * @param  {Function} fn    function to curry
	 * @param  {Any}      arg   arguments to pass to function
	 * @param  {Boolean}  event auto preventDefault for events
	 * @return {Function}       curried function
	 */
	function createFunction (fn, args, preventDefault, argsNames) {
		var
		argsArray = [];

		// convert args to array if it's not one
		if (!is(args, __array)) {
			argsArray = [args];
		}
		// args is already an array, use as is
		else {
			argsArray = args;
		}

		// function is a create, create
		if (is(fn, __string)) {
			fn = new __function(argsNames, fn);
		}

		// return a function that executes
		// our passed function with the arguments passed
		return function (e) {
			// auto prevent default behaviour for events when
			// preventDefault parameter is set
			if (e && e.preventDefault && preventDefault) {
				e.preventDefault();
			}

			// default to current arguments
			// if args is a 0 length array of falsy value
			if (!argsArray[__length] || !args) {
				argsArray = toArray(arguments);
			}

			return fn.apply(this, argsArray);
		}
	}

	/**
	 * create a hyperscript style object
	 * with shouldComponentUpdate always = false
	 * @return {Object} a hyperscript object 
	 */
	function createStyle () {
		var
		vendors     = ['webkit', 'moz', 'ms'],
		prefixCache = ['transform', 'appearance', 'animation'];

		function prefixProperty (property) {
			var
			result;

			each(prefixCache, function (prefix) {
				if (property.indexOf(prefix+':') > -1) {
					result = '';

					each(vendors, function (vendor, index, arr) {
						result += '-' + vendor + '-' + property + '\t';
					});

					result += property;
				}
			});

			return result || property;
		}

		// given a selector block this returns a style block
		// property: value as in  margin: 20px
		function createSelectorBlock (selector, declaration, result) {
			result = result || {};

			each(declaration, function (value, property) {
				// extract value from function values
				value = is(value, __function) ? value () : value;

				// nested style
				if (is(value, __object)) {
					
					// this insures that
					// h1:hover {} is joint and
					// h1 div {} is separated by a space
					var
					seperator = ' ';

					// & will remove the space between h div {}
					// to be h1div{}, which works well if the div
					// is a :hover
					if (property.substr(0,1) === '&') {
						property  = property.substr(1);
						seperator = '';
					}

					// run through createSelectorBlock again
					// we keep doing this so long as the selector is nested within
					// another selector, this converts something like
					// h1 { h2: {} } --> h1 {} h1 h2 {}
					createSelectorBlock(selector+seperator+property, value, result);
				}
				// perfect
				else {
					var 
					propVal = '\t'+prefixProperty(property + ': ' + value + ';\n');

					if (result[selector]) {
						result[selector] += propVal;
					} 
					else {
						result[selector] = propVal;
					}
				}
			});

			return result;
		}

		// returns an array of textNodes like
		// ['selector{property:value;}'...]
		function createSelectorArray (stylsheet) {
			var 
			result = [];

		    each(stylsheet, function (declaration, index, arr) {
		    		var 
		    		selector = createSelectorBlock(index, declaration);

		    		each(selector, function (__, name) {
		    			var 
		    			child = {};

		    			child[name] = selector[name];
		    			result.push(name + ' {\n' + selector[name] + '}\n');
		    		});
		    });

		    return result;
		}

		// adds the prefix namespace to children
		function addNamespaces (children, namespaces) {
			// no prefixes default
			if (!namespaces) {
				namespaces = [''];
			}
			else if (is(namespaces, __string)) {
				namespaces = [namespaces];
			}

			// add prefixes to all declarations
			each(children, function (value, index, arr) {
				var 
				child = [];

				if (value.substr(0,1) === '@') {
					each(vendors, function (prefix) {
						arr[index] += value.substr(0,1) + '-'+prefix+'-' + value.substr(1);
					});
				}
				else {
					each(namespaces, function (namespace) {
						child.push(namespace + ' ' + value);
					});

					arr[index] = child.join();
				}
			});

			return children;
		}

		function createStyleArray (stylsheet, children) {
			// this allows us to accept 
			// strings, arrays or objects
			// as stylesheets
			if (is(stylsheet, __object)) {
				children = createSelectorArray(stylsheet);
			}
			else if (is(stylsheet, __array)) {
				children = stylsheet;
			}
			else if (is(stylsheet, __string)) {
				// remove whitespace
				stylsheet = stylsheet.replace(/ /g, '');

				// add a delimiter to where we 
				// would like the split to take place
				// since we don't want to mutate 
				// the string by using a delimiter
				// already within the string.
				stylsheet = stylsheet.replace(/}/g,'}'+__signatureBase);

				// create an array of the stylesheet string
				// split by the delimiter we added, 
				// removing the delimiter in the process.
				// also remove the last item in the array, it is an empty value
				children  = toArray(stylsheet.split(__signatureBase), 0, -1);
			}

			return children;
		}

		return function (stylesheet, namespaces) {
			var
			children = addNamespaces(createStyleArray(stylesheet), namespaces),
			element = '<style>' + children.join('\n') + '</style>';
			
			__document.head.insertAdjacentHTML('beforeend', element);
		}
	}


	/* --------------------------------------------------------------
	 * 
	 * Exports
	 * 
	 * -------------------------------------------------------------- */


	exports.h = element(),
	exports.dio = {
		animate: animate(),
		request: request(),

		createComponent: createComponent,
		createFunction: createFunction,
		createStream: createStream,
		createRender: createRender,
		createRouter: createRouter,
		createStore: createStore,
		createHTML: createHTML,
		createStyle: createStyle()
	};
}));