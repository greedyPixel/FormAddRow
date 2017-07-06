// Form Add Row Plugin
(function ( $ ) {

    $.fn.FormAddRow = function( options ) {
 
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            data: '',
            url: '',
			dataType: 'json',
			title: '',
			loaded: function(){},
			destroy: false
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
			field = [];
		
		var cloneCount = 0;
		
		// Get the number of rows. This would be for the looped data
		var $totalRows = $(this).children('.addFormRow').length;
		//console.log($totalRows);
		
		
		if(settings.data.length == 0 && settings.url.length == 0){
			if(settings.destroy){
				promise = destroyThis().then(afterRowsBuilt);
			} else {
				// I want to call function in order of  f1,f2,f3,f4 every time when i will execute this html page.
				promise = getCurrentData().then(buildTemplate).then(buildTemplateRow).then(buildExistingRows).then(afterRowsBuilt); // Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
			}		
		} else {
			if(settings.data.length > 0 && settings.url.length > 0){
				// I want to call function in order of  f1,f2,f3,f4 every time when i will execute this html page.
				//promise = getAjaxObject().then(buildTemplate).then(buildTemplateRow).then(buildExistingRows); 
				promise = getAjaxObject();
				// Add handlers to be called when the Deferred object is resolved, rejected, or still in progress.
			} else if(settings.destroy){
				promise = destroyThis().then(afterRowsBuilt);
			}
		}
		
		var myVariable = 0;
		
		/*
		 * Step 1 - Clone any data that may be already present in the form and store in temporary object. 
		 * If the form is going to be populated by a json/ajax object, then that will need to be stored in a temporary object.
		 * Either object will be iterated through in another function.
		 */
		var assignAjaxData = function(dataSource) {
			if(settings.data != ''){
				var dataHandle = settings.data;
				rowData = dataSource[dataHandle];
				promise = buildTemplate().then(buildTemplateRow).then(buildExistingRows).then(afterRowsBuilt); 
			}			
		}
		function getAjaxObject() {
			var d = $.Deferred();
			var iteration = 0;
			var result = [];
			$.ajax({
				dataType: settings.dataType,
				url: settings.url,
				data: settings.data,
				  beforeSend: function(xhr,settings) {
					  xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
					 //console.log(xhr.readyState);
					 //console.log(settings);

				},
				type: 'get',
				async: true,
				success: function(dataSource,jqXHR) {
					//Assign data
					assignAjaxData(dataSource);
				},
				error: function(x,t,m) {
					console.error(x);
					console.error(t);
					console.error(m);
				}
			}).done(function(dataSource,jqXHR) {
				// put loaded function here

			});
			
			d.resolve();
			
			return d.promise();
		}
		//
		function getCurrentData() {
			var d = $.Deferred();
						
			// Set a counter for each row
			var dataCounter = 0;
			// loop through each row
			$($this).find('.addFormRow').each(function(index,values){
				// make an object for each row of data
				var rowItems = [];
				// set the current set of fields to row items
				fields = rowItems;
				// loop through each of the elements in the row
				$.each($(values).find('select, input, textarea'),function(indx,elem){
					// make sure the elements are tied to the parent index
					if(dataCounter === index){
						// check for radio or checkbox
						if($(elem).attr('type') == 'radio' || $(elem).attr('type') == 'checkbox'){

							if($(elem).attr('checked')){
								fields.push( {
									name: $(elem).attr('name'),
									value: $(elem).val()
								});
							}
						} else { // Get every other fields value if it exists and push into fields object
							fields.push( {
								name: $(elem).attr('name'),
								value: $(elem).val()
							});
						}
					} 
				});
				// push the fields into the row data	
				rowData.push(fields);
				// increment the counter
				dataCounter++;										
			});
			
			d.resolve(); 
			return d.promise(); //promise(): Return a Deferredâ€™s Promise object.

		}
		/*
		 * Step 2 - Clone the original and create a template of the original with the new dynamic variables in place.
		 * Ensure that the template row is hidden and will not interfere with any form validation that may be used.
		 */
		function buildTemplate() {
			var d = $.Deferred();
			//console.log(rowData);
			
			// Get the current content of all the html elements for the add a row
			var $thisContentRow = $($this).children('.addFormRow:first-child').html();

			// Begin creating a copy of the original form as a template row that will be cloned to create additional rows.
			var $template = '<div class="row"><div class="col-md-12"><div class="btn-group pull-right"><button type="button" class="btn btn-primary" id="add_' + $thisId + 'Row">+ Add</button></div>'
			if(settings.title != ''){
				$template += '<legend>' + settings.title + '</legend>';
			}
			$template += '</div></div><ul class="list-group" id="' + $thisId + '_container">';
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
			d.resolve();
			
			return d.promise();
		}
		/*
		 * Step 3 - Get the form and label elements within the specific parent element And begin setting up the dynamic
		 * varaibles that will be needed for the cloning of each elements ID and iterate each one.
		 */
		function buildTemplateRow() {
			var d = $.Deferred();
			elementsLoop('template',0);
			d.resolve();			
			
			return d.promise();
		}
		function buildExistingRows() {
			var d = $.Deferred();
			$.each(rowData, function(index,element){
				// Do a clone for each existing row
				cloneRow(true);
			});
			$('#add_' + $thisId + 'Row').on('click', function(event){
				cloneRow('new');
			});
			/*
			 * Step 4 - Create a standard delete a row function. 
			 */
			$('.deleteRow').on('click', function(event){
				var thisRowIndex = $(this).parentsUntil('li').parent().attr('data-index');
				//$('#' + $thisId + ' li').eq(thisRowIndex)
				$(this).parentsUntil('li').parent().remove();
			});
			d.resolve();
			
			return d.promise();
		}
		function afterRowsBuilt() {
			var d = $.Deferred();
			
			//Add after build functions
			settings.loaded();
			
			d.resolve();			
			
			return d.promise();
		}		
		
		function elementsLoop(type,increment){
			if( typeof type === 'undefined' || type === null ){
				type = 'new'; // Types are, template, new, populated
			}
			if( typeof increment === 'undefined' || increment === null ){
				increment = 0; // Types are, template, new, populated
			}
			//console.log($thisId);
			// Start changing the IDs for all the content so that the elements can be cloned.
			$('#' + $thisId + 'Row:last-child .row .col-xs-11').children().each(function(index,element){
				//console.log($(element));
				var elementClass = $(element).attr('class');
				if(elementClass == 'form-group'){
					parseForm(element,increment,type);
					
				} else {
					// Parse through hidden fields
					if($(element).attr('type') == 'hidden'){
						//console.log($(element).attr('id'));
						// Get the hidden elements
						$(element).each(function(indx,elem){
							//console.log($(elem).attr('id'));
							//Parse the form and change the IDs
							parseForm(elem,increment,type);
						});
					}
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
		
		function cloneRow(existing,target){
			if( typeof existing === 'undefined' || existing === null ){
				existing = false; // Types are new or populated
			}
			if( typeof cloneCount === 'undefined' || cloneCount === null ){
				cloneCount = 0; // Types are new or populated
			}
			if( typeof target === 'undefined' || target === null ){
				target = $thisId; // Types are new or populated
			}
			// add count
			cloneCount++;//$('#' + $thisId + '_container').length;
			var newClone = $('#' + target +'_container li[data-index="0"]').clone(true).attr('data-index', cloneCount ).removeClass('hidden');
			$('#' + target + '_container').append(newClone);
			
			//var thisTarget = $('[data-index="' + cloneCount + '"]');
			
			if(existing){
				elementsLoop('populated',cloneCount);
			} else {
				elementsLoop('new',cloneCount);
			}
			
			//console.log(cloneCount);
			return cloneCount;
		}
		
		
		

		/*
		 * Step 6 - Iterate through the object to figure how may rows need to be created. Run the add row function and
		 * start populating each row.
		 */
		
		/*
		 * Parse the initial form to build the template row.
		 */
 		function parseForm(target,increment,type){
			if( typeof target === 'undefined' || target === null ){
				target = [];
				console.error('You must designate a target for the list.');
			}
			if( typeof increment === 'undefined' || increment === null ){
				increment = '0';
			}
			if( typeof type === 'undefined' || type === null ){
				type = 'new'; // Types are template, new, populated
			}
			
			// handle hidden inputs
			if($(target).attr('type') == 'hidden'){
				var formTarget = $(target);
			} else {
				var formTarget = $(target).find('.form-control');
				
			}
			
			var formElementId = '';
			
			if(type == 'template'){
				var rowIdIncrement = '';
				var rowNameIncrement = '';
			} else {
				var rowIdIncrement = '_' + increment;
				var rowNameIncrement = '.' + increment;
			}
			
			
			var rowNum = increment - 1; // used for data population
			
			if($(target).find('input[type="radio"], input[type="checkbox"]')){
				// since these are typically more than one input, loop around them and assign new IDs
				$(target).find('input[type="radio"], input[type="checkbox"]').each(function(index,element){
					formElementId  = $(element).attr('id');
					
					if(type == 'template'){
						var elementName = $(element).attr('name');
						if($(element).attr('name').indexOf('.') > -1){
							var formName = $(element).attr('name');
							var nameLength =  $(element).attr('name').split(".").pop().length + 1;
							elementName = formName.substring(0,formName.length - nameLength);
						}
						$(element).attr('templateName',elementName);
						$(element).removeAttr('name');
						$(element).removeAttr('checked');
						
						if($(element).attr('id')){
							if($(element).attr('id').indexOf('_') > -1){
								var formId = $(element).attr('id');
								var idLength =  $(element).attr('id').split("_").pop().length + 1;
								formElementId = formId.substring(0,formId.length - idLength);
							}
						}
					} else {
						var templateName = $(element).attr('templateName');
						$(element).attr('name',templateName + rowNameIncrement);
						$(element).removeAttr('templateName');
						if(type != 'new' || type == 'populated'){
							$.each(rowData[rowNum], function(idx,elem){
								//console.log(elem.name + '[' + idx + '] = "' + elem.value + '"');
								if(templateName == elem.name && $(element).val() == elem.value){ //
									// Check the selected radio and check boxes
									$(element).prop('checked','checked');
								}
							});	
						}
						//console.log(rowData)
					}
					
					$(element).attr('id',formElementId + rowIdIncrement);
					$(element).parent('label').attr('for',formElementId + rowIdIncrement);
					
				});				
			} 
			
			// Handle the for renaming for non radio and checkoxes
			if ($(target).find('.control-label').attr('for')){
				// Get the current ID
				//formElementId  = formTarget.attr('id');
				//console.log(formElementId);
				// Rename the ID and the for attribute for the label
				//formTarget.attr('id',formElementId + rowIdIncrement);
				if(formTarget.attr('id')){
					if(formTarget.attr('id').indexOf('_') > -1){
						var formId = formTarget.attr('id');
						var idLength =  formTarget.attr('id').split("_").pop().length + 1;
						formElementId = formId.substring(0,formId.length - idLength);
					} else {
						formElementId  = formTarget.attr('id');						
					}
					formTarget.attr('id',formElementId + rowIdIncrement);
				}
				$(target).find('.control-label').attr('for',formElementId + rowIdIncrement);
			} else {
				if(formTarget.attr('id')){
					if(formTarget.attr('id').indexOf('_') > -1){
						var formId = formTarget.attr('id');
						var idLength =  formTarget.attr('id').split("_").pop().length + 1;
						formElementId = formId.substring(0,formId.length - idLength);
					} else {
						formElementId  = formTarget.attr('id');
					}
				}
				
				formTarget.attr('id',formElementId + rowIdIncrement);
			}			
			
			// If template row, then strip the values
			if(type == 'template'){
				//console.log('template');
				// Get the form element name
				var formElementName  = formTarget.attr('name');
				if(formTarget.attr('name')){
					if(formTarget.attr('name').indexOf('.') > -1){
						var formName = formTarget.attr('name');
						var nameLength =  formTarget.attr('name').split(".").pop().length + 1;
						formElementName = formName.substring(0,formName.length - nameLength);
					}
				}
				// For template rows, make the name attribute into templateName so 
				// hidden row does not mess with validation
				formTarget.attr('templateName',formElementName);
				// remove the name attribute for template row
				formTarget.removeAttr('name');
				// clear the value for the template row
				formTarget.val('');
				
			} else {
				// Get the form element name
				var formTemplateName  = formTarget.attr('templateName');
				formTarget.attr('name',formTemplateName + rowNameIncrement);
				// remove the name attribute for template row
				formTarget.removeAttr('templateName');
				if(type != 'new' || type == 'populated'){
					$.each(rowData[rowNum], function(index,element){
						if(formTemplateName == element.name){
							formTarget.val(element.value);
							formTarget.attr('value',element.value);
							// check to see if form object is a select
							if(formTarget.children('option').length > 0){
								// lopp through the select options
								formTarget.children('option').each(function(indx,elem){
									// check for selected values
									if($(elem).val() == formTarget.val()){
										$(elem).attr('selected','selected');
									}
								});
							}
							//console.log(element.name + '[' + index + '] = "' + element.value + '"');
						}
					});		
				}
			}
			
		}
		/*
		 * Destroy the plugin and turn it to close to the original state, but still allow it to submit
		 */
		function destroyThis() {
			var d = $.Deferred();
						
			var destroyedRows = '';
			$('#' + $thisId + '_container').children('.list-group-item').each(function(num,row){
				// ignore the template row
				if(!$(row).hasClass('hidden')){
					// loop through each row and store them
					var thisRow = '<div class="addFormRow">' + $(row).children('.row').children('.col-xs-11').html() + '</div>';
					destroyedRows += thisRow;
				}
				
			});
			// Empty to original
			$('#' + $thisId).empty();
			// append the copied rows
			$('#' + $thisId).append(destroyedRows);
			
			d.resolve(); 
			return d.promise(); //promise(): Return a Deferredâ€™s Promise object.

		}
		
    };
 
}( jQuery ));



