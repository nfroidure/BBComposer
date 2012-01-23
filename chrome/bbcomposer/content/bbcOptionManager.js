// SETTINGS
const iframe_id = "option_iframe";
const listbox_id = "option_menu";
const dialog_id = "option_dialog";
const preference_branch = ""; //renseign it only if you want to acces the mozilla native prefs

// INITIALIZE
var myOManager;
var myOService;
function initOManager()
	{
	myOService = new bbcOptionService(preference_branch);
	myOManager = new bbcOptionManager(myOService);
	myOManager.initPage();
	document.getElementById(listbox_id).addEventListener('select',handleEvent,true);
	document.getElementById(dialog_id).addEventListener('dialogaccept',handleEvent,true);
	document.getElementById(dialog_id).setAttribute("onload", "");
	document.getElementById(dialog_id).addEventListener('load',handleEvent,true);
	}

function handleEvent(hEvent)
	{
	switch (hEvent.type)
		{
		case "dialogaccept" :
		myOManager.closeDialog();
		break;
		case "load" :
		myOManager = new bbcOptionManager(myOService);
		myOManager.initPage();
		break;
		case "select" :
		myOManager.changePage();
		break;
		default :
		alert("Unexpected event : " + hEvent.type);
		}
	}

// OPTION_MANAGER OBJECT
function bbcOptionManager(optionBuffer)
	{
	this.iframe = document.getElementById(iframe_id);
	this.page = this.iframe.contentDocument;
	this.listbox = document.getElementById(listbox_id);
	this.dialog = document.getElementById(dialog_id);
	this.textboxList = new Array();
	this.checkboxList = new Array();
	this.radiogroupList = new Array();
	this.listboxList = new Array();
	this.menulistList = new Array();
	this.optionBuffer = optionBuffer;
	};
	bbcOptionManager.prototype.changePage = function ()
		{
		this.storePage();
		this.iframe.setAttribute("src", this.listbox.selectedItem.getAttribute("value"));
		}
	bbcOptionManager.prototype.closeDialog = function ()
		{
		this.storePage();
		this.optionBuffer.saveOptions();
		}
	bbcOptionManager.prototype.initPage = function ()
		{
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
				if(currentValues.length == nbCols)
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
	bbcOptionManager.prototype.storePage = function ()
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