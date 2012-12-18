/**
 * swerve.js - An animation library using CSS transforms
 * version 0.0.1
 * Copyright (c) 2012 Elisha Cook
 * MIT Licensed
 */
;(function ()
{
    // Detect which type of transforms and transitions are available, if any,
    // and set the appropriate vendor prefixes.
    
        /**
         * Names of style properties for transforms and transitions
         */
    var properties = 
        {
            transform: null,
            transition: null,
            perspective: null
        },
        
        cssproperties = 
        {
            transform: null,
            transition: null,
            perspective: null
        },
        
        /**
         * Matches transition properties with the names of transitionEnd events.
         */
        transitionend_events = 
        {
            'transition':'transitionEnd',
            'OTransition':'oTransitionEnd',
            'MSTransition':'msTransitionEnd',
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        },
        
        /**
         * Stores the name of the transitionEnd event and keeps track of elements 
         * that have callbacks attached.
         */
        transitionend = 
        {
            event_name: null,
            elements: {}
        }
        prefixes = ['Webkit', 'Moz', 'ms', 'O'],
        cssprefixes = ['-webkit-', '-moz-', '-ms-', '-o-'],
        test_div = document.createElement('div'),
        match = false
    
    for (var w3c_prop in properties)
    {
        if (test_div.style[ w3c_prop ])
        {
            properties[w3c_prop] = w3c_prop
            cssproperties[w3c_prop] = w3c_prop
        }
        else
        {
            for (var i=0; i<prefixes.length; i++)
            {
                var vendor_prop = prefixes[i] + w3c_prop.substr(0,1).toUpperCase() + w3c_prop.substr(1)
                
                if (typeof test_div.style[ vendor_prop ] !== "undefined")
                {
                    properties[w3c_prop] = vendor_prop
                    cssproperties[w3c_prop] = cssprefixes[i] + w3c_prop
                    break;
                }
            }
        }
    }
    
    if (properties.transition)
    {
        transitionend.event_name = transitionend_events[ properties.transition ]
        
        /**
         * Fires a callback after a list of properties have been transitioned
         * @param {Function} fn        The callback
         * @param {Array}   properties The list of properties (can contain duplicates).
         */
        transitionend.Callback = function (fn, properties)
        {
            this.fn = fn
            this.properties = properties
        }
        transitionend.Callback.prototype.property_complete = function (property_name)
        {
            var i = this.properties.indexOf(property_name)
            
            if (-1 < i)
            {
                this.properties = this.properties.slice(0, i).concat( this.properties.slice(i+1) )
            }
            
            if (this.properties.length == 0)
            {
                this.fn()
            }
        }
    }
    
    /**
     * Construct a new `Swerve` object.
     * @param {string|DOMNode} selector_or_node A CSS selector or dom node.
     */
    window.Swerve = function (selector_or_node)
    {
        if (typeof selector_or_node == "string")
        {
            this.nodes = document.querySelectorAll(selector_or_node)
        }
        else
        {
            this.nodes = [selector_or_node]
        }
        
        this._default_perspective = '800px'
        this._reset()
    }
    
    Swerve.prototype =
    {
        /**
         * Set a style property.
         * @param {string} name  The name of a property.
         * @param {mixed} value The value of the property.
         */
        set: function (name, value)
        {
            this._properties[name] = value
            return this
        },
        
        /**
         * Set the perspective value for 3d transforms
         * @param  {string} perspective A perspective value.
         */
        perspective: function (perspective)
        {
          this._perspective = perspective  
        },
        
        /**
         * Set the duration of the animation.
         * @param  {string} duration A duration string like '.5s'
         */
        duration: function (duration)
        {
            this._duration = duration
            return this
        },
        
        /**
         * Set the timing function for the animation.
         * @param  {string} Any of the valid values for the style property 'transition-timing-function'
         */
        timing: function (timing)
        {
            this._timing = timing
            return this
        },
        
        /**
         * Delay the start of the animation.
         * @param  {string} delay A duration string like '.5s'
         */
        delay: function (delay)
        {
            this._delay = delay
            return this
        },
        
        /**
         * Run the animation.
         * @param  {Function} callback An optional callback that will be called when 
         *                             the animation completes.
         */
        run: function (callback)
        {
            for (var i=0; i<this.nodes.length; i++)
            {
                var node = this.nodes[i]
                
                if (properties.perspective)
                {
                    if (!this._perspective)
                    {
                        this._perspective = this._default_perspective
                    }
                    
                    node.parentNode.style[properties.perspective] = this._perspective
                }
                
                node.style[properties.transition] = [cssproperties.transform, this._duration, this._timing].join(' ')
                node.style[properties.transform] = this._transforms.join(' ')
            }
            
            //this._reset()
            
            return this
        },
        
        _reset: function ()
        {
            this._transforms = []
            this._properties = {}
            this._duration = 0
            this._delay = 0
            this._timing = 'linear'
            this._perspective = null
        }
    }
    
    /**
     * Describes all the transformations.
     * 
     * Transformations are grouped by 2d or 3d. The value of each entry is a string
     * describing that transformations arguments. For example 'nn' means two number
     * arguments. Here's the legend:
     * 
     * 'n' - number, e.g. 23, will always be parsed as a float
     * 'v' - value, e.g., '4em' or 200, if not a string, will be assumed to be pixels
     * 'a' - angle, e.g., 90 or '90deg', if not a string, will be assumed to be degrees
     */
    var transforms = 
    {
        '2d':
        {
            matrix: 'nnnnnn',
            translate: 'vv',
            translateX: 'v',
            translateY: 'v',
            scale: 'nn',
            scaleX: 'n',
            scaleY: 'n',
            rotate: 'a',
            skew: 'aa',
            skewX: 'a',
            skewY: 'a'
        },
        
        '3d':
        {
            matrix3d: 'nnnnnnnnnnnnnnnn',
            translate3d: 'vvv',
            translateZ: 'v',
            scale3d: 'nnn',
            scaleZ: 'n',
            rotate3d: 'nnna',
            rotateX: 'a',
            rotateY: 'a',
            rotateZ: 'a',
            perspective: 'v'
        }
    }
    
    /**
     * Validators for transform arguments.
     */
    var arg_functions = 
    {
        n: function (value)
        {
            var v = parseFloat(value)
            
            if (isNaN(v))
            {
                return 0
            }
            
            return v
        },
        
        v: function (value)
        {
            if (typeof value != "string")
            {
                value = value + 'px'
            }
            
            return value
        },
        
        a: function (value)
        {
            if (typeof value != "string")
            {
                value = value + 'deg'
            }
            
            return value
        }
    }
    
    /**
     * Creates a function that generates a CSS transform.
     * @param  {string} name            The name of the transform.
     * @param  {string} argument_string A string defining the arguments of the transform.
     * @return {Function}
     */
    var get_transform_function = function (name, argument_string)
    {
        return function ()
        {
            var args = []
            
            for (var i=0; i<argument_string.length; i++)
            {
                args.push(
                    arg_functions[ argument_string[i] ]( arguments[i] )
                )
            }
            
            this._transforms.push( name + '('+args.join(',')+')' )
            return this
        }
    }
    
    if (properties.transform)
    {
        for (var n in transforms['2d'])
        {
            Swerve.prototype[n] = get_transform_function(n, transforms['2d'][n])
        }
    }
    
    if (properties.perspective)
    {
        for (var n in transforms['3d'])
        {
            Swerve.prototype[n] = get_transform_function(n, transforms['3d'][n])
        }
        
        Swerve.prototype.translate = Swerve.prototype.translate3d
        Swerve.prototype.scale = Swerve.prototype.scale3d
    }
    
    /**
     * Make the detected properties available via the `Swerve` object.
     */
    Swerve.properties = properties
    
    /**
     * AMD support
     */
    if (typeof define != "undefined")
    {
        define(function ()
        {
            return Swerve
        })
    }
})()