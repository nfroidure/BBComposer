var ewkLib=
	{
	newEventHandler: function(obj,method)
		{
		var fx = method;
		return function () { return fx.apply(obj, arguments); }
		}
	};