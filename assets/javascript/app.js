$("#buttonNav").append($("<button>", { text: "clear", "class": "button btnClr" }));

var gifTastic = {

    //starting array with default words
    topicArray: ["chili pepper", "ghost pepper", "jalapeno"],

    //creates buttons from topic array. Buttons are removed and recreated each time function is called. Any buttons created by the function will have the "buttonCreator" class.
    buttonCreator: function() {
        //removes buttons created by the function before recreating whole array.
        $(".buttonCreator").remove();
        //creates buttons for the current elements in the topic array
        for (var i = 0; i < this.topicArray.length; i++) {
            $("#buttonNav").append($("<button>", { "class": "buttonCreator button", text: this.topicArray[i] }))
        };
    },

    //pushed passed newWord into the topic then calls button creator to display new word and re-initializes click listener for newly created buttons
    arrayExtender: function(newWord) {
        //pushing newWord into topic array
        this.topicArray.push(newWord);
        //calls button creator function to recreate buttons including newWord
        this.buttonCreator();
        //reinitializing click listener
        this.clickListener();
    },

    //one function to listen for all clicks on the page. Depending on what is clicked function will redirect to the appropriate function after doing all necessary logic checks. Clicks are distinguished by element classes.
    clickListener: function() {
        // listener for all buttons topic buttons and submit and reset buttons. All buttons are given the class "button".
        $(".button").off().click(function(event) {
            //if clicked button was created by the button creator (all topic buttons) then pull the corresponding api information 
            if ($(this).hasClass("buttonCreator")) {
                //passing the text value of the button clicked to the apiPull function
                gifTastic.apiPull(($(this).text()), ($("#picDisplay").data("dispSize")));
                //changes the styling of the button to show what was selected
                gifTastic.buttonActiveSwitch(this);
                $("#picDisplay").data("topic", $(this).text());
                $("#picDisplay").data("offset", 0);
                //if the form submit button was clicked then pass text field value to the array extender function.
            } else if ($(this).hasClass("inputButton")) {
                //prevent default functionality of form
                event.preventDefault();
                //store text field value in "newInput" remove preceding or proceeding white space and convert to lowercase.
                let newInput = $("#newInput").val().trim().toLowerCase();
                //if "newInput" is blank, white space, or already exists in the array then break out of the loop.
                if (newInput == "" || gifTastic.topicArray.indexOf(newInput) !== -1) {
                    return;
                    //if "newInput" is a new word then call array extender and pass "newInput" as a parameter
                } else {
                    gifTastic.arrayExtender(newInput);
                }
                //clear out the text field once done
                $("#newInput").val("");
                //if the settings buttons are called then call api pull and pass text value of the button as the new limit
            } else if ($(this).hasClass("btnDispSize")) {
                //passing the text value of the button as the second parameter for the api pull function
                let topic = $("#picDisplay").data("topic");
                if (topic) {
                    gifTastic.apiPull(topic, ($(this).text()));
                }
                //changes the styling of the button to show what was selected
                gifTastic.buttonActiveSwitch(this);
                $("#picDisplay").data("dispSize", ($(this).text()))
                $("#picDisplay").data("offset", 0);
                   
            } else if ($(this).hasClass("btnClr")) {
                gifTastic.initialize();
            } else if($(this).hasClass("nxtPageBtn")){
                gifTastic.nxtPage();
            } else if($(this).hasClass("prvPageBtn")){
                gifTastic.prvPage();             
            //catch all scenario for the any button press that don't fall in the above scenarios
            } else {
                //log the text value of the btton clicked
                console.log($(this).text());
            }
        })

        //listener for gif image click
        $(".gif").click(function() {
            // console.log(this);
            // initializes img switch function for the clicked image
            gifTastic.imgSwitch(this);
        })
    },

    apiPull: function(searchWord, resultNum, nextSet) {
        let apiKey = "dc6zaTOxFJmzC";
        let topic = searchWord || "";
        let limit = resultNum || 10;
        let offset = nextSet || 0;
        let queryURL = "https://api.giphy.com/v1/gifs/search?q=" + topic + "&api_key=" + apiKey + "&limit=" + limit + "&offset=" + offset;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(
            function(response) {
                // console.log(queryURL);
                // console.log(response);
                gifTastic.imgLayout(response);
                gifTastic.statisticsLayout(response, topic);
            }
        );
    },

    imgLayout: function(objArray) {
        $("#picDisplay").empty();

        $.each(objArray.data, function(index, val) {
            // console.log(index, val);
            // console.log(val.rating);

            let gifContainer = $("<div>", { "class": "gifImg element" });

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
        // this.clickListener();
    },

    imgSwitch: function(img) {
        let image = $(img);
        let currState = image.attr("currentState");
        let imgStillURL = image.attr("imgStill");
        let imgMovURL = image.attr("imgMov");

        currState == "still" ? (
            image.attr("src", imgMovURL),
            image.attr("currentState", "mov")
            // console.log("inside true ter")
        ) : (
            image.attr("src", imgStillURL),
            image.attr("currentState", "still")
            // console.log("inside false ter")
        );
    },

    buttonActiveSwitch: function(buttonClicked) {
        let parent = $(buttonClicked).parent();
        $(parent).children().removeClass("activeButton");

        $(buttonClicked).addClass("activeButton");
    },

    statisticsLayout: function(objArray, topic) {
        let statisticsObj = objArray.pagination;
        let total_count = statisticsObj.total_count;
        let dispSize = statisticsObj.count;
        let offset = statisticsObj.offset;

        let totalPages = Math.ceil(total_count / dispSize);
        let currPage = (offset / dispSize) + 1;

        // console.log(totalPages, currPage);

        $(".statisticsText").remove();
        $(".pageNav").remove();

        $("#statistics").append($("<p>", { "class": "statisticsText", text: "There are " + total_count + " available " + topic + " gifs." }));
        $("#statistics").append($("<p>", { "class": "statisticsText", text: "Page: " + currPage + " of " + totalPages }));
        $("#statistics").append($("<div>",{"class":"pageNav"})
                .append($("<button>", {"class":"button nxtPageBtn", text:"Next"}))
                .append($("<button>", {"class":"button prvPageBtn", text:"Previous"})));

        this.clickListener();
    },

    nxtPage: function(){
        let offset = $("#picDisplay").data("offset");
        let count = parseInt($("#picDisplay").data("dispSize"));
        let topic = $("#picDisplay").data("topic");

        // console.log(offset,count);
        offset += count;

        $("#picDisplay").data("offset",offset);

        this.apiPull(topic, count, offset);
        // console.log(offset);
    },

    prvPage: function(){
        let offset = $("#picDisplay").data("offset");
        let count = parseInt($("#picDisplay").data("dispSize"));
        let topic = $("#picDisplay").data("topic");

        // console.log(offset,count);
        if (offset === 0) {
            return;
        } else {
            (offset -= count);
        };

        $("#picDisplay").data("offset",offset);

        this.apiPull(topic, count, offset);
        // console.log(offset);
    },

    initialize: function() {
        $(".buttonCreator").remove();
        $("#picDisplay").empty().removeData(["topic","offset"]);

        if($("#picDisplay").data("dispSize")==undefined){
            // console.log(true);
            $("#picDisplay").data("dispSize",10);
        }

        $(".statisticsText").remove();
        $(".pageNav").empty();
        // console.log($("#picDisplay").data());
        this.buttonCreator();
        this.clickListener();
    }

}

gifTastic.initialize();
