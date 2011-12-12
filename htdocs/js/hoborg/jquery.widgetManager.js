(function ( $ ){

	/**
	 * @var array List of widgets.
	 **/
	var widgets = [];

	/**
	 * @var boolean On/Off flag.
	 **/
	var isActive = false;

	/**
	 * @var object Default options.
	 */
	var options = {
		callback: function(widget) {},
		conf: 'demo',
		template: '{{body}}'
	};

	var defaultWidgetConfig = {
		tick: 60000
	};

	/**
	 * var object List of public methods.
	 */
	var methods = {
		init : init,
		addWidget : addWidget,
		start: start,
		stop: stop
	};

	function init(opt) {
		$.extend(options, opt);
	}

	function start() {
		isActive = true;
		$.each(widgets, function() { activateWidget(this); });
	}

	function stop() {
		isActive = false;
	}

	function addWidget(widget) {
		widgets.push(widget);
		activateWidget(widget);
	}

	function activateWidget(widget) {
		if (isActive) {
			widgetConfig = $.extend(defaultWidgetConfig, widget.data('config'));
			var t = setTimeout(function() { reloadWidget(widget); }, widgetConfig.tick);
		}
	}

	function reloadWidget(widget) {
		if (!isActive) {
			return;
		}

		var widgetConfig = widget.data('config');

		if (widgetConfig.url) {
			$.ajax({
				url: '/ajax-proxy-new.php',
				processData: true,
				data: {c: options.conf, widget: widgetConfig, url: widgetConfig.url},
				type: 'GET',
				dataType: 'json',
				context: widget,
				success: function(body) { renderWidgetJson(this, body); activateWidget(this); },
				error: function() {renderWidget(this, 'JSON ERROR'); activateWidget(this);}
			});
		} else {
			$.ajax({
				url: '/ajax-widget.php',
                processData: true,
				data: {c: options.conf, widget: widgetConfig},
				type: 'GET',
				context: widget,
				success: function(body) { renderWidget(this, body); activateWidget(this); },
				error: function() {renderWidget(this, 'JSON ERROR'); activateWidget(this);}
			});
		}

	}

	/**
	 * Renders widget.
	 * 
	 * @param {object} widget
	 * @param {string} body
	 */
	function renderWidget(widget, body) {
		if (!body) {
			widget.addClass('hidden');
		} else {
			widget.removeClass('hidden');
			widget.html(body);
		}
		options.callback(widget);
	}

	function renderWidgetJson(widget, json) {
	    if (!json) {
	        renderWidget(widget, 'JSON ERROR');
	        return;
	    }
	    if (!json.body) {
	    	renderWidget(widget, '');
	        return;
	    }
	    var tpl = json.template || options.template;
	    var body = $.mustache(tpl, json);
        renderWidget(widget, body);
	}

	// register plugin
	$.fn.widgetManager = function(method) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply(this, arguments);
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.widgetManager' );
		}
	};

})(jQuery);
