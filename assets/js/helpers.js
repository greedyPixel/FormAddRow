// JavaScript Document
(function ( $ ) {
	$.fn.displayHTML = function( options ) {
		// This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            destination: '',
			loaded: function(){}
        }, options );
		
		var $this = $(this);
		
		var source = settings.source,
			destination = settings.destination,
			sourceHTML = '';
		
		promise = getHTML().then(parseHTML).then(afterBuilt);
		
		function getHTML() {
			var d = $.Deferred();
			var target = $this;
			
			var thisHtml = $this.html();
			//console.log($this.prop('outerHTML'))
			sourceHTML = '<figure class="highlight"><pre><code class="language-html" data-lang="html">'
				+ $this.prop('outerHTML');
				+  '</code></pre></figure>';
			// empty the old html when done with it
			$(destination).empty();
			// Append the template
			$(destination).append(sourceHTML);
			
			d.resolve();			
			
			return d.promise();
		}
		function parseHTML() {
			var d = $.Deferred();
			
			var newDestination = $(destination).children().children().children().children();
			
			//var rawHtml = $(destination).children().children().children().children().html().replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			
			var rawHtml = newDestination.text(newDestination.prop('outerHTML')).html().trim();
			
			//rawHtml.toString().replace('&lt;','<span class="nt">&lt;').replace('&gt;','&gt;</span>');
			
			//console.log(newDestination.text());
			
			newDestination.text().replace('&lt;','<span class="nt">&lt;').replace('&gt;','&gt;</span>');
			
			//newDestination.text(function (i, old) {
				 //return old.replace('&lt;','<span class="nt">&lt;').replace('&gt;','&gt;</span>');
			//});
			
			//console.log(transposed)
			
			//var transposed = $(destination).children().html();
			// empty the old html when done with it
			//$(destination).children().empty();
			// Append the template
			//$(destination).children().children().children().children().append(rawHtml);
			
			d.resolve();			
			
			return d.promise();
		}
		function afterBuilt() {
			var d = $.Deferred();
			
			//Add after build functions
			settings.loaded();
			
			d.resolve();			
			
			return d.promise();
		}
	};
}( jQuery ));