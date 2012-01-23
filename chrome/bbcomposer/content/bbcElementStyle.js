function bbcElementStyle(string)
	{
	this.names = new Array();
	this.values = new Array();
	if(string)
		this.addCSS(string);
	};
	bbcElementStyle.prototype.setProperty = function (name, value)
		{
		if(this.propertyIsset(name))
			this.values[this.getPropertyIndex(name)] = value;
		else
			{
			this.names[this.names.length] = name;
			this.values[this.values.length] = value;
			}
		}
	bbcElementStyle.prototype.getProperty = function (name)
		{
		if(this.propertyIsset(name))
			return this.values[this.getPropertyIndex(name)];
		else
			return '';
		}
	bbcElementStyle.prototype.getPropertyAtIndex = function (i)
		{
		if(this.names[i]) { return this.names[i]; }
		return '';
		}
	bbcElementStyle.prototype.getPropertyIndex = function (name)
		{
		var x = this.names.length;
		for (var i=0; i<x; i++)
			if(this.names[i]==name) { return i; }
		return -1;
		}
	bbcElementStyle.prototype.propertyIsset = function (name)
		{
		if(this.getPropertyIndex(name)>=0)
			return true;
		return false;
		}
	bbcElementStyle.prototype.getCSS = function ()
		{
		var x = this.names.length;
		var string = '';
		for(var i=0; i<x; i++)
			{
			if(this.values[i])
				string += this.names[i] + ': ' + this.values[i] + '; ';
			}
		return string.trim();
		}
	bbcElementStyle.prototype.setCSS = function (string)
		{
		this.names = new Array();
		this.values = new Array();
		this.addCSS(string);
		}
	bbcElementStyle.prototype.addCSS = function (string)
		{
		var properties = string.split(';');
		var x = properties.length;
		for(var i=0; i<x; i++)
			{
			var name = properties[i].replace(/([a-z\-]+):(?:.+)/, '$1', 'i').replace(/(?:[ ]*)(.+)(?:[ ]*)/, '$1', 'i');
			var value = properties[i].replace(/(?:[a-z\-]+):(.+)/, '$1', 'i').replace(/(?:[ ]*)(.+)(?:[ ]*)/, '$1', 'i');
			if(value!=""&&!(/(.+):(.+)/.test(value)))
				{
				if(name=="margin"||name=="padding")
					{
					if(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/.test(value))
						{
						this.setProperty(name+'-top', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$1$2', 'i'));
						this.setProperty(name+'-right', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$3$4', 'i'));
						this.setProperty(name+'-bottom', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$5$6', 'i'));
						this.setProperty(name+'-left', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$7$8', 'i'));
						}
					else if(/([0-9]+)([ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/.test(value))
						{
						this.setProperty(name+'-top', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$1$2', 'i'));
						this.setProperty(name+'-right', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$3$4', 'i'));
						this.setProperty(name+'-bottom', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$1$2', 'i'));
						this.setProperty(name+'-left', value.replace(/([0-9]+)(?:[ ]*)(px|pt|%)(?:[ ]*)([0-9]+)(?:[ ]*)(px|pt|%)/, '$3$4', 'i'));
						}
					else
						{
						if(!/([0-9]+)(?:[ ]*)(px|pt|%)/.test(value))
							value="";
						this.setProperty(name+'-top', value);
						this.setProperty(name+'-right', value);
						this.setProperty(name+'-bottom', value);
						this.setProperty(name+'-left', value);
						}
					}
				else if(name=="font")
					{
					if(/(caption|icon|menu|message-box|small-caption|status-bar)/i.test(value))
						{
						this.setProperty('font-family', value);
						}
					else if(/(.*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger|(([0-9]+)([ ]*)(px|pt|em|%)))(.+)/i.test(value))
						{
						if(/([a-z0-9 -]*)([0-9]+)([ ]*)(px|pt|em|%)\/([0-9]+)([ ]*)(px|pt|em|%)([ ]*)([a-z ,-]+)/i.test(value))
							{
							this.setProperty('font-family', value.replace(/(?:(([a-z0-9 -]*)([0-9]+)([ ]*)(px|pt|em|%)\/([0-9]+)([ ]*)(px|pt|em|%)([ ]*)))([a-z ,-]+)/,'$1','i'));
							this.setProperty('font-size', value.replace(/(?:[a-z0-9 -]*)(([0-9]+)(?:[ ]*)(px|pt|em|%))\/(?:(([0-9]+)([ ]*)(px|pt|em|%)([ ]*)([a-z ,-]+)))/,'$1','i'));
							this.setProperty('line-height', value.replace(/(?:[a-z0-9 -]*)(?:(([0-9]+)(?:[ ]*)(px|pt|em|%)))\/(([0-9]+)([ ]*)(px|pt|em|%)([ ]*))(?:[a-z ,-]+)/,'$1','i'));
							}
						else if(/([a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)\/([0-9]+)([ ]*)(px|pt|em|%)([ ]*)([a-z ,-]+)/i.test(value))
							{
							this.setProperty('font-family', value.replace(/(?:(([a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)\/([0-9]+)([ ]*)(px|pt|em|%)([ ]*)))([a-z ,-]+)/, '$1', 'i'));
							this.setProperty('font-size', value.replace(/(?:[a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)\/(?:(([0-9]+)([ ]*)(px|pt|em|%)([ ]*)([a-z ,-]+)))/, '$1', 'i'));
							this.setProperty('line-height', value.replace(/(?:(([a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)\/))(([0-9]+)([ ]*)(px|pt|em|%))(?:(([ ]*)([a-z ,-]+)))/, '$1', 'i'));
							}
						else if(/([a-z0-9 -]*)(([0-9]+)([ ]*)(px|pt|em|%))([ ]*)([a-z ,-]+)/i.test(value))
							{
							this.setProperty('font-family', value.replace(/(?:[a-z0-9 -]*)(?:([0-9]+)(?:[ ]*)(px|pt|em|%))(?:[ ]*)([a-z ,-]+)/, '$1', 'i'));
							this.setProperty('font-size', value.replace(/(?:[a-z0-9 -]*)(([0-9]+)(?:[ ]*)(px|pt|em|%))(?:[ ]*)(?:[a-z ,-]+)/, '$1', 'i'));
							}
						else if(/([a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)([ ]*)([a-z ,-]+)/i.test(value))
							{
							this.setProperty('font-family', value.replace(/(?:(([a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)([ ]*)))([a-z ,-]+)/, '$1', 'i'));
							this.setProperty('font-size', value.replace(/(?:[a-z0-9 -]*)(xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger)(?:[ ]*)(?:[a-z ,-]+)/, '$1', 'i'));
							}
						if(/(normal|italic|oblique)(.+)/i.test(value))
							this.setProperty('font-style', value.replace(/(normal|italic|oblique)(?:.+)/, '$1', 'i'));
						if(/(.*)(normal|small-caps)(.+)/i.test(value))
							this.setProperty('font-variant', value.replace(/(?:.*)(normal|small-caps)(?:.+)/, '$1', 'i'));
						if(/(.*)(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)(.+)/i.test(value))
							this.setProperty('font-weight', value.replace(/(?:.*)(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)(?:.+)/, '$1', 'i'));
						}
					else if(/([a-z ,-]+)/i.test(value))
						{
						this.setProperty('font-family', value);
						}
					}
				else if(name=="border")
					{
					if(/(([0-9]+)(?:[ ]*)(px|pt)|thin|medium|thick)(?:[ ]*)(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)(?:[ ]*)(#([0-9a-f]{1,6})|rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\))/i.test(value))
						{
						this.setProperty('border-width',value.replace(/(([0-9]+)(?:[ ]*)(px|pt)|thin|medium|thick)(?:.+)/, '$1' ,'i' ));
						this.setProperty('border-style',value.replace(/(?:.+)(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)(?:.+)/, '$1' ,'i' ));
						this.setProperty('border-color',value.replace(/(?:.+)(#([0-9a-f]{1,6})|rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\))/, '$1' ,'i' ));
						}
					}
				else
					{
					this.setProperty(name, value);
					}
				}
			}
		}