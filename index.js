import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3001;

const db=new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "chedi12345",
  port: 5432,

})
db.connect()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function visited(){
  const result =await db.query('SELECT * FROM visited_countries')
  let resp=[]
  result.rows.forEach(element=>{
    resp.push(element.country_code)
  })
  return resp
}

app.get("/", async (req, res) => {
  const  countries=await visited()
  res.render("index.ejs",{countries: countries,total: countries.length})
});
app.post('/add', async (req, res) => {
  const first = req.body["country"][0].toUpperCase();
  const second=req.body["country"].slice(1).toLowerCase()
  const input=first+second
  console.log(input)

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE country_name = $1",
      [input]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await visited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await visited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
  
 
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
