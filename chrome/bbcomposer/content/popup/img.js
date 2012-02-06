var attributes = [];

function closeDialog()
	{
	if(document.getElementById('img-src').value=='http://')
		document.getElementById('img-src').value =''
	attributes['src'] = document.getElementById('img-src').value;
	attributes['alt'] = document.getElementById('img-alt').value;
	if(!attributes['style'])
		attributes['style'] ="";
	if(document.getElementById('img-align').value)
		attributes['style'] += " float:"+ document.getElementById('img-align').value + ";";
	window.arguments[0].out = {value:attributes};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	var dAttributes = window.arguments[0].inn.value;
	var x = dAttributes.length;
	for(var i=0; i<x; i++)
		{
		if(dAttributes[i].name=="style")
			{
			if(/(?:.*)float:(?:[ ]*)(left|right)(?:[ ]*);(?:.*)/.test(dAttributes[i].value))
				{
				document.getElementById('img-align').value = dAttributes[i].value.replace(/(?:.*)float:(?:[ ]*)(left|right)(?:[ ]*);(?:.*)/,'$1');
				attributes['style'] = dAttributes[i].value.replace(/(.*)float:(?:[ ]*)(?:left|right)(?:[ ]*);(.*)/,'$1$2');
				}
			else
				{
				attributes['style'] = dAttributes[i].value;
				}
			}
		else if(document.getElementById('img-'+dAttributes[i].name))
			{ document.getElementById('img-'+dAttributes[i].name).value = dAttributes[i].value; }
		}
	}

function browseDirectory()
	{
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Select a File", nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterImages);
	var res = fp.show();
	if (res == nsIFilePicker.returnOK)
		{
		/*var nfph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
			.createInstance(Components.interfaces.nsIFileProtocolHandler);
		document.getElementById('img-src').value = nfph.getURLSpecFromFile(fp.file);*/
		document.getElementById('img-src').value = window.URL.createObjectURL(new File(fp.file));
		}
	}