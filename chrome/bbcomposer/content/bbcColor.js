function bbcColor(color)
	{
	if(/([\#]?)([a-f0-9]{3,6})/i.test(color))
		{
		this.setFromHex(color);
		}
	else if(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/.test(color))
		{
		this.setRGB(color.replace(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/, '$1'),
			color.replace(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/, '$2'),
			color.replace(/rgb\(([0-9]{1,3}),(?:[ ]*)([0-9]{1,3}),(?:[ ]*)([0-9]{1,3})\)/, '$3'));
		}
	};
bbcColor.prototype.setRGB = function (r, g, b)
	{
	this.rgb = new Array(r, g, b);
	}
bbcColor.prototype.getRGB = function ()
	{
	return  'rgb(' + this.rgb[0] + ', ' + this.rgb[1] + ', ' + this.rgb[2] + ')';
	}
bbcColor.prototype.setR = function (r)
	{
	this.rgb[0]=r;
	}
bbcColor.prototype.getR = function ()
	{
	return this.rgb[0];
	}
bbcColor.prototype.setG = function (g)
	{
	this.rgb[1]=g;
	}
bbcColor.prototype.getG = function ()
	{
	return this.rgb[1];
	}
bbcColor.prototype.setB = function (b)
	{
	this.rgb[2]=b;
	}
bbcColor.prototype.getB = function ()
	{
	return this.rgb[2];
	}
bbcColor.prototype.setFromHex = function (hex)
	{
	hex = hex.replace('#','');
	if(/([a-f0-9]{6})/i.test(hex))
		hex = hex;
	else if(/([a-f0-9]{3})/i.test(color))
		hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
	else
		hex = CCCCCC;
	this.setRGB(window.parent.bbcUtils.hex2dec(hex.substr(0,2)), window.parent.bbcUtils.hex2dec(hex.substr(2,2)), window.parent.bbcUtils.hex2dec(hex.substr(4,2)))
	}
bbcColor.prototype.getHex = function ()
	{
	return 	(this.getR().length<2 ? '0' : '') + window.parent.bbcUtils.dec2hex(this.getR()) + (this.getG().length<2 ? '0' : '') + window.parent.bbcUtils.dec2hex(this.getG()) + (this.getB().length<2 ? '0' : '') + window.parent.bbcUtils.dec2hex(this.getB());
	}