import express from "express";
const router = express.Router();
import { Post } from "../models/modelPost.js";
import { User } from "../models/modelUser.js"


// create post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savePost = await newPost.save();
        res.status(200).json(savePost);
    } catch (err) {
        res.status(500).json(err);
    }
})

// update post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("the post has been updated!")
        } else {
            res.status(403).json("you can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

// delete post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has deleted!")
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// like post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // if userId not included in array then include onces.
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId }});
            res.status(200).json("the post has liked!")
        } else {
            // if userId already included in array then remove onces.
            await post.updateOne({ $pull: { likes: req.body.userId }})};
            res.status(200).json("the post been disliked!")
    }catch(err){
        res.status(500).json(err);
    };
});

// get a post
router.get("/:id", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    };
});

// get time line 
router.get("/timeline/:userId", async (req, res) => {  
    try{
        
        const currentUser = await User.findById(req.params.userId);
        // make equal  modelPost userId to userDataBase in _id
        const userPosts = await Post.find({userId: currentUser._id});
        // fetch all map data use Promise.all.
        const friendPosts = await Promise.all(
            // show all currentUser following users post.
            currentUser.followings.map(friendId => {
             return Post.find({ userId: friendId })
            })
        );
        // show current user post plus following user posts.
        res.status(200).json(userPosts.concat(...friendPosts));
    }catch(err){
        res.status(500).json(err);
    }
});

// get user's all post
router.get("/profile/:username", async (req, res) => {  
    try{
        const user = await User.findOne({username: req.params.username});
        const posts = await Post.findOne({userId: user._id});
        res.status(200).json(posts);      
    }catch(err){
        res.status(500).json(err);
    }
});


export default router;