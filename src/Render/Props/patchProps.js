/**
 * patch props
 * 
 * @param  {VNode} newNode
 * @param  {VNode} oldNode
 */
function patchProps (newNode, oldNode) {
	var diff   = diffProps(newNode, oldNode, newNode.props.xmlns || '', []);
	var length = diff.length;

	// if diff length > 0 apply diff
	if (length !== 0) {
		var target = oldNode._node;

		for (var i = 0; i < length; i++) {
			var prop = diff[i];
			// [0: action, 1: name, 2: value, namespace]
			updateProp(target, prop[0], prop[1], prop[2], prop[3]);
		}

		oldNode.props = newNode.props;
	}
}

