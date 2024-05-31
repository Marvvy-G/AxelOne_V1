const router = require("express").Router();
const userController = require("./../controllers/userController");
const postController = require("./../controllers/postControllers")
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:true}));

//Create Post
// router.route("/create/:id").post(userController.authenticate, postController.createPost);

//Get Posts
router.route("/posts").get(postController.getPosts);

//edit Post
router.route("/editPost/:userId/:postId").patch(userController.protect, postController.editPost);

//Delete post
router.route("/delete/:userId/:postId").delete(userController.protect,
                                        postController.deletePost);

//Create Comment
router.route("/createComment/:userId/:postId").post(userController.protect,
                                    postController.createComment);
//Edit Comment
router.route("/editComment/:commentId").patch(userController.protect,
                                    postController.editComment );
//Delete Comment
router.route("/deleteComment/:commentId").delete(userController.protect,
                                    postController.deleteComment);
module.exports = router;
