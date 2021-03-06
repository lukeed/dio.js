/**
 * combines a set of reducers
 * 
 * @param  {Object<string, function>}  reducers
 * @return {function}
 */
function combineReducers (reducers) {
	var keys   = Object.keys(reducers);
	var length = keys.length;

	// create and return a single reducer
	return function (state, action) {
		state = state || {};

		var nextState = {};

		for (var i = 0; i < length; i++) {
			var key = keys[i]; 

			nextState[key] = reducers[key](state[key], action);
		}

		return nextState;
	}
}