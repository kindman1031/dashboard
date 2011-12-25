(function ( $ ) {
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
		conf: 'demo',
		url: '',
		callback: function(widget) {},
		widgetWrapper: '<div class="widget"></div>',
		template: '{{body}}',
		defaults: {
			size: 'span6'
		}
	};

	var defaultWidgetConfig = {
		tick: 60
	};

	/**
	 * var object List of public methods.
	 */
	var methods = {
		init : init,
		addWidget : addWidget,
		addWidgets : addWidgets,
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
		// create 
		widgetDiv = createWidget(widget);

		widgets.push(widgetDiv);
		this.append(widgetDiv);

		renderWidgetJson(widgetDiv, widget);
		activateWidget(widgetDiv);
		options.callback(widgetDiv);
	}

	function addWidgets(newWidgets) {
		m = this;
		$.each(newWidgets, function() { addWidget.apply(m, [this]); });
	}
	
	function createWidget(widget) {
		var widgetDiv = $(options.widgetWrapper);
		widgetDiv.data('config', widget);
		
		var size = widget['size'] || options.defaults.size;
		
		widgetDiv.addClass(size);
		
		return widgetDiv;
	}

	function activateWidget(widget) {
		if (isActive) {
			widgetConfig = $.extend(defaultWidgetConfig, widget.data('config'));
			var t = setTimeout(
				function() { reloadWidget(widget); }, 
				widgetConfig.tick * 1000
			);
		}
	}

	function reloadWidget(widget) {
		if (!isActive) {
			return;
		}

		var widgetConfig = widget.data('config');

		$.ajax({
			url: options.url,
			processData: true,
			data: {conf: options.conf, widget: widgetConfig},
			type: 'GET',
			dataType: 'json',
			context: widget,
			success: function(body) { 
				renderWidgetJson(this, body);
				options.callback(this);
				activateWidget(this);
			},
			error: function() { widgetConfig.body =  'JSON Error'; renderWidgetJson(this, widgetConfig); activateWidget(this);}
		});
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
