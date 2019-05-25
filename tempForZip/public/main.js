$(function() {
	var $h1 = $("h1");
	var $zip = $("input[name='zip']");

	$("form").on("submit", function(event) {
		event.preventDefault();

		var zipcode = $.trim($zip.val());
		$h1.text("Loading...");

		var request = $.ajax({
			url: "/" + zipcode,
			dataType: "json"
		});

		request.done(function(data) {
			$h1.html("It's " + data.temperature + "&#176; in " + zipcode + ".");
		});

		request.fail(function(){
			$h1.text("Error!.");
		});
	});

});