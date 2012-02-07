var bbcXhtmlSupport =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'fonts', 'color', 'br', 'undo', 'redo', 'font-size-increase', 'font-size-decrease', 'align-left', 'align-center', 'align-right', 'align-justify', 'direction-ltr', 'direction-rtl', 'cleancss', 'attclass', 'attlang', 'indent', 'deindent', 'em', 'strong', 'q', 'cite', 'del', 'ins', 'dfn', 'a', 'img', 'table', 'kbd', 'samp', 'var', 'anchor', 'span', 'sub', 'sup', 'code', 'hr', 'acronym', 'abbr', 'blockquote', 'div'),
	allowedBlocks : new Array('p','h1','h2','h3','h4','h5','h6','ul','ol','dl','pre','address'),
	allowedToolbars : new Array('edition','css'),
	displayedToolbars : new Array('edition','css'),
	allowedSidebars : new Array('css', 'degradx', 'gallery', 'smileys', 'cartoon', 'tags', 'canimage'),
	/* Language */
	sourceToEditor : function (string)
		{
		string = bbcUtils.doRegExp(string, />(?:[\r\n\t]+)</mg, '><');
		string = bbcUtils.doRegExp(string, /(?:[\r\n\t\s]{1}[\r\n\t\s]+)/mg, ' ');
		return string;
		},
	editorToSource : function (editor)
		{
		var string = editor.innerHTML;
		string = bbcUtils.doRegExp(string, /(?:[ ]*)(?:[a-z0-9]+)=""/mg, '');
		string = bbcUtils.doRegExp(string, /<a>([^<]+)<\/a>/mg, '$1');
		string = bbcUtils.doRegExp(string, /<img>/mg, '');
		string = bbcUtils.doRegExp(string, /<br>(?:[ \t\r\n]*)<\/([a-z0-9]+)>/g, '</$1>');
		string = string.replace('<br>', '<br />', 'g');
		string = string.replace('<hr>', '<hr />', 'g');
		string = bbcUtils.doRegExp(string, /<(img|hr|param|area)([^>]*)([^\/])>/mg, '<$1$2$3 />');
		if(myBBComposerManager.focusedBBComposer.language=='xhtml')
			{
			if(myBBComposerManager.myBBComposerPreferences.getBoolOption('xhtml.indent'))
				string = bbcUtils.indentHTML(string);
			if(myBBComposerManager.myBBComposerPreferences.getBoolOption('xhtml.ascii'))
				string = bbcUtils.nonASCII2HTMLEntities(string);
			}
		return string;
		},
	inlineMarkups : new Array('a', 'abbr', 'acronym', 'b', 'br', 'cite', 'code', 'del', 'ins', 'dfn',
	 'em', 'i', 'img', 'ins', 'kbd', 'label', 'map', 'object', 'param', 'q', 'samp', 'script', 'select',
	 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'tt', 'var'),
	blockMarkups : new Array('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'p', 'ul', 'dl', 'ol', 'address', 'pre', 'map', 'table', 'script'),
	superblockMarkups : new Array('blockquote', 'div', 'ins', 'del', 'noscript')
	};
bbcXhtmlSupport.blockLevelMarkups = [].concat(bbcXhtmlSupport.blockMarkups,bbcXhtmlSupport.superblockMarkups);
bbcXhtmlSupport.acceptedMarkups =
	{
	// Superblock
	"body":
		{"type":"superblock","childs":bbcXhtmlSupport.blockLevelMarkups},
	"blockquote":
		{"type":"superblock","childs":bbcXhtmlSupport.blockLevelMarkups,"attributes":[{"name":"cite","default":"http://"},{"name":"title","default":""}]},
	"div":
		{"type":"superblock","childs":bbcXhtmlSupport.blockLevelMarkups},
	// Block
	"h1":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"h2":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"h3":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"h4":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"h5":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"h6":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"hr":
		{"type":"block","childs":[]},
	"p":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"pre":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"address":
		{"type":"block","childs":bbcXhtmlSupport.inlineMarkups},
	"ul":
		{"type":"block","childs":['li']},
	"ol":
		{"type":"block","childs":['li']},
	"dl":
		{"type":"block","childs":['dt','dd']},
	// Mixed
	"ins":
		{"type":"mixed","childs":bbcXhtmlSupport.blockLevelMarkups.concat(bbcXhtmlSupport.inlineMarkups)
		//,"attributes":["name":"cite","default":"http://","name":"datetime","default":""]}
		},
	"del":
		{"type":"mixed","childs":bbcXhtmlSupport.blockLevelMarkups.concat(bbcXhtmlSupport.inlineMarkups)
		//,"attributes":["name":"cite","default":"http://","name":"datetime","default":""]}
		},
	// Listitems
	"li":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcXhtmlSupport.inlineMarkups)},
	"dt":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcXhtmlSupport.inlineMarkups)},
	"dd":
		{"type":"list-item","childs":['ul','ol','dl'].concat(bbcXhtmlSupport.inlineMarkups)},
	// Inline
	"u":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"i":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"b":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"em":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"tt":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"acronym":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"needed"}]},
	"abbr":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"needed"}]},
	"cite":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"strong":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"q":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"cite","default":""},{"name":"title","default":""}]},
	"br":
		{"type":"inline","childs":[]},
	"a":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"onclick","default":""},{"name":"href","default":"http://","type":"needed"},{"name":"title","default":"","type":"pleased"},{"name":"hreflang","default":""},{"name":"rel","default":""},{"name":"rev","default":""}]},
	"img":
		{"type":"inline","childs":[],"attributes":[{"name":"src","default":"","type":"needed"},{"name":"alt","default":"","type":"pleased"},{"name":"name","default":""},{"name":"usemap","default":""},{"name":"style","default":""}]},
	"sub":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"sup":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"var":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"code":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"kbd":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"dfn":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	"span":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"title","default":""}]},
	"samp":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups},
	// Table
	"table":
		{"type":"block","childs":['caption', 'thead', 'tfoot', 'tbody', 'tr', 'col', 'colgroup'],"attributes":[{"name":"summary","default":""}]},
	"caption":
		{"type":"table-caption","childs":bbcXhtmlSupport.inlineMarkups},
	"thead":
		{"type":"table-header-group","childs":['tr']},
	"tfoot":
		{"type":"table-footer-group","childs":['tr']},
	"tbody":
		{"type":"table-body-group","childs":['tr']},
	"tr":
		{"type":"table-row","childs":['th', 'td']},
	"td":
		{"type":"table-cell","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"scope","default":""}]},
	"th":
		{"type":"table-cell","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"scope","default":""}]},
	"colgroup":
		{"type":"table-column-group","childs":['col']},
	"col":
		{"type":"table-column","childs":[]},
	// Map
	"map":
		{"type":"block","childs":['area'],"attributes":[{"name":"name","default":""}]},
	"area":
		{"type":"inline","childs":[],"attributes":[{"name":"shape","default":"rect"},{"name":"coords","default":""},{"name":"href","default":"http://"},{"name":"alt","default":""},{"name":"title","default":""}]},
	// Script
	"script":
		{"type":"block","childs":[],"attributes":[{"name":"type","default":"text/javascript"},{"name":"src","default":"http://"}]},
	"noscript":
		{"type":"superblock","childs":bbcXhtmlSupport.blockLevelMarkups},
	// Object
	"object":
		{"type":"inline","childs":bbcXhtmlSupport.blockLevelMarkups.concat('param'),"attributes":[{"name":"type","default":""},{"name":"data","default":""},{"name":"width","default":""},{"name":"height","default":""}]},
	"param":
		{"type":"inline","childs":[],"attributes":[{"name":"name","default":""},{"name":"value","default":""},{"name":"type","default":""},{"name":"valuetype","default":""}]}
	};