function closeDialog()
	{
	if(document.getElementById('size').value&&document.getElementById('size-unit').value)
		size = document.getElementById('size').value + document.getElementById('size-unit').value;
	else if(document.getElementById('size').value)
		size = document.getElementById('size').value + 'px';
	window.arguments[0].out = {property:size};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	size = window.arguments[0].inn.property;
	if(/([0-9]+)([ ]*)(px|pt|%)/i.test(size))
		{
		document.getElementById('size').value = size.replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$1', 'i');
		document.getElementById('size-unit').value = size.replace(/([0-9]+)(?:[ ]*)(px|pt|%)/, '$2', 'i');
		}
	}
var size=false; 