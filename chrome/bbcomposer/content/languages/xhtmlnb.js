var bbcXhtmlnbSupport =
	{
	/* User Interface */
	allowedButtons : new Array('br', 'undo', 'redo', 'b', 'i', 'u', 'em', 'strong', 'q', 'cite', 'del', 'ins', 'dfn', 'a', 'img', 'kbd', 'samp', 'var', 'anchor', 'span', 'sub', 'sup', 'code', 'acronym', 'abbr'),
	allowedBlocks : new Array(),
	allowedToolbars : new Array('edition'),
	displayedToolbars : new Array('edition'),
	allowedSidebars : new Array('css','degradx', 'gallery', 'smileys', 'cartoon', 'tags', 'canimage'),
	/* Language */
	sourceToEditor : function (string)
		{
		string = '<p>' + string + '</p>';
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)/mg, '</p><p>');
		string = bbcUtils.doRegExp(string, /(\r?\n)/mg, '<br>');
		string = bbcXhtmlSupport.sourceToEditor(string);
		return string;
		},
	editorToSource : function (editor)
		{
		var string = editor.innerHTML;
		// Transformation en xhtml
		string = bbcUtils.doRegExp(string, /(?:[ ]*)(?:[a-z0-9]+)=""/mg, '');
		string = bbcUtils.doRegExp(string, /<a>([^<]+)<\/a>/mg, '$1');
		string = bbcUtils.doRegExp(string, /<img>/mg, '');
		string = bbcUtils.doRegExp(string, /<img([^>]*)([^\/])>/mg, '<img$1$2 />');
		string = bbcUtils.doRegExp(string, /<([^<>\/]+)>(?:[\t\r\n]*)<\/([^>]+)>/mg, '');
		// Mise en page
		string = string.replace('</p><p>', '\r\n\r\n', 'g');
		string = string.replace('<br>', '\r\n', 'g');
		string = string.replace('</p>', '\r\n', 'g');
		string = string.replace('<p>', '\r\n', 'g');
		//  Konshita
		string = bbcUtils.doRegExp(string, /(\r?\n)(\r?\n)(\r?\n)/mg, '\r\n\r\n');
		string = string.replace(/^\s+|\s+$/g, '')
		string = string.replace('&nbsp;', ' ', 'g');
		string = string.replace('&amp;', '&', 'g');
		string = string.replace('&gt;', '>', 'g');
		string = string.replace('&lt;', '<', 'g');
		return string;
		},
	inlineMarkups : new Array('br', 'b', 'i', 'u', 'em', 'strong', 'q', 'cite', 'del', 'ins', 'dfn', 'a', 'img', 'kbd', 'samp', 'var', 'span', 'sub', 'sup', 'code', 'acronym', 'abbr'),
	blockMarkups : new Array('p'),
	superblockMarkups : new Array()
	};

bbcXhtmlnbSupport.acceptedMarkups =
	{
	// Superblock
	"body":
		{"type":"superblock","childs":bbcXhtmlnbSupport.blockMarkups},
	// Block
	"p":
		{"type":"block","childs":bbcXhtmlnbSupport.inlineMarkups},
	// Inline
	"u":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"i":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"b":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"em":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"tt":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"acronym":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"pleased"}]},
	"abbr":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups,"attributes":[{"name":"title","default":"","type":"pleased"}]},
	"cite":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"strong":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"q":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"br":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"a":
		{"type":"inline","childs":bbcXhtmlSupport.inlineMarkups,"attributes":[{"name":"onclick","default":""},{"name":"href","default":"http://","type":"needed"},{"name":"title","default":"","type":"pleased"},{"name":"hreflang","default":""},{"name":"rel","default":""},{"name":"rev","default":""}]},
	"img":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups,"attributes":[{"name":"src","default":"","type":"needed"},{"name":"alt","default":"","type":"pleased"},{"name":"style","default":""}]},
	"sub":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"sup":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"var":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"code":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"kbd":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"dfn":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"span":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups},
	"samp":
		{"type":"inline","childs":bbcXhtmlnbSupport.inlineMarkups}
	}