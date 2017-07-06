// Form Add Row Plugin
(function ( $ ) {

    $.fn.FormAddRow = function( options ) {
 
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            data: [],
            url: [],
			dataType: 'json',
			title: ''
        }, options );
 
        // Greenify the collection based on the settings variable.
        /*return this.css({
            color: settings.color,
            backgroundColor: settings.backgroundColor
        });*/
		
		var $this = $(this);
		// Get the ID of the container holding the form elements for the add a row
		var $thisId = $(this).attr('id');
		
		var rowData = [],
			fields = [],
			jsonData = [];
		
		// Get the number of rows. This would be for the looped data
		var $totalRows = $(this).children('.addFormRow').length;
		//console.log($totalRows);
		
		// I want to call function in order of  f1,f2,f3,f4 every time when i will execute this html page.
		promise = getCurrentData().then(buildTemplate).then(buildTemplateRow).then(f4); // Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
		var myVariable = 0;
		
		/*
		 * Step 1 - Clone any data that may be already present in the form and store in temporary object. 
		 * If the form is going to be populated by a json/ajax object, then that will need to be stored in a temporary object.
		 * Either object will be iterated through in another function.
		 */
		function getCurrentData() {
			var d = $.Deferred();
			// Check to see if ajax or data object have been referenced			
			if(settings.data.length == 0 && settings.url.length == 0){
				// parse through the form and get data populated by code loop
				$this.children('.addFormRow').each(function(index,values){
					// grab the fields for each row
					fields = $(values).find('select,input,textarea').serializeArray();
					// push the data values into the object
					rowData.push(fields);
				});
			} else{ // Data has been provided
				// Get the data oject from the json call
				/*if(settings.data.length > 0 && settings.url.length > 0){
					// Run the ajax call to the data
					jsonData = $.ajax({
						dataType: settings.dataType,
						url: settings.url,
						data: settings.data,
						success: function(data) {
							//console.log(data)
							if(data != null && data != ""){
								return data;
							}

						},
						error: function(x,t,m) {
							console.log(x);
							console.log(t);
							console.log(m);
						}
					});
					rowData = jsonData;
				}*/
			}			
			
			d.resolve(); 
			return d.promise(); //promise(): Return a Deferredâ€™s Promise object.

		}
		/*
		 * Step 2 - Clone the original and create a template of the original with the new dynamic variables in place.
		 * Ensure that the template row is hidden and will not interfere with any form validation that may be used.
		 */
		function buildTemplate() {
			var d = $.Deferred();
			console.log(rowData);
			
			// Get the current content of all the html elements for the add a row
			var $thisContentRow = $($this).children('.addFormRow:first-child').html();

			// Begin creating a copy of the original form as a template row that will be cloned to create additional rows.
			var $template = '<div class="row"><div class="col-md-12"><div class="btn-group pull-right"><button type="button" class="btn btn-primary" id="add_' + $thisId + 'Row">+ Add</button></div></div></div><ul class="list-group" id="' + $thisId + '_container">'
			var templateRow = '<li data-index="0" class="list-group-item " id="' + $thisId + 'Row"><div class="row"><div class="col-xs-11">' + $thisContentRow + '</div><div class="col-xs-1 text-center"><button id="' + $thisId + 'Btn" type="button" class="btn btn-default deleteRow" title="Delete">X</button></div></div></li></ul>';
			// empty the old html when done with it
			$($this).empty();
			// Append the template
			$($this).append($template + templateRow);		

			// get the row height and divide by 2 and fix the delete button placement
			var rowHeight = $($this).find('.list-group-item').outerHeight() / 2 - 30;
			// Assign a top margin to the delete button
			$($this).find('.list-group-item').find('.col-xs-1').children().css('margin-top',rowHeight);
			// Hide the template row
			$('li[data-index="0"]').addClass('hidden');			
			console.log('buildTemplate');
			d.resolve();
			
			return d.promise();
		}
		/*
		 * Step 3 - Get the form and label elements within the specific parent element And begin setting up the dynamic
		 * varaibles that will be needed for the cloning of each elements ID and iterate each one.
		 */
		function buildTemplateRow() {
			var d = $.Deferred();
			console.log('buildTemplateRow');
			elementsLoop('template',0);
			d.resolve();			
			
			return d.promise();
		}
		function f4() {
			var d = $.Deferred();

			setTimeout(function() {
				//alert("3");
				myVariable++;
				//console.log("myVariable: " + myVariable);
				//console.log("3");
				d.resolve();
			},1000);
			return d.promise();
		}
		
		
		
		
		
		
		
		
		
		
		
		function elementsLoop(type,increment){
			if( typeof type === 'undefined' || type === null ){
				type = 'new'; // Types are, template, new, populated
			}
			if( typeof increment === 'undefined' || increment === null ){
				increment = 0; // Types are, template, new, populated
			}
			console.log($thisId);
			// Start changing the IDs for all the content so that the elements can be cloned.
			$('#' + $thisId + 'Row:last-child .row .col-xs-11').children().each(function(index,element){
				var elementClass = $(element).attr('class');
				if(elementClass == 'form-group'){
					parseForm(element,increment,type);
					console.log(formElementId)
				} else {
					// Get the sub elements
					$(element).children().each(function(indx,elem){
						//Parse the form and change the IDs
						parseForm(elem,increment,type);
					});
				}
				//console.log(element);
				//console.log(elementClass);
			});
		}
		
		//$(this).children().clone().prop({ id: "newId", name: "newName"});
		//console.log($thisContent);

		
		if($totalRows > 0){
			//alert('true')
		}
		/*
		 * Step 3 - Create a standard add a row function. 
		 */
		var cloneCount = 0;
		function cloneRow(existing){
			if( typeof existing === 'undefined' || existing === null ){
				existing = false; // Types are new or populated
			}
			// add count
			cloneCount++;//$('#' + $thisId + '_container').length;
			var newClone = $('li[data-index="0"]').clone(true).attr('data-index', cloneCount ).removeClass('hidden');
			$('#' + $thisId + '_container').append(newClone);
			
			var thisTarget = $('data-index="' + cloneCount + '"');
			if(existing){
				elementsLoop('populated',cloneCount);
			} else {
				elementsLoop('new',cloneCount);
			}
			
			console.log(cloneCount);
			return cloneCount;
		}
		$('#add_' + $thisId + 'Row').on('click', function(event){
			cloneRow();
		});
		/*
		 * Step 4 - Create a standard delete a row function. 
		 */
		$('.deleteRow').on('click', function(event){
			var thisRowIndex = $(this).parentsUntil('li').parent().attr('data-index');
			//$('#' + $thisId + ' li').eq(thisRowIndex)
			$(this).parentsUntil('li').parent().remove();
		});
		
		

		/*
		 * Step 6 - Iterate through the object to figure how may rows need to be created. Run the add row function and
		 * start populating each row.
		 */
		
		/*
		 * Parse the initial form to build the template row.
		 */
 		function parseForm(target,increment,template){
			if( typeof target === 'undefined' || target === null ){
				target = [];
				console.error('You must designate a target for the list.');
			}
			if( typeof increment === 'undefined' || increment === null ){
				increment = '0';
			}
			if( typeof template === 'undefined' || template === null ){
				template = false;
			}
			
			if(type == 'template'){
				var rowIdIncrement = '';
				var rowNameIncrement = '';
			} else {
				var rowIdIncrement = '_' + increment;
				var rowNameIncrement = '.' + increment;
			}
			
			var formElementId = '';
			
			if($(target).find('input[type="radio"], input[type="checkbox"]')){
				// since these are typically more than one input, loop around them and assign new IDs
				$(target).find('input[type="radio"], input[type="checkbox"]').each(function(index,element){
					formElementId  = $(element).attr('id');
					if(type == 'template'){
						var elementName = $(element).attr('name');
						$(element).attr('templateName',elementName);
						$(element).removeAttr('name');
						$(element).removeAttr('checked');
					} 
					$(element).attr('id',formElementId + rowIdIncrement);
					$(element).parent('label').attr('for',formElementId + rowIdIncrement);
					
				});				
			} 
			// Handle the for renaming for non radio and checkoxes
			if ($(target).find('.control-label').attr('for')){
				// Get the current ID
				formElementId  = $(target).find('.form-control').attr('id');
				//console.log(formElementId);
				// Rename the ID and the for attribute for the label
				$(target).find('.form-control').attr('id',formElementId + rowIdIncrement);
				$(target).find('.control-label').attr('for',formElementId + rowIdIncrement);
			}			
			
			if(type == 'template'){
				console.log('template');
				// Get the form element name
				var formElementName  = $(target).find('.form-control').attr('name');
				// For template rows, make the name attribute into templateName so 
				// hidden row does not mess with validation
				$(target).find('.form-control').attr('templateName',formElementName);
				// remove the name attribute for template row
				$(target).find('.form-control').removeAttr('name');
				// clear the value for the template row
				$(target).find('.form-control').val('');
			} else {
				console.log('not template');
				// Get the form element name
				var formTemplateName  = $(target).find('.form-control').attr('templateName');
				$(target).find('.form-control').attr('name',formTemplateName + rowNameIncrement);
				// remove the name attribute for template row
				$(target).find('.form-control').removeAttr('templateName');
			}
			
		}
		
    };
 
}( jQuery ));




