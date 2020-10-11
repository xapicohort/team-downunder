(function($, window, document, undefined) {

    var win = $(window),
        doc = $(document);
		
	
	
//OVERLAY	
	
	function createOverlay(){
		var overlay = $("#lightbox_overlay");
		
		 if(!overlay.length){
            overlay = $("<div></div>", {
                "id": "lightbox_overlay",
                "class": "lightbox_overlay",
                "on": {
                    click: function() {
                        closeOverlay();
						closeLightbox();
                    }
                }
            }).hide().appendTo("body");
        }
		
		return overlay;
	}
	
	function showOverlay(){
		
		var overlay = createOverlay();
		overlay.css({
			width: doc.width(),
			height: doc.height()
		});
		
		overlay.fadeIn(500);
	}
	
	function closeOverlay(){
		var overlay = $("#lightbox_overlay");
		overlay.fadeOut(500);
	}
	
	
	
//LIGTBOX
	
	function createLightbox(index){
		
		var lightbox = $("#lightbox");
		
		if(!lightbox.length){
			lightbox = $("<div></div>", {
				"id": "lightbox",
				"class": "lightbox"
				
			}).appendTo("body");
		
		}

		return lightbox;
		
	}
	
	function closeLightbox(){
		var lightbox = $("#lightbox");
		lightbox.fadeOut(500);
		
		var closeBtn = $(".close");
		closeBtn.remove();
		
		var nextImgBtn = $(".next_img");
		nextImgBtn.remove();
		
		var prevImgBtn = $(".prev_img");
		prevImgBtn.remove();
		
		var spinner = $(".spinner");
		spinner.remove();

	}
	


	
	
//SHOW LIGHTBOX	
	
	function showLightbox(imgURL, index){
		
		showOverlay();
		
		var lightbox = createLightbox();
		
		lightbox.css({
			"width": 100,
			"height": 100,
			"top": (win.height()/2) + doc.scrollTop() - 50,
			"left": (win.width()/2) + doc.scrollLeft() - 50
		});
		
		var img = $("<img>", {
			"class": "lightbox_img"			
		});
		
		var closeBtn = $("<i></i>", {
			"class": "close fas fa-times",
			"on": {
				click: function(){
					closeOverlay();
					closeLightbox();
				}
			}
		}).css({
			top: doc.scrollTop() + 10,
			right: 10
		});
		lightbox.after(closeBtn.hide());
		
		
		var nextImgBtn = $("<i></i>", {
			"class": "next_img fas fa-chevron-circle-right",
			"on": {
				click: function(){
					var galLink = $(".gal_link");
					if(index < galLink.length - 1){
						index++;
					}else{
						index = 0;
					}
					
					nextPrevImg(imgURL, index);
					
				}
			}
		}).css({
			top: (win.height()/2) + doc.scrollTop() - 25
		});
		lightbox.after(nextImgBtn.hide());
		
		var prevImgBtn = $("<i></i>", {
			"class": "prev_img fas fa-chevron-circle-left",
			"on": {
				click: function(){
					var galLink = $(".gal_link");
					if(index > 0){
						index--;
					}else{
						index = galLink.length - 1;
					}
					
					nextPrevImg(imgURL, index);
					
				}
			}
		}).css({
			top: (win.height()/2) + doc.scrollTop() - 25
		});
		
		lightbox.after(prevImgBtn.hide());	
		
		var spinner = $("<span></span>", {
				"class": "spinner fas fa-spinner"
			});
			lightbox.append(spinner);
		
		
		img.on("load", function(){

			lightbox.find("img").remove()
				.end()
				.append(img.hide());
			
				
			var size = fitToImg(),
				imgMaxWidth = size.imgMaxWidth,
				imgMaxHeight = size.imgMaxHeight;
			
				
			lightbox.animate({
				width: imgMaxWidth,
				height: imgMaxHeight,
				top: (win.height()/2) + doc.scrollTop() - imgMaxHeight/2,
				left: (win.width()/2) + doc.scrollLeft()- imgMaxWidth/2
			}, 500, function(){
				img.fadeIn(500);
				closeBtn.fadeIn(500);
				nextImgBtn.fadeIn(500);
				prevImgBtn.fadeIn(500);
				spinner.fadeOut(500);
				
			});
			
		});
		
		
		img.attr("src", imgURL);
		
		lightbox.fadeIn(500);
						
	}
	
	
//NEXT AND PREV
	function nextPrevImg(imgURL, index){
		
		
		
		var lightbox = createLightbox(),
			img = lightbox.find("img");
			
		img.fadeOut(500);
		
		var imgNew = $("<img>", {
			"class": "lightbox_img"			
		});	
		
		imgURL = $(".gal_link").eq(index).attr("href");
		
		
		
		imgNew.on("load", function(){
			
			lightbox.find("img").remove()
				.end()
				.append(imgNew.hide());
				
			var spinner = $(".spinner");
			spinner.fadeIn(500);
			
			lightbox.append(spinner);

				
			var size = fitToImg(),
				imgMaxWidth = size.imgMaxWidth,
				imgMaxHeight = size.imgMaxHeight;
			
				
			lightbox.animate({
				width: imgMaxWidth,
				height: imgMaxHeight,
				top: (win.height()/2) + doc.scrollTop() - imgMaxHeight/2,
				left: (win.width()/2) + doc.scrollLeft()- imgMaxWidth/2
			}, 500, function(){
				imgNew.fadeIn(500);
				spinner.fadeOut(500);
			});
			
		});
		
		imgNew.attr("src", imgURL);
		
		
	}





//FIT TO IMAGE	
	function fitToImg(){
		
		var img = $(".lightbox_img");
		
		var imgWidth = img.width(),
			imgHeight = img.height(),
			imgMaxWidth = (90/100) * win.width(),
			imgMaxHeight = (90/100) * win.height();
				
			
		if(imgWidth/imgHeight > imgMaxWidth/imgMaxHeight){
			img.css({
				width: imgMaxWidth,
				height: "auto"
			});
			imgMaxHeight = img.height();
			
		}else{
			img.css({
				width: "auto",
				height: imgMaxHeight
			});
			imgMaxWidth = img.width();
			
		}
		
		var size = {"imgMaxWidth": imgMaxWidth, "imgMaxHeight": imgMaxHeight}

		return size;
	}
	

	
//RESIZE OR SCROLL


	function rsLightbox(){
		
		var overlay = createOverlay(),
			lightbox = createLightbox();
			
		overlay.css({
			width: doc.width(),
			height: doc.height()
		});
		
		var size = fitToImg(),
			imgMaxWidth = size.imgMaxWidth,
			imgMaxHeight = size.imgMaxHeight;
		
		lightbox.css({
			width: imgMaxWidth,
			height: imgMaxHeight,
			top: (win.height()/2) + doc.scrollTop() - imgMaxHeight/2,
			left: (win.width()/2) + doc.scrollLeft()- imgMaxWidth/2
		});
		
		var closeBtn = $(".close");
		closeBtn.css({
			top: doc.scrollTop() + 10,
			right: 10
		});
		
		var nextImgBtn = $(".next_img");
		nextImgBtn.css({
			top: (win.height()/2) + doc.scrollTop() - 25,
			right: 10
		});
		
		var prevImgBtn = $(".prev_img");
		prevImgBtn.css({
			top: (win.height()/2) + doc.scrollTop() - 25,
			left: doc.scrollLeft() + 10
		});
		
	}
	
	doc.on("scroll", rsLightbox);
	win.on("resize", rsLightbox);
	


	

	
//CLOSE	ESC
	

	

		
	doc.on("keyup", function(e){
		if(e.which === 27){
			closeOverlay();
			closeLightbox();
		}
	});

	


//MAIN FUNCTION
	
	$.fn.lightbox = function(){
		
		return this.each(function(){
			
			var that = $(this),
				imgURL = that.attr("href"),
				nextImgURL = that.next().attr("href"),
				index = that.index();
			
			that.on("click", function(e){
				e.preventDefault();
				
				showLightbox(imgURL, index);
	
				
			});

		});
	
	};
	
	
	
	
})(jQuery, window, document);