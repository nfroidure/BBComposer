// OPTION_MANAGER OBJECT
function ewkOptionManager(prefix,branch,dialog,listbox,iframe)
	{
	this.iframe = document.getElementById(iframe);
	this.listbox = document.getElementById(listbox);
	this.dialog = document.getElementById(dialog);
	this.optionBuffer = new ewkOptionService(prefix,branch);
	var evHandler=this.newEventHandler(this,this.handleEvent);
	this.listbox.addEventListener('select',evHandler,true);
	this.dialog.addEventListener('dialogaccept',evHandler,true);
	this.dialog.setAttribute("onload", "");
	this.dialog.addEventListener('load',evHandler,true);
	this.initPage();
	};
	ewkOptionManager.prototype.newEventHandler = function (obj,method,handler)
		{
		var fx = method;
		if(handler)
			{
			window[handler] = function () { return fx.apply(obj, arguments); };
			return window[handler];
			}
		return function () { return fx.apply(obj, arguments); }
		}
	ewkOptionManager.prototype.handleEvent = function (hEvent)
		{
		switch (hEvent.type)
			{
			case "dialogaccept" :
			this.closeDialog();
			break;
			case "load" :
			this.initPage();
			break;
			case "select" :
			this.changePage();
			break;
			default :
			alert("Unexpected event : " + hEvent.type);
			}
		}
	ewkOptionManager.prototype.initPage = function ()
		{
		this.page = this.iframe.contentDocument;
		this.textboxList = new Array();
		this.checkboxList = new Array();
		this.radiogroupList = new Array();
		this.listboxList = new Array();
		this.menulistList = new Array();
		// TEXTBOX
		this.textboxList = this.page.getElementsByTagName("textbox");
		for(var i=0; i<this.textboxList.length; i++)
			{
			if(this.optionBuffer.getCharOption(this.textboxList[i].getAttribute("id"))!="")
				this.textboxList[i].value = this.optionBuffer.getCharOption(this.textboxList[i].getAttribute("id"));
			}
		// CHECKBOX
		this.checkboxList = this.page.getElementsByTagName("checkbox");
		for(var i=0; i<this.checkboxList.length; i++)
			{
			this.checkboxList[i].checked = this.optionBuffer.getBoolOption(this.checkboxList[i].getAttribute("id"));
			}
		// RADIOGROUP
		this.radiogroupList = this.page.getElementsByTagName("radiogroup");
		for(var i=0; i<this.radiogroupList.length; i++)
			{
			if(this.optionBuffer.getCharOption(this.radiogroupList[i].getAttribute("id")))
				{
				var currentRadio = this.radiogroupList[i].getElementsByAttribute("value", this.optionBuffer.getCharOption(this.radiogroupList[i].getAttribute("id")));
				if(currentRadio[0]&&currentRadio[0]!=this.radiogroupList[i].selectedItem)
					{
					this.radiogroupList[i].selectedItem = currentRadio[0];
					}
				}
			}
		// LISTBOX
		this.listboxList = this.page.getElementsByTagName("listbox");
		for(var i=0; i<this.listboxList.length; i++)
			{
			var nbCols = this.listboxList[i].getElementsByTagName('listcol').length;
			for(var j=0; this.optionBuffer.optionIsset(this.listboxList[i].getAttribute("id") + '.' + j); j++)
				{
				var currentValues = this.optionBuffer.getArrayOption(this.listboxList[i].getAttribute("id") + '.' + j);
				if(currentValues.length >= nbCols)
					{
					var currentListitem = this.page.createElement("listitem");
					for(var k=0; k<currentValues.length; k++)
						{
						var currentListcell = this.page.createElement("listcell");
						currentListcell.setAttribute("label", currentValues[k]);
						currentListitem.appendChild(currentListcell);
						}
					this.listboxList[i].appendChild(currentListitem);
					}
				}
			}
		// MENULIST
		this.menulistList = this.page.getElementsByTagName("menulist");
		for(var i=0; i<this.menulistList.length; i++)
			{
			var currentMenuitem = this.page.getElementsByAttribute("value", this.optionBuffer.getCharOption(this.menulistList[i].getAttribute("id")));
			if(currentMenuitem.length<1&&this.menulistList[i].hasAttribute("editable")&&this.menulistList[i].getAttribute("editable"))
				this.menulistList[i].value = this.optionBuffer.getCharOption(this.menulistList[i].getAttribute("id"));
			else
				{
				if(currentMenuitem[0])
					this.menulistList[i].selectedItem = currentMenuitem[0];
				}
			}
		}
	ewkOptionManager.prototype.changePage = function ()
		{
		this.storePage();
		this.iframe.setAttribute("src", this.listbox.selectedItem.getAttribute("value"));
		}
	ewkOptionManager.prototype.closeDialog = function ()
		{
		this.storePage();
		this.optionBuffer.saveOptions();
		}
	ewkOptionManager.prototype.storePage = function ()
		{
		// TEXTBOX
		for(var i=0; i<this.textboxList.length; i++)
			{
			this.optionBuffer.setCharOption(this.textboxList[i].getAttribute("id"), this.textboxList[i].value);
			}
		// CHECKBOX
		for(var i=0; i<this.checkboxList.length; i++)
			{
			this.optionBuffer.setBoolOption(this.checkboxList[i].getAttribute("id"), this.checkboxList[i].checked);
			}
		// RADIOGROUP
		for(var i=0; i<this.radiogroupList.length; i++)
			{
			if(this.radiogroupList[i].selectedItem)
				this.optionBuffer.setCharOption(this.radiogroupList[i].getAttribute("id"), this.radiogroupList[i].selectedItem.value);
			}
		// LISTBOX
		for(var i=0; i<this.listboxList.length; i++)
			{
			var nbCols = this.listboxList[i].getElementsByTagName('listcol').length;
			var listitems = this.listboxList[i].getElementsByTagName('listitem');
			for(var j=0; j<listitems.length; j++)
				{
				if(listitems[j].childNodes.length==nbCols)
					{
					var currentValues = new Array();
					for(var k=0; k<nbCols; k++)
						currentValues[k]=listitems[j].childNodes[k].getAttribute('label');
					this.optionBuffer.setArrayOption(this.listboxList[i].getAttribute("id") + '.' + j, currentValues);
					}
				for(var k=listitems.length; this.optionBuffer.optionIsset(this.listboxList[i].getAttribute("id") + '.' + k); k++)
					{
					this.optionBuffer.clearOption(this.listboxList[i].getAttribute("id") + '.' + k);
					}
				}
			}
		// MENULIST
		for(var i=0; i<this.menulistList.length; i++)
			{
			if(!this.menulistList[i].selectedItem&&this.menulistList[i].hasAttribute("editable")&&this.menulistList[i].getAttribute("editable"))
				this.optionBuffer.setCharOption(this.menulistList[i].getAttribute("id"), this.menulistList[i].value);
			else
				this.optionBuffer.setCharOption(this.menulistList[i].getAttribute("id"), this.menulistList[i].selectedItem.value);
			}
		}