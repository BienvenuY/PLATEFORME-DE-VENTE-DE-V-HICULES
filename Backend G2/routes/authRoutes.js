const authControllers=require("../controllers/authControllers");
const  express=require("express");
const router=express.Router();


router.route("/register").post(authControllers.register);
router.route("/login").post(authControllers.login);
router.route("/refresh").get(authControllers.refresh);
router.route("/logout").post(authControllers.logout);



     
module.exports = router;