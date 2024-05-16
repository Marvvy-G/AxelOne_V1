const User = require("../model/user");
const Post = require("../model/posts");
const Comment = require("../model/comments");
const asyncErrorHandler = require("./../utils/asyncErrorHandler")
const CustomError = require("./../utils/CustomError")

//create post
exports.createPost = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }
        
        // Create the post with the author field set to the user's ID
        const newPost = await Post.create({
            ...req.body,
            author: user._id
        });
        
        user.newPost.push(newPost);
        await user.save();
        
        res.status(201).json({
            status: "success",
            data: {
                newPost
            }
        });
    } catch (error) {
       console.log(error);
    } next()
};


//get post
exports.getPosts = async (req, res, next) => {
    try{
        const posts = await Post.find().populate("comments");
        res.status(200).json({
            status: "success",
            data: {
                posts
            }
        })
    } catch (err)
    {console.log(err)} next();
}

//edit post
exports.editPost = async (req, res, next) => {
    try {
        console.log("Authenticated user:", req.User); // Log the authenticated user
        console.log("Request params:", req.params); // Log request parameters

        // Check if the user is authenticated
        if (!req.User) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        const { userId, postId } = req.params;

        // Log the query being made to the database
        console.log(`Finding post with _id: ${postId} and author: ${userId}`);

        // Find the post by user ID and post ID
        const post = await Post.findOne({ _id: postId, author: userId });

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ status: "error", message: "Post not found" });
        }

        // Check if the authenticated user is the author of the post
        if (post.author.toString() !== req.User._id.toString()) {
            return res.status(403).json({ status: "error", message: "Unauthorized to edit this post" });
        }

        // Update the post with the request body
        const updatedPost = await Post.findByIdAndUpdate(postId, req.body, { new: true, runValidators: true });

        // Return the updated post
        return res.status(200).json({ status: "success", data: { updatedPost } });
    } catch (err) {
        // Handle errors
        console.error(err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};


//delete Post
exports.deletePost = async(req, res, next) => {
    try {
               if (!req.User) {
            return res.status(401).json({ status: "error", message: "Unauthorized" });
        }

        const { userId, postId } = req.params;

        // Log the query being made to the database
        console.log(`Finding post with _id: ${postId} and author: ${userId}`);

        // Find the post by user ID and post ID
        const post = await Post.findOne({ _id: postId, author: userId });

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ status: "error", message: "Post not found" });
        }

        // Check if the authenticated user is the author of the post
        if (post.author.toString() !== req.User._id.toString()) {
            return res.status(403).json({ status: "error", message: "Unauthorized to delete this post" });
        }

         await Post.findByIdAndDelete(req.params.id)
          res.status(200).json({
        status: "Post has been successfully deleted"
    })
} catch (err){
    console.log({status: "Delete failed"})
} next();
}

//create comment
exports.createComment = async (req, res, next) => {
    try {
        // Find the user who is creating the comment
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        // Find the post the comment is associated with
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found' });
        }

      
        // Create the new comment
        const newComment = await Comment.create({
            ...req.body,
            author: user._id, // Ensure correct assignment of user ID
            post: post._id
        });

        // Add the new comment to the post's comments array
        post.comments.push(newComment);
        await post.save();

        res.status(201).json({
            status: 'success',
            data: {
                newComment
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


//edit comment
exports.editComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        
        // Find the comment by its ID
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }
        
        // Check if the user making the request is the author of the comment
        if (comment.author.toString() !== req.User._id.toString()) {
            return res.status(403).json({ status: 'error', message: 'You are not authorized to edit this comment' });
        }
        
        // Update the comment content
        comment.comments = req.body.comments;
        
        // Save the updated comment
        await comment.save();
        
        res.status(200).json({ status: 'success', message: 'Comment updated successfully', data: comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

//delete comment
exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;

        // Find the comment by its ID
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        // Check if the user making the request is the author of the comment or the author of the post
        if (comment.author.toString() !== req.User._id.toString() && post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ status: 'error', message: 'You are not authorized to delete this comment' });
        }

        // Remove the comment from the database
        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};


