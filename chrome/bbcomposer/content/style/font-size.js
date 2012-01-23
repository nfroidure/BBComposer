function disableNumericFontSize()
	{
	document.getElementById('font-size-numeric').value='';
	}

function disableVarcharFontSize()
	{
	document.getElementById('font-size-varchar').value='';
	}

function closeDialog()
	{
	if(document.getElementById('font-size-varchar').value)
		fontSize =document.getElementById('font-size-varchar').value;
	else if(document.getElementById('font-size-numeric').value&&document.getElementById('font-size-numeric-unit').value)
		fontSize = document.getElementById('font-size-numeric').value + document.getElementById('font-size-numeric-unit').value;
	else if(document.getElementById('font-size-numeric').value)
		fontSize = document.getElementById('font-size-numeric').value + 'px';
	window.arguments[0].out = {property:fontSize};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	fontSize = window.arguments[0].inn.property;
	if(/([0-9]+)([ ]*)(px|pt|em|%)/i.test(fontSize))
		{
		document.getElementById('font-size-numeric').value = fontSize.replace(/([0-9]+)(?:[ ]*)(px|pt|em|%)/, '$1', 'i');
		document.getElementById('font-size-numeric-unit').value = fontSize.replace(/([0-9]+)(?:[ ]*)(px|pt|em|%)/, '$2', 'i');
		}
	else if(/(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)/i.test(fontSize))
		document.getElementById('font-size-varchar').value = fontSize.replace(/(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)/, '$1', 'i');
	}
var fontSize=false; 