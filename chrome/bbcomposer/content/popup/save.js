function closeDialog()
	{
	if(document.getElementById('save-href').value)
		attributes[0] = document.getElementById('save-href').value;
	else
		attributes[0] = '(.+)';
	if(document.getElementById('save-id').value)
		attributes[1] = document.getElementById('save-id').value;
	else
		attributes[1] = '(.+)';
	attributes[2] = document.getElementById('save-language').value;
	window.arguments[0].out = {value:attributes};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	attributes = window.arguments[0].inn.value;
	var x = attributes.length;
	for(var i=0; i<x; i++)
		{
		document.getElementById('save-href').value = attributes[0];
		document.getElementById('save-id').value = attributes[1];
		document.getElementById('save-language').value = attributes[2];
		}
	}
var attributes = false;