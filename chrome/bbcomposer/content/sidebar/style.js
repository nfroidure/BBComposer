(function()
	{
	function StyleManager()
		{
		this.loadHandler=ewkLib.newEventHandler(this,this.load);
		window.addEventListener('load', this.loadHandler, false);
		};

	StyleManager.prototype.load = function ()
		{
		window.removeEventListener('load', this.loadHandler, false);
		var evt = window.parent.document.createEvent('Events');
		evt.initEvent('sidebarload', true, true);
		evt.sidebarWindow=this;
		evt.sidebarName='css';
		if(window.parent)
			window.parent.dispatchEvent(evt);
		}

	StyleManager.prototype.run = function (editorManager)
		{
		this.editorManager=editorManager;
		this.unLoadHandler=ewkLib.newEventHandler(this,this.unLoad);
		window.addEventListener('unload', this.unLoadHandler, false);
		this.displayHandler=ewkLib.newEventHandler(this,this.display);
		document.addEventListener('display', this.displayHandler, false);
		this.lockOnMenu=document.getElementById('bbcomposer-lockon-menu');
		this.displayHandler=ewkLib.newEventHandler(this,this.display);
		this.lockOnMenu.addEventListener('command', this.displayHandler, false);
		document.getElementById('bbcomposer-cancel-button').addEventListener('command', this.displayHandler, false);
		this.applyHandler=ewkLib.newEventHandler(this,this.apply);
		document.getElementById('bbcomposer-apply-button').addEventListener('command', this.applyHandler, false);
		this.resetHandler=ewkLib.newEventHandler(this,this.reset);
		document.getElementById('bbcomposer-reset-button').addEventListener('command', this.resetHandler, false);
		this.setPropertyHandler=ewkLib.newEventHandler(this,this.setProperty);
		document.getElementById('font-family-button').addEventListener('command', this.setPropertyHandler, false);
		document.getElementById('font-size-button').addEventListener('command', this.setPropertyHandler, false);
		document.getElementById('background-image-button').addEventListener('command', this.setPropertyHandler, false);
		document.getElementById('background-position-button').addEventListener('command', this.setPropertyHandler, false);
		this.setSizeHandler=ewkLib.newEventHandler(this,this.setSize);
		document.getElementById('border-width-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('line-height-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('text-indent-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('word-spacing-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('letter-spacing-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('text-shadow-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('padding-top-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('padding-right-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('padding-bottom-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('padding-left-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('margin-top-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('margin-right-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('margin-bottom-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('margin-left-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('width-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('height-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('top-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('right-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('bottom-button').addEventListener('command', this.setSizeHandler, false);
		document.getElementById('left-button').addEventListener('command', this.setSizeHandler, false);
		this.setSizesHandler=ewkLib.newEventHandler(this,this.setSizes);
		document.getElementById('padding-button').addEventListener('command', this.setSizesHandler, false);
		document.getElementById('margin-button').addEventListener('command', this.setSizesHandler, false);
		this.display();
		}

	StyleManager.prototype.display = function (hEvent)
		{
		this.getElementStyle(this.lockOnMenu.value);
		}

	StyleManager.prototype.apply = function ()
		{
		this.editorManager.focusedBBComposer.setElementStyle(this.lockOnMenu.value);
		}

	StyleManager.prototype.reset = function ()
		{
		this.editorManager.focusedBBComposer.resetElementStyle(this.lockOnMenu.value);
		}

	StyleManager.prototype.getElementStyle = function (type)
		{
		this.editorManager.focusedBBComposer.getElementStyle(type);
		}

	StyleManager.prototype.openPropertyDialog = function (file, value)
		{
		var params = {inn:{property:value}, out:null};
		window.openDialog(file, "", "chrome, dialog, modal, resizable=no", params).focus();
		if(params.out&&params.out.property)
		{
		return params.out.property;
		}
		else
		return false;
		}

	StyleManager.prototype.setProperty = function (event)
		{
		var property=event.target.getAttribute('id').replace('-button','');
		var element=document.getElementById(property);
		var value = this.openPropertyDialog("chrome://bbcomposer/content/style/"+property+".xul", element.value);
		if(value)
			element.value = value;
		}

	StyleManager.prototype.setSize = function (event)
		{
		var property=event.target.getAttribute('id').replace('-button','');
		var element=document.getElementById(property);
		var value = this.openPropertyDialog("chrome://bbcomposer/content/style/size.xul", element.value)
		if(value)
			element.value = value;
		}

	StyleManager.prototype.setSizes = function (event)
		{
		var property=event.target.getAttribute('id').replace('-button','');
		var size = this.openPropertyDialog("chrome://bbcomposer/content/style/size.xul", "");
		if(size)
			{
			document.getElementById(property + "-left").value = size;
			document.getElementById(property + "-right").value = size;
			document.getElementById(property + "-top").value = size;
			document.getElementById(property + "-bottom").value = size;
			}
		}

	StyleManager.prototype.unLoad = function ()
		{
		window.removeEventListener('unload', this.unLoadHandler, false);
		this.editorManager.toggleSidebar('css',false);
		}

	new StyleManager();
	})();