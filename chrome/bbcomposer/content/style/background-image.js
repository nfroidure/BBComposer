function closeDialog()
	{
	if(document.getElementById('background-image').value)
		{
		if(document.getElementById('background-image').value == 'none')
			backgroundImage = 'none';
		else if(/(http|ftp):\/\/(.+)/i.test(document.getElementById('background-image').value))
			backgroundImage = "url(" + document.getElementById('background-image').value + ")";
		else
			backgroundImage="";
		}
	window.arguments[0].out = {property:backgroundImage};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	backgroundImage = window.arguments[0].inn.property;
	if(backgroundImage=="none")
		document.getElementById('background-image').value = "none";
	else if(/url\((http|ftp):\/\/(.+)\)/i.test(backgroundImage))
		document.getElementById('background-image').value = backgroundImage.replace(/url\(((http|ftp):\/\/(.+))\)/,'$1','i');
	}
var backgroundImage=false; 