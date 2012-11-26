var bbcXbbcodeSupport =
	{
	/* User Interface */
	allowedButtons : new Array('blocks', 'fonts', 'color', 'br', 'undo', 'redo', 'font-size-increase', 'font-size-decrease', 'margin-top-increase', 'margin-top-decrease', 'margin-right-increase', 'margin-right-decrease', 'margin-bottom-increase', 'margin-bottom-decrease', 'margin-left-increase', 'margin-left-decrease', 'float-left', 'float-right', 'align-left', 'align-center', 'align-right', 'align-justify', 'direction-ltr', 'direction-rtl', 'cleancss', 'attclass', 'attlang', 'indent', 'deindent', 'em', 'strong', 'q', 'cite', 'del', 'ins', 'dfn', 'a', 'img', 'table', 'kbd', 'samp', 'var', 'anchor', 'span', 'sub', 'sup', 'code', 'hr', 'acronym', 'abbr', 'blockquote', 'div'),
	allowedBlocks : new Array('p','h1','h2','h3','h4','h5','h6','ul','ol','dl','pre','address'),
	allowedToolbars : bbcXhtmlSupport.allowedToolbars,
	displayedToolbars : bbcXhtmlSupport.displayedToolbars,
	allowedSidebars : bbcXhtmlSupport.allowedSidebars,
	/* Language */
	sourceToEditor : function (string)
		{
		string = string.replace('[[', '&#91;', 'g');
		string = string.replace(']]', '&#93;', 'g');
		string = string.replace('"', '&quot;', 'g');
		string = bbcUtils.doRegExp(string, /\[([^\]]+) ([a-z0-9]+)=([^="\]]+) ([^\s][a-z0-9]+)=(.)/mg, '[$1 $2="$3" $4=$5');
		string = bbcUtils.doRegExp(string, /\[([^\]]+) ([a-z0-9]+)=([^="\]]+) \/\]/mg, '[$1 $2="$3" /]');
		string = bbcUtils.doRegExp(string, /\[([^\]]+) ([a-z0-9]+)=([^="\]]+)\]/mg, '[$1 $2="$3"]');
		string = string.replace('>', '&gt;', 'g');
		string = string.replace('<', '&lt;', 'g');
		string = bbcUtils.doRegExp(string, /\[([\/]?)([a-z]+)([0-9]{0,1})([ ]?)([^\]]*)\]/mg, '<$1$2$3$4$5>');
		//string = string.replace(']', '>', 'g');
		//string = string.replace('[', '<', 'g');
		string = bbcXhtmlSupport.sourceToEditor(string);
		return string;
		},
	editorToSource : function (editor)
		{
		var string = bbcXhtmlSupport.editorToSource(editor);
		string = string.replace('[', '[[', 'g');
		string = string.replace(']', ']] ', 'g');
		string = string.replace('&#91;', '[[', 'g');
		string = string.replace('&#93;', ']]', 'g');
		string = bbcUtils.doRegExp(string, /\<([^\>]+)"([^\>]*)\>/mg, '<$1$2>');
		string = bbcUtils.doRegExp(string, /\<([^>]+)"([^>]*)\>/mg, '<$1$2>'); // Strange bug
		string = string.replace('<', '[', 'g');
		string = string.replace('>', ']', 'g');
		string = string.replace('&quot;', '"', 'g');
		string = string.replace('&nbsp;', ' ', 'g');
		string = string.replace('&amp;', '&', 'g');
		string = string.replace('&gt;', '>', 'g');
		string = string.replace('&lt;', '<', 'g');
		return string;
		},
	inlineMarkups : bbcXhtmlSupport.inlineMarkups,
	blockMarkups : bbcXhtmlSupport.blockMarkups,
	superblockMarkups : bbcXhtmlSupport.superblockMarkups,
	acceptedMarkups : bbcXhtmlSupport.acceptedMarkups
	};
