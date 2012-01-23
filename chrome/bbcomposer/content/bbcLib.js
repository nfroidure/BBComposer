var bbcUtils =
	{
	/* Functions set for BBComposer */
	doRegExp : function (string, regExp, pattern)
		{
		while(regExp.test(string))
			string = string.replace(regExp, pattern);
		return string;
		},
	dec2hex : function (dec)
		{
		var hex = '0123456789ABCDEF'.substr(dec&15,1);
		while(dec>15) {dec>>=4;hex='0123456789ABCDEF'.substr(dec&15,1)+hex;}
		return hex;
		},
	hex2dec : function (hex)
		{
		return parseInt(hex,16);
		},
	rvb2hex : function (rgb)
		{
		if(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/.test(rgb))
			{
			var r = bbcUtils.dec2hex(rgb.replace(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/, '$1'));
			if(r.length<2)
				r = '0' + r;
			var g = bbcUtils.dec2hex(rgb.replace(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/, '$2'));
			if(g.length<2)
				g = '0' + g;
			var b = bbcUtils.dec2hex(rgb.replace(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/, '$3'));
			if(b.length<2)
				b = '0' + b;
			return '#' + r + g + b;
			}
		else
			return '#000000';
		},
	indentHTML : function (string)
		{
		var j = 0;
		var currentTag="";
		var currentIndent = "";
		var currentLineLength = 0;
		while(/(\r?\n)/m.test(string))
			string = string.replace(/(\r?\n)/, ' ', 'gm');
		string = string.replace('\t', ' ', 'g');
		while(/( )([ ]+)/m.test(string))
			string = string.replace(/( )([ ]+)/, ' ', 'g');
		for(var i=0; i<string.length; i++)
			{
			currentTag=""
			if(string.charAt(i)=='<')
				{
				if(string.charAt(i+1)!='/')
					{
					j = 1;
					while(string.charAt(i+j)!='>'&&string.charAt(i+j)!=' '&&j<string.length)
						{
						currentTag += string.charAt(i+j);
						j++;
						}
					if(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]
					&&(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']=='block'
					||myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']=='list-item'))
						{
						string = string.substring(0, i) + '\r\n' + currentIndent + string.substring(i, string.length);
						if(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']!='list-item')
							currentIndent+="	";
						while(string.charAt(i)!='>'&&string.charAt(i)!='/'&&i<string.length)
							i++;
						if(string.charAt(i)=='/')
							{
							currentIndent=currentIndent.substring(0, currentIndent.length-1);
							i++;
							}
						if(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']!='list-item')
							string = string.substring(0, i+1) + '\r\n' + currentIndent + string.substring(i+1, string.length);
						currentLineLength = 0;
						}
					else
						{
						while(string.charAt(i)!='>'&&string.charAt(i)!=' '&&i<string.length)
							i++;
						if(string.charAt(i)==' ')
							i--;
						}
					}
				else
					{
					j = 2;
					while(string.charAt(i+j)!='>'&&j<string.length)
						{
						currentTag += string.charAt(i+j);
						j++;
						}
					if(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]
					&&(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']=='block'
					||myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']=='list-item'))
						{
						if(myBBComposerManager.focusedBBComposer.bbcLanguageSupport.acceptedMarkups[currentTag]['type']!='list-item')
							{
							string = string.substring(0, i) + '\r\n' + string.substring(i, string.length);
							currentIndent=currentIndent.substring(0, currentIndent.length-1);
							}
						while(string.charAt(i)!='>'&&i<string.length)
							i++;
						string = string.substring(0, i+1) + '\r\n' + currentIndent + string.substring(i+1, string.length);
						currentLineLength = 0;
						}
					else
						while(string.charAt(i)!='>'&&i<string.length)
							i++;
					}
				}
			else if(currentLineLength>50)
				{
				var k=0;
				while(string.charAt(i)!=' '&&string.charAt(i)!='\n'&&string.charAt(i)!='\r'&&i>0&&k<=50)
					{ i--; k++; }
				if(k>=50)
					{
					i=i+k;
					currentLineLength=0;
					}
				else if(string.charAt(i)!='\n'&&string.charAt(i)!='\r')
					{
					string = string.substring(0, i) + '\r\n' + currentIndent + string.substring(i+1, string.length);
					currentLineLength=0;
					}
				}
			currentLineLength++;
			}
		while(/(\r?\n)([ \t]*)(\r?\n)/m.test(string))
			string = string.replace(/(\r?\n)([ \t]*)(\r?\n)/, '\r\n', 'gm');
		if(string.charAt(string.length-1)=='\n'&&string.charAt(string.length-2)=='\r')
			string = string.substring(0, string.length-2);
		if(string.charAt(1)=='\n'&&string.charAt(0)=='\r')
			string = string.substring(2);
		return string;
		},
	nonASCII2HTMLEntities : function (string)
		{
		for(var i=0; i<string.length; i++)
			{
			if(string.charCodeAt(i)>127)
				{
				string=string.replace(new RegExp(string.charAt(i), "g"), "&#" + string.charCodeAt(i) + ";");
				}
			}
		return string;
		},
	replaceElementByTextNodes : function (element, beforeText, afterText)
		{
		element.parentNode.insertBefore(element.ownerDocument.createTextNode(beforeText), element);
		var afterNode = element.ownerDocument.createTextNode(afterText);
		if(element.nextSibling)
			element.parentNode.insertBefore(afterNode, element.nextSibling);
		else
			element.parentNode.appendChild(afterNode);
		while(element.hasChildNodes())
			element.parentNode.insertBefore(element.childNodes[0], afterNode);
		element.parentNode.removeChild(element);
		}
	}