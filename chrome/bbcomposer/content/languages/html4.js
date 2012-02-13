var bbcHtml4Support =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'fonts', 'color', 'br', 'undo', 'redo', 'font-size-increase', 'font-size-decrease', 'float-left', 'float-right', 'align-left', 'align-center', 'align-right', 'align-justify', 'direction-ltr', 'direction-rtl', 'cleancss', 'indent', 'deindent', 'b', 'i', 'u', 'em', 'strong', 'q', 'cite', 'del', 'dfn', 'a', 'img', 'table', 'kbd', 'samp', 'var', 'anchor', 'span', 'sub', 'sup', 'code', 'hr', 'acronym', 'abbr'),
	allowedBlocks : new Array('p','h1','h2','h3','h4','h5','h6','ul','ol','dl','pre','address'),
	allowedToolbars : bbcXhtmlSupport.allowedToolbars,
	displayedToolbars : bbcXhtmlSupport.displayedToolbars,
	allowedSidebars : bbcXhtmlSupport.allowedSidebars,
	/* Language */
	sourceToEditor : function (string)
		{
		return string;
		},
	editorToSource : function (editor)
		{
		return editor.innerHTML;
		},
	inlineMarkups : bbcXhtmlSupport.inlineMarkups,
	blockMarkups : bbcXhtmlSupport.blockMarkups,
	blockLevelMarkups : bbcXhtmlSupport.blockLevelMarkups,
	superblockMarkups : bbcXhtmlSupport.superblockMarkups,
	acceptedMarkups : bbcXhtmlSupport.acceptedMarkups
	};