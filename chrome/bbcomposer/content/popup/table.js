function closeDialog()
	{
	attributes['caption'] = document.getElementById('tbl-caption').value;
	attributes['summary'] = document.getElementById('tbl-summary').value;
	attributes['thead'] = document.getElementById('tbl-hrows').value;
	attributes['tfoot'] = document.getElementById('tbl-frows').value;
	attributes['tbody'] = document.getElementById('tbl-rows').value;
	attributes['cols'] = document.getElementById('tbl-cols').value;
	window.arguments[0].out = {value:attributes};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	attributes = window.arguments[0].inn.value;
	for(var i=0; i<attributes.length; i++)
		alert(attributes[i]);
	if(attributes['caption'])
		document.getElementById('tbl-caption').value = attributes['caption'];
	if(attributes['summary'])
		document.getElementById('tbl-summary').value = attributes['summary'];
	if(attributes['thead'])
		document.getElementById('tbl-hrows').value = attributes['thead'];
	if(attributes['tfoot'])
		document.getElementById('tbl-frows').value = attributes['tfoot'];
	if(attributes['tbody'])
		document.getElementById('tbl-rows').value = attributes['tbody'];
	if(attributes['cols'])
		document.getElementById('tbl-cols').value = attributes['cols'];
	}
var attributes = false;