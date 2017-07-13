var Shape = (function(){
	
	var Shape, Square, Rectangle, Circle, Populate;
	
	// Create a base Shapw constructor for later extending
	Shape = function(x,y){
		this.x = Number(x) || 0;
		this.y = Number(y) || 0
	}
	
	// Define properties and methods to be inherited by all shapes
	Shape.prototype = {
		
		// This property is used to keep track of what type of shape is represented
		type: "shape",
		
		// This array holds instructions on how to style the DOM element representation of the shape
		styles: [ { css: "top", from: "y", after: "px" }, { css: "left", from: "x", after: "px" } ],
		
		// This array holds a list of classes that will get applied to the DOM element
		classes: [ "shape" ],
		
		// This method will create and return a DOM Element based on the objects properties
		make: function(){
			var shape = this,
				ele = document.createElement("SPAN");
			
			shape.styles.forEach(function(item, index){
				if(typeof item === "function") item = item.call(shape);
				if(typeof item === "object")
					ele.style[item.css] = ((typeof item.from === "function") ? item.from.call(shape): shape[item.from]) + (item.after || "");
			});
			
			ele.className = shape.classes.join(" ");
			
			return ele
		},
		
		// This method takes a DOM Element as 'into' and injects another element made from the object
		inject: function(into){
			if(!into || !into.appendChild) return false;
			var el = this.make();
			into.appendChild(el);
			
			return el
		},
		
		// This method will take an array of shape objects and check to see if any of them collide with the target
		// If any of them do collide it will pass them into the callback method
		isCollided: function(shapes, pass, fail){
			var target = this, 
				width = target.width || (target.radius*2),
				height = target.height || (target.radius*2),
				left = target.x, top = target.y,
				right = left + width, bottom = top + height;

			shapes.forEach(function(item, index){
				var iwidth = item.width || (item.radius*2), iheight = item.height || (item.radius*2),
					ileft = item.x, itop = item.y,
					iright = ileft + iwidth, ibottom = itop + iheight,
					collision = (iright < left || ileft > right || ibottom < top || itop > bottom);
				
				if( !collision && typeof pass === "function" ) pass.call(item, index);
				else if(typeof fail === "function") fail.call(item, index)
			})
		}
	}
	
	// Create a constructor for making rectangles
	Rectangle = function(x,y,width,height){
		this.x = (Number(x) - (Number(width)/2)) || 0;
		this.y = (Number(y) - (Number(height)/2)) || 0;
		this.width = Number(width) || 0;
		this.height = Number(height) || 0;
	}
	
	// Create a Rectangle prototype by extending Shape's prototype
	Rectangle.prototype = (function(){
		var rectProto = new Shape(0,0);
		
		(rectProto.styles = rectProto.styles.slice(0)).push(
			{ css: "width", from: "width", after: "px"},
			{ css: "height", from: "height", after: "px"}
		);
		
		(rectProto.classes = rectProto.classes.slice(0)).push("rectangle");
		
		rectProto.type = "rectangle";
		
		return rectProto
	})();
	
	// Create a constructor for making squares
	Square = function(x,y,width){
		this.x = (Number(x) - (Number(width)/2)) || 0;
		this.y = (Number(y) - (Number(width)/2)) || 0;
		this.width = Number(width) || 0;
		this.height = Number(width) || 0;
	}
	
	// Create a Square prototype by extending Shape's prototype
	Square.prototype = (function(){
		var squareProto = new Shape(0,0);
		
		(squareProto.styles = squareProto.styles.slice(0)).push(
			{ css: "width", from: "width", after: "px"},
			{ css: "height", from: "height", after: "px"}
		);
		
		(squareProto.classes = squareProto.classes.slice(0)).push("square");
		
		squareProto.type = "square";
		
		return squareProto
	})();
	
	// Create a constructor for making circles
	Circle = function(x,y,radius){
		this.x = (Number(x) - Number(radius)) || 0;
		this.y = (Number(y) - Number(radius)) || 0;
		this.radius = Number(radius) || 0;
	}
	
	// Create a Circle prototype by extending Shape's prototype
	Circle.prototype = (function(){
		var circleProto = new Shape(0,0);
		
		(circleProto.styles = circleProto.styles.slice(0)).push(
			{ css: "width", after: "px", from: function(){ return this.radius*2 }},
			{ css: "height", after: "px", from: function(){ return this.radius*2 }},
			{ css: "MozBorderRadius", after: "px", from: "radius" },
			{ css: "WebkitBorderRadius", after: "px", from: "radius" },
			{ css: "borderRadius", after: "px", from: "radius" }
		);
		
		(circleProto.classes = circleProto.classes.slice(0)).push("circle");
		
		circleProto.type = "circle";
		
		return circleProto;
	})();
	
	// Take in a semi-colon separated list of shape properties and put them into the dom
	Populate = function(context, list){
		if(!context || !context.nodeName || typeof list !== "string") return false;
	
		var list = list.split(";"),
			shapes = [];
	
		list.forEach(function(item, index){
			if(!item.length) return;
			var bits = item.split(","), type = bits.shift(),
				obj = new Shape[type](bits[0],bits[1],bits[2],bits[3]);
		
			if(Shape[type] && obj && shapes.push(obj)) obj.inject(context).setAttribute("data-uid", index)
		});
	
		// Creating a listener event om the context object to do collision detection
		context.addEventListener("click", function(e){
			var target = e.target, 
				span = (target.nodeName === "SPAN");
			
			if(span) shapes[target.getAttribute("data-uid")].isCollided( shapes,
				function(uid){ context.querySelector("span[data-uid='" + uid + "']").style.display = "block" },
				function(uid){ context.querySelector("span[data-uid='" + uid + "']").style.display = "none" }
			);
			else shapes.forEach(function(item, uid){
				context.querySelector("span[data-uid='" + uid + "']").style.display = "block";
			})	
		})
	}
	
	// Create shortcut methods off of Shape
	Shape.square = Square;
	Shape.rectangle = Rectangle;
	Shape.circle = Circle;
	Shape.populate = Populate;
	
	return Shape;
	
})();