const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;
const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializedbandserver();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDbObjectToResponseObjectforapi3 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const query = `select * from movie;`;
  const res = await db.all(query);
  let myarr = [];
  for (let each of res) {
    let output = convertDbObjectToResponseObject(each);
    myarr.push(output);
  }
  response.send(myarr);
});
//API2
app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const query = `insert into movie(director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}'); `;
  const res = await db.run(query);
  response.send("Movie Successfully Added");
});
//API3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `select * from movie where movie_id=${movieId};`;
  const res = await db.get(query);
  let out = convertDbObjectToResponseObjectforapi3(res);
  response.send(out);
});
//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const moviedetailsof = request.body;
  const { directorId, movieName, leadActor } = moviedetailsof;
  const query = `update movie set director_id=${directorId},
    movie_name='${movieName}',lead_actor='${leadActor}' where movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Details Updated");
});
//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const query = `delete from movie where movie_id=${movieId};`;
  await db.run(query);
  response.send("Movie Removed");
});
//API6
app.get("/directors/", async (request, response) => {
  const query = `select * from director;`;
  const res = await db.all(query);
  let myarr = [];
  for (let each of res) {
    let o = { directorId: each.director_id, directorName: each.director_name };
    myarr.push(o);
  }
  response.send(myarr);
});
//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `select movie_name from movie where director_id=${directorId};`;
  const res = await db.all(query);
  let myarr = [];
  for (let each of res) {
    let o = { movieName: each.movie_name };
    myarr.push(o);
  }
  response.send(myarr);
});
module.exports = app;
