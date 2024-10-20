const router = require("express").Router();
const {
  addMovie,
  getAllMovies,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");
const { validateJWTToken } = require("../middleware/authorizationMiddleware");

router.post("/addMovie", validateJWTToken, addMovie);
router.get("/getAllMovies", validateJWTToken, getAllMovies);
router.patch("/updateMovie", validateJWTToken, updateMovie);
router.delete("/deleteMovie/:movieId", validateJWTToken, deleteMovie);

module.exports = router;
