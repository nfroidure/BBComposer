function disableOrientPosition()
	{
	document.getElementById('vertical-position').value='';
	document.getElementById('horizontal-position').value='';
	}

function disableCoordPosition()
	{
	document.getElementById('x-position').value='';
	document.getElementById('y-position').value='';
	}

function closeDialog()
	{
	backgroundPosition = "";
	if(document.getElementById('vertical-position').value||document.getElementById('horizontal-position').value)
		{
		if(document.getElementById('horizontal-position').value)
			backgroundPosition += document.getElementById('horizontal-position').value + " ";
		else
			backgroundPosition +="top ";
		if(document.getElementById('vertical-position').value)
			backgroundPosition += document.getElementById('vertical-position').value;
		else
			backgroundPosition +="left";
		}
	else if(document.getElementById('y-position').value||document.getElementById('x-position').value)
		{
		if(document.getElementById('x-position').value&&document.getElementById('x-position-unit').value)
			backgroundPosition += document.getElementById('x-position').value + document.getElementById('x-position-unit').value + " ";
		else
			backgroundPosition +="0 ";
		if(document.getElementById('y-position').value&&document.getElementById('x-position-unit').value)
			backgroundPosition += document.getElementById('y-position').value + document.getElementById('y-position-unit').value;
		else
			backgroundPosition +="0";
		}

	window.arguments[0].out = {property:backgroundPosition};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	backgroundPosition = window.arguments[0].inn.property;
	if(/([0-9]+)([ ]*)(px|pt|em|%)([ ]*)([0-9]+)([ ]*)(px|pt|em|%)/i.test(backgroundPosition))
		{
		document.getElementById('x-position').value = backgroundPosition.replace(/([0-9]+)(?:[ ]*)(px|pt|em|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|em|%)/, '$1', 'i');
		document.getElementById('x-position-unit').value = backgroundPosition.replace(/([0-9]+)(?:[ ]*)(px|pt|em|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|em|%)/, '$2', 'i');
		document.getElementById('y-position').value = backgroundPosition.replace(/([0-9]+)(?:[ ]*)(px|pt|em|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|em|%)/, '$3', 'i');
		document.getElementById('y-position-unit').value = backgroundPosition.replace(/([0-9]+)(?:[ ]*)(px|pt|em|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|em|%)/, '$4', 'i');
		}
	else if(/(left|center|right)([ ]+)(top|center|bottom)/i.test(backgroundPosition))
		{
		document.getElementById('horizontal-position').value = backgroundPosition.replace(/(left|center|right)(?:[ ]+)(top|center|bottom)/, '$1', 'i');
		document.getElementById('vertical-position').value = backgroundPosition.replace(/(left|center|right)(?:[ ]+)(top|center|bottom)/, '$2', 'i');
		}
	else if(backgroundPosition=="center")
		document.getElementById('horizontal-position').value = document.getElementById('vertical-position').value = "center";
	}
var backgroundPosition=false; 