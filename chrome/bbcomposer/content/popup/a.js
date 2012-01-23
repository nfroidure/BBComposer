function closeDialog()
	{
	if(document.getElementById('link-href').value=='http://'||document.getElementById('link-href').value=='')
		{
		window.arguments[0].out = {value:null};
		}
	else
		{
		newAttributes['href']=document.getElementById('link-href').value;
		newAttributes['hreflang']=document.getElementById('link-hreflang').value;
		newAttributes['title']=document.getElementById('link-title').value;
		newAttributes['onclick']=document.getElementById('link-onclick').value;
		window.arguments[0].out = {value:newAttributes};
		}
	return true;
	}

function cancelDialog()
	{
	window.arguments[0].out = {value:newAttributes};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	var attributes = window.arguments[0].inn.value;
	bbcomp_language_bundle = document.getElementById("bbcomp_languages");
	var bbcomp_languages = bbcomp_language_bundle.strings;
	while(bbcomp_languages.hasMoreElements())
		{
		var currPropertyElement = bbcomp_languages.getNext();
		if (!(currPropertyElement instanceof Components.interfaces.nsIPropertyElement))
			break;
		document.getElementById('link-hreflang').appendItem (currPropertyElement.value, currPropertyElement.key);
		}
	newAttributes = new Array();
	var x = attributes.length;
	for(var i=0; i<x; i++)
		{
		if(document.getElementById('link-'+attributes[i].name))
			{
			document.getElementById('link-'+attributes[i].name).value = attributes[i].value;
			newAttributes[attributes[i].name]=attributes[i].value;
			}
		}
	}
var newAttributes = false;
var bbcomp_language_bundle;