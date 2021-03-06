/**
 * css compiler
 *
 * @example compiler('.class1', 'css...', false);
 * 
 * @param  {string}  selector
 * @param  {string}  styles
 * @param  {boolean} nsAnimations
 * @param  {boolean} nsKeyframes
 * @return {string}
 */
function stylis (selector, styles, nsAnimations, nsKeyframes) {
    var prefix = '';
    var id     = '';
    var type   = selector.charCodeAt(0) || 0;

    // [
    if (type === 91) {
        // `[data-id=namespace]` -> ['data-id', 'namespace']
        var attr = selector.substring(1, selector.length-1).split('=');            
        var char = (id = attr[1]).charCodeAt(0);

        // [data-id="namespace"]/[data-id='namespace']
        // --> "namespace"/'namspace' -> namespace
        if (char === 34 || char === 39) {
            id = id.substring(1, id.length-1);
        }

        // re-build and extract namespace/id
        prefix = '['+ attr[0] + '=\'' + id +'\']';
    }
    // `#` or `.` or `>`
    else if (type === 35 || type === 46 || type === 62) {
        id = (prefix = selector).substring(1);
    }
    // element selector
    else {
        id = prefix = selector;
    }

    var keyframeNs  = (nsAnimations === void 0 || nsAnimations === true ) ? id : '';
    var animationNs = (nsKeyframes === void 0 || nsKeyframes === true ) ? id : '';

    var output  = '';
    var line    = '';
    var blob    = '';

    var len     = styles.length;

    var i       = 0;
    var special = 0;
    var type    = 0;
    var close   = 0;
    var flat    = 1; 
    var comment = 0;

    // parse + compile
    while (i < len) {
        var code = styles.charCodeAt(i);

        // {, }, ; characters, parse line by line
        if (code === 123 || code === 125 || code === 59) {
            line += styles[i];

            var first = line.charCodeAt(0);

            // only trim when the first character is a space ` `
            if (first === 32) { 
                first = (line = line.trim()).charCodeAt(0); 
            }

            var second = line.charCodeAt(1) || 0;

            // /, *, block comment
            if (first === 47 && second === 42) {
                first = (line = line.substring(line.indexOf('*/')+2)).charCodeAt(0);
                second = line.charCodeAt(1) || 0;
            }

            // @, special block
            if (first === 64) {
                // exit flat css context with the first block context
                flat === 1 && (flat = 0, output.length !== 0 && (output = prefix + ' {'+output+'}'));

                // @keyframe/@global, `k` or @global, `g` character
                if (second === 107 || second === 103) {
                    special++;

                    if (second === 107) {
                        blob = line.substring(1, 11) + keyframeNs + line.substring(11);
                        line = '@-webkit-'+blob;
                        type = 1;
                    } else {
                        line = '';
                    }
                }
            } else {
                var third = line.charCodeAt(2) || 0;

                // animation: a, n, i characters
                if (first === 97 && second === 110 && third === 105) {
                    var anims = line.substring(10).split(',');
                    var build = 'animation:';

                    for (var j = 0, length = anims.length; j < length; j++) {
                        build += (j === 0 ? '' : ',') + animationNs + anims[j].trim();
                    }

                    // vendor prefix
                    line = '-webkit-' + build + build;
                }
                // appearance: a, p, p
                else if (first === 97 && second === 112 && third === 112) {
                    // vendor prefix -webkit- and -moz-
                    line = '-webkit-' + line + '-moz-' + line + line;
                }
                // hyphens: h, y, p
                // user-select: u, s, e
                else if (
                    (first === 104 && second === 121 && third === 112) ||
                    (first === 117 && second === 115 && third === 101)
                ) {
                    // vendor prefix all
                    line = '-webkit-' + line + '-moz-' + line + '-ms-' + line + line;
                }
                // flex: f, l, e
                // order: o, r, d
                else if (
                    (first === 102 && second === 108 && third === 101) ||
                    (first === 111 && second === 114 && third === 100)
                ) {
                    // vendor prefix only -webkit-
                    line = '-webkit-' + line + line;
                }
                // transforms & transitions: t, r, a 
                else if (first === 116 && second === 114 && third === 97) {
                    // vendor prefix -webkit- and -ms- if transform
                    line = '-webkit-' + line + (line.charCodeAt(5) === 102 ? '-ms-' + line : '') + line;
                }
                // display: d, i, s
                else if (first === 100 && second === 105 && third === 115) {
                    if (line.indexOf('flex') > -1) {
                        // vendor prefix
                        line = 'display:-webkit-flex; display:flex;';
                    }
                }
                // { character, selector declaration
                else if (code === 123) {
                    // exit flat css context with the first block context
                    flat === 1 && (flat = 0, output.length !== 0 && (output = prefix + ' {'+output+'}'));

                    if (special === 0) {
                        var split = line.split(',');
                        var build = '';

                        // prefix multiple selectors with namesapces
                        // @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
                        for (var j = 0, length = split.length; j < length; j++) {
                            var selector = split[j];
                            var firstChar = selector.charCodeAt(0);

                            // ` `, trim if first char is space
                            if (firstChar === 32) {
                                firstChar = (selector = selector.trim()).charCodeAt(0);
                            }

                            // &
                            if (firstChar === 38) {
                                selector = prefix + selector.substring(1);
                            }
                            // : 
                            else if (firstChar === 58) {
                                var secondChar = selector.charCodeAt(1);

                                // :host 
                                if (secondChar === 104) {
                                    var nextChar = (selector = selector.substring(5)).charCodeAt(0);
                                    
                                    // :host(selector)                                                    
                                    if (nextChar === 40) {
                                        selector = prefix + selector.substring(1).replace(')', '');
                                    } 
                                    // :host-context(selector)
                                    else if (nextChar === 45) {
                                        selector = selector.substring(9, selector.indexOf(')')) + ' ' + prefix + ' {';
                                    }
                                    // :host
                                    else {
                                        selector = prefix + selector;
                                    }
                                }
                                // :global()
                                else if (secondChar === 103) {
                                    selector = selector.substring(8).replace(')', '');
                                }
                                // :hover, :active, :focus, etc...
                                else {
                                    selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
                                }
                            }
                            else {
                                selector = prefix + (firstChar === 58 ? '' : ' ') + selector;
                            }

                            build += j === 0 ? selector : ',' + selector;
                        }

                        line = build;
                    }
                }

                // @global/@keyframes
                if (special !== 0) {
                    // find the closing tag
                    if (code === 125) {
                        close++;
                    } else if (code === 123 && close !== 0) {
                        close--;
                    }

                    // closing tag
                    if (close === 2) {
                        // @global
                        if (type === 0) {
                            line = '';
                        }
                        // @keyframes 
                        else {
                            // vendor prefix
                            line = '}@'+blob+'}';
                            // reset blob
                            blob = '';
                        }

                        // reset flags
                        type = 0;
                        close = special > 1 ? 1 : 0;
                        special--;
                    }
                    // @keyframes 
                    else if (type === 1) {
                        blob += line;
                    }
                }
            }

            output += line;
            line    = '';
            comment = 0;
        }
        // build line by line
        else {
            // \r, \n, remove line comments
            if (comment === 1 && (code === 13 || code === 10)) {
                line = '';
            }
            // not `\t`, `\r`, `\n` characters
            else if (code !== 9 && code !== 13 && code !== 10) {
                code === 47 && comment === 0 && (comment = 1);
                line += styles[i];
            }
        }

        // next character
        i++; 
    }

    return flat === 1 && output.length !== 0 ? prefix+' {'+output+'}' : output;
}

