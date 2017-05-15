$("#buttonNav").append($("<button>", { text: "hello", "class": "button" }));

var gifTastic = {
    topicArray: ["cat", "dog", "car"],

    buttonCreator: function() {
        $(".buttonCreator").remove();
        for (var i = 0; i < this.topicArray.length; i++) {
            $("#buttonNav").append($("<button>", { "class": "buttonCreator button", text: this.topicArray[i] }))
        };
    },

    arrayExtender: function(newWord) {
        this.topicArray.push(newWord);
        this.buttonCreator();
        this.clickListener();
    },

    clickListener: function() {
        // listener for all buttons topic buttons and submit and reset buttons
        $(".button").off().click(function(event) {
            if ($(this).hasClass("buttonCreator")) {
                gifTastic.apiPull($(this).text());
            } else if ($(this).hasClass("inputButton")) {
                event.preventDefault();
                let newInput = $("#newInput").val().trim();
                gifTastic.arrayExtender(newInput);
            } else {
                console.log($(this).text());
            }
        })

        $(".gif").click(function() {
            console.log(this);
            gifTastic.imgSwitch(this);
        })
    },

    apiPull: function(searchWord) {
        let apiKey = "dc6zaTOxFJmzC";
        let topic = searchWord;
        let queryURL = "http://api.giphy.com/v1/gifs/search?q=" + topic + "&api_key=" + apiKey + "&limit=10";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(
            function(response) {
                console.log(queryURL);
                console.log(response);
                gifTastic.imgLayout(response);
            }
        );
    },

    imgLayout: function(objArray) {

        $("#picDisplay").empty();

        $.each(objArray.data, function(index, val) {
            // console.log(index, val);
            // console.log(val.rating);

            let gifContainer = $("<div>", { "class": "gifImg" });

            let ratingContainer = $("<div>", { "class": "ratingContainer" });
            let rating = val.rating;
            let ratingText = $("<p>", { "class": "ratingText", text: "Rating: " + rating });
            ratingContainer.append(ratingText);
            gifContainer.append(ratingContainer);

            let imgContainer = $("<div>", { "class": "imgContainer" });
            let imgStillURL = val.images.fixed_height_still.url;
            let imgMovURL = val.images.fixed_height.url;
            let imgContent = $("<img>", { "src": imgStillURL, "imgStill": imgStillURL, "imgMov": imgMovURL, "class": "gif", "currentState": "still" });
            imgContainer.append(imgContent);
            gifContainer.append(imgContainer);

            $("#picDisplay").append(gifContainer);
        })
        this.clickListener();
    },

    imgSwitch: function(img) {
    	let image = $(img);
    	let currState = image.attr("currentState");
    	let imgStillURL = image.attr("imgStill");
    	let imgMovURL = image.attr("imgMov");

    	currState == "still" ? (
    		image.attr("src",imgMovURL),
    		image.attr("currentState","mov"),
    		console.log("inside true ter")
    	):(
    		image.attr("src",imgStillURL),
    		image.attr("currentState","still"),
    		console.log("inside false ter")
    	);
    },

    initialize: function(){
    	
    	$(".buttonCreator").remove();
    	$("#picDisplay").empty();

    	this.buttonCreator();
    	this.clickListener();
    }

}

gifTastic.initialize();