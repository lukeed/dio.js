/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a fast javascript framework
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} else {
		window.dio = factory(window);
	}
}(function (window) {


	'use strict';


	import '../../../src/Constants/core';
	import '../../../src/Utilities/random';
	import '../../../src/Utilities/each';
	import '../../../src/Stylesheet/';
	import '../../../src/Element/';
	import '../../../src/Component/';
	import '../../../src/Render/';


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * exports
	 * 
	 * ---------------------------------------------------------------------------------
	 */


	if (browser) {
		window.h = createElement;
	}

	return {
		// elements
		createElement:    createElement,
		isValidElement:   isValidElement,
		cloneElement:     cloneElement,
		createFactory:    createFactory,

		VText:            VText,
		VElement:         VElement,
		VSvg:             VSvg,
		VFragment:        VFragment,
		VComponent:       VComponent,

		DOM:              DOM,

		// render
		render:           render,

		// components
		Component:        Component,
		createClass:      createClass,
		
		// version
		version:          version,

		// alias
		h:                createElement,
	};
}));