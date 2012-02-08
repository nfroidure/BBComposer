function AnchorManager()
	{
	this.loadHandler=ewkLib.newEventHandler(this,this.load);
	window.addEventListener('load', this.loadHandler, false);
	};

AnchorManager.prototype.load = function ()
		{
		document.removeEventListener('load', this.loadHandler, false);
		if(window.parent.myBBComposerManager.toggleSidebar('anchors', true))
			{
			this.unLoadHandler=ewkLib.newEventHandler(this,this.unLoad);
			document.addEventListener('unload', this.unLoadHandler, false);
			this.displayHandler=ewkLib.newEventHandler(this,this.display);
			document.addEventListener('display', this.displayHandler, false);
			this.listbox=document.getElementById('anchors-list');
			this.selectHandler=ewkLib.newEventHandler(this,this.focus);
			this.listbox.addEventListener('select', this.selectHandler, false);
			this.display();
			}
		}

AnchorManager.prototype.display = function ()
		{
		while(this.listbox.firstChild)
			this.listbox.removeChild(this.listbox.firstChild);
		var treeWalker = window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.createTreeWalker(
			window.parent.myBBComposerManager.focusedBBComposer.editor.contentDocument.body,
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
		window.parent.myBBComposerManager.focusedBBComposer.setSelectedNode(this.anchors[event.target.selectedItem.getAttribute('label')].node);
		}

AnchorManager.prototype.unLoad = function ()
		{
		document.removeEventListener('unload', this.unLoadHandler, false);
		window.parent.myBBComposerManager.toggleSidebar('anchors',false);
		}

new AnchorManager();