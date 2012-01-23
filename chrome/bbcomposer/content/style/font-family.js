function addFontFamily()
	{
	if(document.getElementById('usual-font-family').selectedItem)
		{
		var x = document.getElementById('font-family').childNodes.length;
		if(/(monospace|fantasy|cursive|sans-serif|serif)/.test(document.getElementById('usual-font-family').selectedItem.label))
			{
			var items = document.getElementById('font-family').childNodes;
			for(var i=0; i<x; i++)
				{
				if(/(monospace|fantasy|cursive|sans-serif|serif)/.test(items[i].label))
					{
					document.getElementById('usual-font-family').appendItem(items[i].label,items[i].value);
					document.getElementById('font-family').removeChild(items[i]);
					}
				}
			document.getElementById('font-family').appendItem(document.getElementById('usual-font-family').selectedItem.label ,document.getElementById('usual-font-family').selectedItem.value);
			}
		else
			{
			if(x) { document.getElementById('font-family').insertItemAt(0,document.getElementById('usual-font-family').selectedItem.label ,document.getElementById('usual-font-family').selectedItem.value); }
			else { document.getElementById('font-family').appendItem(document.getElementById('usual-font-family').selectedItem.label ,document.getElementById('usual-font-family').selectedItem.value); }
			}
		document.getElementById('usual-font-family').removeItemAt(document.getElementById('usual-font-family').selectedIndex);
		document.getElementById('usual-font-family').value="";
		}
	else if(document.getElementById('usual-font-family').value)
		{
		document.getElementById('font-family').appendItem (document.getElementById('usual-font-family').value);
		}
	}

function removeFontFamily()
	{
	if(document.getElementById('font-family').selectedItem)
		{
		document.getElementById('usual-font-family').appendItem (document.getElementById('font-family').selectedItem.label ,document.getElementById('font-family').selectedItem.value);
		document.getElementById('font-family').removeItemAt(document.getElementById('font-family').selectedIndex);
		}
	}

function setFontPriority(up)
	{
	var newItem;
	if(document.getElementById('font-family').selectedItem&&document.getElementById('font-family').childNodes.length>1&&!/(monospace|fantasy|cursive|sans-serif|serif)/.test(document.getElementById('font-family').selectedItem.label))
		{
		if(up&&document.getElementById('font-family').selectedIndex>0)
			{
			newItem = document.getElementById('font-family').insertItemAt(document.getElementById('font-family').selectedIndex - 1,document.getElementById('font-family').selectedItem.label ,document.getElementById('font-family').selectedItem.value);
			document.getElementById('font-family').removeItemAt(document.getElementById('font-family').selectedIndex);
			document.getElementById('font-family').	addItemToSelection(newItem);
			}
		else
			{
			if(document.getElementById('font-family').selectedIndex<document.getElementById('font-family').childNodes.length-2)
				{
				newItem = document.getElementById('font-family').insertItemAt(document.getElementById('font-family').selectedIndex + 2,document.getElementById('font-family').selectedItem.label ,document.getElementById('font-family').selectedItem.value);
				document.getElementById('font-family').removeItemAt(document.getElementById('font-family').selectedIndex);
				document.getElementById('font-family').	addItemToSelection(newItem);
				}
			else if(document.getElementById('font-family').selectedIndex<document.getElementById('font-family').childNodes.length-1&&!/(monospace|fantasy|cursive|sans-serif|serif)/.test(document.getElementById('font-family').getItemAtIndex(document.getElementById('font-family').childNodes.length-1).label))
				{
				newItem = document.getElementById('font-family').appendItem(document.getElementById('font-family').selectedItem.label ,document.getElementById('font-family').selectedItem.value);
				document.getElementById('font-family').removeItemAt(document.getElementById('font-family').selectedIndex);
				document.getElementById('font-family').	addItemToSelection(newItem);
				}
			}
		}
	}

function closeDialog()
	{
	if(document.getElementById('font-family').childNodes.length>0)
		{
		fontFamily = "";
		var x = document.getElementById('font-family').childNodes.length;
		for (var i=0; i<x; i++)
			{
			if(/(.+)([ ]+)(.+)/.test(document.getElementById('font-family').childNodes[i].label))
				fontFamily += "'" + document.getElementById('font-family').childNodes[i].label + "'";
			else
				fontFamily += document.getElementById('font-family').childNodes[i].label;
			if(i<x-1)
				fontFamily += ", ";
			}
		}
	window.arguments[0].out = {property:fontFamily};
	return true;
	}

// INITIALIZATION
function initDialog()
	{
	fontFamily = window.arguments[0].inn.property;
	if(fontFamily)
		{
		var fonts = fontFamily.split(',');
		var x = fonts.length;
		for(var i=0; i<x; i++)
			{
			var font = fonts[i];
			font = font.replace('\'','','g');
			font = font.replace(/([ ]*)(.+)/,'$2','g');
			document.getElementById('font-family').appendItem(font);
			for (var j=document.getElementById('usual-font-family').firstChild.childNodes.length-1; j>=0; j--)
				{
				if(font==document.getElementById('usual-font-family').firstChild.childNodes[j].getAttribute('label'))
					{
					document.getElementById('usual-font-family').removeItemAt(j); j=document.getElementById('usual-font-family').firstChild.childNodes.length;
					}
				}
			}
		document.getElementById('usual-font-family').value="";
		}
	}
var fontFamily;