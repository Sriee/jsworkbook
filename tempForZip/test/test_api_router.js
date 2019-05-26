var supertest = require("supertest");
var app = require("../app");

describe("plain text response", () => {

	it("returns correct status codes", (done) => {
		supertest(app)
			.get("/api/v1")
			.expect(200)
			.expect((res) => {
				if(res.text !== "You have accessed /api/v1."){
					throw new Error("Response text doesn't match");
				}
			});
			done();
	});
/*
	it("returns wrong status codes", function (done) {

	});

	if("returns correct response message", function (done) {

	});
	*/
});