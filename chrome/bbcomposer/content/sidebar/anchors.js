(function ()
	{
	function AnchorManager()
		{
		this.loadHandler=ewkLib.newEventHandler(this,this.load);
		window.addEventListener('load', this.loadHandler, false);
		};

	AnchorManager.prototype.load = function ()
		{
		window.removeEventListener('load', this.loadHandler, false);
		var evt = window.parent.document.createEvent('Events');
		evt.initEvent('sidebarload', true, true);
		evt.sidebarWindow=this;
		evt.sidebarName='anchors';
		if(window.parent)
			window.parent.dispatchEvent(evt);
		}

	AnchorManager.prototype.run = function (editorManager)
		{
		this.editorManager=editorManager;
		this.unLoadHandler=ewkLib.newEventHandler(this,this.unLoad);
		window.addEventListener('unload', this.unLoadHandler, false);
		this.displayHandler=ewkLib.newEventHandler(this,this.display);
		document.addEventListener('display', this.displayHandler, false);
		this.listbox=document.getElementById('anchors-list');
		this.selectHandler=ewkLib.newEventHandler(this,this.focus);
		this.listbox.addEventListener('select', this.selectHandler, false);
		this.display();
		}

	AnchorManager.prototype.display = function (event)
		{
		while(this.listbox.firstChild)
			this.listbox.removeChild(this.listbox.firstChild);
		var treeWalker = this.editorManager.focusedBBComposer.editor.contentDocument.createTreeWalker(
			this.editorManager.focusedBBComposer.editor.contentDocument.body,
			NodeFilter.SHOW_ELEMENT,
			{ acceptNode: function(node) { return (node.hasAttribute('id')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP); } },
			false);
		this.anchors = [];
		while(treeWalker.nextNode())
			{
			var id=treeWalker.currentNode.getAttribute('id');
			this.anchors[id]={'id':id,'node':treeWalker.currentNode};
			var listitem=document.createElement('listitem');
			listitem.setAttribute('label',id);
			this.listbox.appendChild(listitem);
			}
		}

	AnchorManager.prototype.focus = function (event)
		{
		this.editorManager.focusedBBComposer.setSelectedNode(this.anchors[event.target.selectedItem.getAttribute('label')].node);
		}

	AnchorManager.prototype.unLoad = function ()
		{
		window.removeEventListener('unload', this.unLoadHandler, false);
		var evt = window.parent.document.createEvent('Events');
		evt.initEvent('sidebarunload', true, true);
		evt.sidebarWindow=this;
		evt.sidebarName='anchors';
		evt.standAlone=true;
		if(window.parent)
			window.parent.dispatchEvent(evt);
		}

	new AnchorManager();
	})();