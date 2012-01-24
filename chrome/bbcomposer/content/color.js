function dec2hex(dec)
	{
	var hex = '0123456789ABCDEF'.substr(dec&15,1);var hexChars = '0123456789ABCDEF';
	while(dec>15) {dec>>=4;hex='0123456789ABCDEF'.substr(dec&15,1)+hex;}
	return hex;
	}
function hex2dec(hex)
	{
	return parseInt(hex,16);
	}

function color(color)
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
color.prototype.setRGB = function (r, g, b)
	{
	this.rgb = new Array(r, g, b);
	}
color.prototype.getRGB = function ()
	{
	return  'rgb(' + this.rgb[0] + ', ' + this.rgb[1] + ', ' + this.rgb[2] + ')';
	}
color.prototype.setR = function (r)
	{
	this.rgb[0]=r;
	}
color.prototype.getR = function ()
	{
	return this.rgb[0];
	}
color.prototype.setG = function (g)
	{
	this.rgb[1]=g;
	}
color.prototype.getG = function ()
	{
	return this.rgb[1];
	}
color.prototype.setB = function (b)
	{
	this.rgb[2]=b;
	}
color.prototype.getB = function ()
	{
	return this.rgb[2];
	}
color.prototype.setFromHex = function (hex)
	{
	hex = hex.replace('#','');
	if(/([a-f0-9]{6})/i.test(hex))
		hex = hex;
	else if(/([a-f0-9]{3})/i.test(color))
		hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
	else
		hex = CCCCCC;
	this.setRGB(hex2dec(hex.substr(0,2)), hex2dec(hex.substr(2,2)), hex2dec(hex.substr(4,2)))
	}
color.prototype.getHex = function ()
	{
	return 	(this.getR().length<2 ? '0' : '') + dec2hex(this.getR()) + (this.getG().length<2 ? '0' : '') + dec2hex(this.getG()) + (this.getB().length<2 ? '0' : '') + dec2hex(this.getB());
	}