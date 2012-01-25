function listbox_add(listbox)
	{
	var nbCols = listbox.getElementsByTagName('listcol').length;
	var values = window.prompt('uriRegExp!fieldRegExp!langageCode');
	if(values)
		{
		values = values.split('!');
		var curItem = listbox.ownerDocument.createElement('listitem');
		if(values.length==3)
			for(var i=0; i<nbCols; i++)
				{
				var curCell = listbox.ownerDocument.createElement('listcell');
				curCell.setAttribute('label', values[i]);
				curItem.appendChild(curCell);
				}
		listbox.appendChild(curItem);
		}
	}
function listbox_delete(listbox)
	{
	listbox.removeChild(listbox.selectedItem);
	}